import "dotenv/config";
import express from "express";

import User from "../models/User.js";
import Role from "../models/Role.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} from "../auth/tokens.js";
import { setRefreshCookie, clearRefreshCookie } from "../utils/cookies.js";
import { sendMail } from "../utils/mailer.js";
import {
  makeRawToken,
  hashToken,
  hoursFromNow,
  verifyHashedToken,
  minutesFromNow,
} from "../utils/oneTimeTokens.js";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { requireAuth } from "../auth/middleware.js";
import { generateBackupCodes, hashBackupCodes } from "../utils/backupCodes.js";
import { matchAndRemoveBackupCode } from "../utils/backupCodes.js";
import {
  loginLimit,
  forgotLimit,
  refreshLimit,
  verifyLimit,
} from "../utils/rateLimit.js";
import { audit } from "../utils/audit.js";
import { pickHomePath } from "../auth/home.js";

const router = express.Router();

//SIGNUP ROUTE
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    //1. check if user exist
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ error: "User already exists" });
    }

    //2. hash the plain text password
    const passwordHash = await hashPassword(password);

    //3. find the user role (default role)
    const userRole = await Role.findOne({ name: "user" });
    if (!userRole) {
      return res.status(500).json({ error: "Default role not found" });
    }

    // 4. create the new user with default role
    const user = await User.create({
      email,
      name,
      passwordHash,
      roles: [userRole._id],
    });

    //5.  send verification email and verify user
    const hexedRawToken = makeRawToken(32);
    user.emailVerifyTokenHash = await hashToken(hexedRawToken);
    user.emailVerifyTokenExpiresAt = hoursFromNow(24);
    await user.save();

    const verifyUrl = `${
      process.env.APP_BASE_URL
    }/api/auth/verify-email?token=${hexedRawToken}&email=${encodeURIComponent(
      user.email
    )}`;

    await sendMail({
      to: user.email,
      subject: "Verify your email",
      html: `<p>Hi ${
        user.name || ""
      },</p><p><a href="${verifyUrl}">Verify Email</a>(valid 24h)</p>`,
    });

    // 6. return minimal user info
    res.status(201).json({
      id: user._id,
      email: user.email,
      role: userRole.name,
    });
  } catch (error) {
    console.error("❌ register failed: ", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

//VERIFY EMAIL
router.get("/verify-email", verifyLimit, async (req, res) => {
  const { token, email } = req.query || {};
  if (!token || !email)
    return res.status(400).json({ errorMessage: "Missing token/email" });

  const user = await User.findOne({ email });
  if (!user || !user.emailVerifyTokenHash)
    return res.status(400).json({ errorMessage: "Invalid link" });
  if (
    !user.emailVerifyTokenExpiresAt ||
    user.emailVerifyTokenExpiresAt < new Date()
  )
    return res.status(400).json({ errorMessage: "Link expired" });

  const ok = await verifyHashedToken(token, user.emailVerifyTokenHash);
  if (!ok) return res.status(400).json({ errorMessage: "Invalid link" });

  user.emailVerified = true;
  user.emailVerifyTokenHash = undefined;
  user.emailVerifyTokenExpiresAt = undefined;
  await user.save();

  //AuditLog
  await audit({ userId: user._id, event: "email.verified", req });

  return res.status(200).json({ ok: true, message: "Email verified" });
});

//LOGIN ROUTE
router.post("/login", loginLimit, async (req, res) => {
  const { email, password } = req.body;

  //1. find user and populate roles + permissins
  const user = await User.findOne({ email }).populate({
    path: "roles",
    populate: "permissions",
  });
  if (!user) {
    await audit({ event: "login.failed", req, meta: { email } });
    return res.status(401).json({ error: "Invalid credentials" });
  }

  //2. CHECK VERIFICATION STATUS
  if (!user.emailVerified)
    return res.status(403).json({ error: "Email not verified" });

  //3. verify password
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  //2FA
  if (user.twoFactorEnabled) {
    const { totp, backupCode } = req.body || {};

    let okTotp = false;

    if (totp) {
      okTotp = authenticator.verify({
        token: String(totp || ""),
        secret: user.twoFactorSecret,
      });
    }

    let okBackup = false;
    let usedIndex = -1;

    if (!okTotp && backupCode) {
      usedIndex = await matchAndRemoveBackupCode(
        backupCode,
        user.backupCodesHash || []
      );
      okBackup = usedIndex !== -1;
    }

    if (!okTotp && !okBackup) {
      await audit({ userId: user._id, event: "login.failed", req });
      return res.status(401).json({ error: "MFA required or invalid code" });
    }

    // if (okBackup) {
    //   if (!Array.isArray(user.backupCodesHash)) user.backupCodesHash = [];
    //   user.backupCodesHash.splice(usedIndex, 1);
    // }

    if (okBackup) {
      // Find the actual hash that matched
      const canonIdx = await matchAndRemoveBackupCode(
        backupCode,
        user.backupCodesHash || []
      );
      const usedHash = user.backupCodesHash[canonIdx];

      // Atomically remove that hash from DB (safer than splice+save)
      await User.updateOne(
        { _id: user._id },
        { $pull: { backupCodesHash: usedHash } }
      );
    }
  }

  //4. extract roleNames & permissions
  const roleNames = user.roles.map((r) => r.name);
  const permissions = [
    ...new Set(user.roles.flatMap((r) => r.permissions.map((p) => p.name))),
  ];

  //5. create tokens
  const accessToken = signAccessToken({
    sub: user._id.toString(),
    roleNames,
    permissions,
  });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });

  //6.  save refresh token to DB
  user.refreshTokens.push(refreshToken);
  await user.save();

const nextPath = pickHomePath(roleNames)

  //7. set refresh cookie
  setRefreshCookie(res, refreshToken);

  //AuditLog
  await audit({ userId: user._id, event: "login.success", req });

  //8. send response with access token + user info
  res.status(200).json({
    accessToken,
    nextPath,
    user: {
      id: user._id,
      email: user.email,
      roleNames,
      permissions,
    },
  });
});

//2FA BACKUP CODES
router.get("/2fa/backup/status", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub).lean();
  const count = user?.backupCodesHash?.length || 0;
  res.json({ count });
});

//2FA SETUP
router.post("/2fa/setup", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user)
      return res.status(404).json({
        error: "User not found",
      });

    if (!user.emailVerified)
      return res.status(403).json({ error: "Verify email first" });

    //1. make a new secret
    const secret = authenticator.generateSecret();

    //2. build otpAuth URL
    const label = encodeURIComponent(`Orderly:${user.email}`);
    const issuer = encodeURIComponent("Orderly");
    const otpauth = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`;

    //3. make QR code data URL
    const qr = await QRCode.toDataURL(otpauth);

    //4. save secret temporarily
    user.twoFactorSecret = secret;
    await user.save();

    // In dev you can also return the secret; avoid in prod
    const payload = { otpauth, qr };
    if (process.env.NODE_ENV !== "production") payload.secret = secret;

    return res.status(200).json(payload);
  } catch (error) {
    console.error("[2fa/setup] failed: ", error);
    res.status(500).json({ error: "Server error" });
  }
});

//ENABLE 2FA
router.post("/2fa/enable", requireAuth, async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code)
      return res.status(400).json({ errorMessage: "Code is required" });

    const user = await User.findById(req.user.sub);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ errorMessage: "No setup in progress" });
    }

    const ok = authenticator.verify({
      token: String(code),
      secret: user.twoFactorSecret,
    });
    if (!ok) return res.status(400).json({ errorMessage: "Invalid code" });

    user.twoFactorEnabled = true;
    await user.save();

    //AuditLog
    await audit({ userId: user._id, event: "2fa.enabled", req });
    res.json({ ok: true });
  } catch (error) {
    console.error("[2fa/enable] failed: ", error);
    res.status(500).json({ errorMessage: "Server error" });
  }
});

//DISABLE 2FA
router.post("/2fa/disable", requireAuth, async (req, res) => {
  try {
    const { code } = req.body || {};
    const user = await User.findById(req.user.sub);
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ errorMessage: "2FA not enabled" });
    }

    const ok = authenticator.verify({
      token: String(code || ""),
      secret: user.twoFactorSecret,
    });
    if (!ok) return res.status(400).json({ errorMessage: "Invalid code" });

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    //AuditLog
    await audit({ userId: user._id, event: "2fa.disabled", req });

    res.json({ ok: true });
  } catch (error) {
    console.error("[2fa/disable] failed: ", error);
  }
});

//FORGOT PASSWORD
router.post("/forgot-password", forgotLimit, async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email)
      return res.status(400).json({ errorMessage: "Email is required" });

    const normalizedEmail = email.toLowerCase();

    // 1) Make RAW token for the email link + hash for DB
    const rawResetToken = makeRawToken(32);
    const resetTokenHash = await hashToken(rawResetToken);

    // 2) Persist hash + expiry if the user exists
    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          resetTokenHash,
          resetTokenExpiresAt: minutesFromNow(15),
        },
      },
      { new: true }
    );

    // 3) If user exists, send the email with the RAW token in the URL
    if (user) {
      const resetUrl = `${
        process.env.CLIENT_BASE_URL
      }/reset-password?token=${rawResetToken}&email=${encodeURIComponent(
        normalizedEmail
      )}`;
      await sendMail({
        to: normalizedEmail,
        subject: "Reset your password",
        html: `
          <p>You (or someone else) requested a password reset.</p>
          <p><a href="${resetUrl}">Reset Password</a> (valid for 15 minutes)</p>
          <p>If you did not request this, you can ignore this email.</p>
        `,
      });
    }

    // 4) Always respond 200
    await audit({
      userId: user?._id,
      event: "password.forgot.requested",
      req,
      meta: { email },
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[forgot-password] failed:", error);
    return res.status(500).json({ errorMessage: "Server error" });
  }
});

//RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};
    if (!email || !token || !newPassword) {
      return res
        .status(400)
        .json({ errorMessage: "Email, token, and newPassword are required" });
    }

    // Normalize email if you store lowercased
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.resetTokenHash || !user.resetTokenExpiresAt) {
      return res.status(400).json({ errorMessage: "Invalid reset" });
    }

    // 2) Check expiry
    if (user.resetTokenExpiresAt < new Date()) {
      return res.status(400).json({ errorMessage: "Reset link expired" });
    }

    // 3) Verify raw token vs stored hash
    const ok = await verifyHashedToken(token, user.resetTokenHash);
    if (!ok) return res.status(400).json({ errorMessage: "Invalid reset" });

    // 4) Hash new password
    const passwordHash = await hashPassword(newPassword);

    // 5) Atomic update: set new pw, clear reset fields, revoke all refresh tokens
    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: { passwordHash, refreshTokens: [] },
        $unset: { resetTokenHash: 1, resetTokenExpiresAt: 1 },
      }
    );

    //AuditLog
    await audit({ userId: user._id, event: "password.reset.success", req });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[reset-password] failed:", error);
    return res.status(500).json({ errorMessage: "Server error" });
  }
});

//REFRESH ROUTE
router.post("/refresh", refreshLimit, async (req, res) => {
  try {
    //1. read refresh cookie
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: "no refresh token" });
    }

    //2. verify signature
    const { sub } = verifyRefresh(token);

    //3. load user and their roles/permissions
    const user = await User.findById(sub).populate({
      path: "roles",
      populate: "permissions",
    });
    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(401).json({ error: "refresh revoked" });
    }

    //4. rebuild roleNames + permissions
    const roleNames = user.roles.map((r) => r.name);
    const permissions = [
      ...new Set(user.roles.flatMap((r) => r.permissions.map((p) => p.name))),
    ];

    //5. mint new access token
    const accessToken = signAccessToken({
      sub,
      roleNames,
      permissions,
    });

    //6. return it
    res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        roleNames,
        permissions,
      },
    });
  } catch (error) {
    console.error("refresh failed: ", error.message);
    res.status(401).json({
      error: "Invalid refresh",
    });
  }
});

//LOGOUT
router.post("/logout", async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (token) {
    try {
      const { sub } = verifyRefresh(token);
      //remove the  refresh token from the DB
      await User.findByIdAndUpdate(sub, { $pull: { refreshTokens: token } });
    } catch (error) {
      console.warn("logout token invalid or expired");
    }
  }

  //clear cookie on client
  // res.clearCookie("refreshToken", { path: "/api/auth/refresh" });// figure out why clearRefreshCookie helper isn't working here
  clearRefreshCookie(res);
  res.json({ ok: true });
});

//2FA REGENERATE
router.post("/2fa/backup/regenerate", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ errorMessage: "Enable 2FA first" });
    }

    const display = generateBackupCodes(10);
    const hashedCodes = await hashBackupCodes(display);

    user.backupCodesHash = hashedCodes;
    await user.save();

    return res.status(200).json({ codes: display });
  } catch (error) {
    console.error("[2fa/backup/regenerate] failed: ", error);
    res.status(500).json({ errorMessage: "SErver error" });
  }
});

export default router;
