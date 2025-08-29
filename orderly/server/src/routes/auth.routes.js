import "dotenv/config";
import express from "express";
import User from "../models/User.js";
import Role from "../models/Role.js";
import {hashPassword, verifyPassword} from '../utils/hash.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} from "../auth/tokens.js";
import { setRefreshCookie, clearRefreshCookie } from "../utils/cookies.js";

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

    // 5. return minimal user info
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

//LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  //1. find user and populate roles + permissins
  const user = await User.findOne({ email }).populate({
    path: "roles",
    populate: "permissions",
  });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  //2. verify password
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  //3. extract roleNames & permissions
  const roleNames = user.roles.map(r => r.name);
  const permissions = [
    ...new Set(user.roles.flatMap(r => r.permissions.map((p) => p.name))),
  ];

  //4. create tokens
  const accessToken = signAccessToken({
    sub: user._id.toString(),
    roleNames,
    permissions,
  });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });

  //5.  save refresh token to DB
  user.refreshTokens.push(refreshToken);
  await user.save();

  //6. set refresh cookie
  setRefreshCookie(res, refreshToken);

  //7. send response with access token + user info
  res.status(200).json({
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      roleNames,
      permissions,
    },
  });
});

//REFRESH ROUTE
router.post("/refresh", async (req, res) => {
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
  const token = req.cookies?.refreshToken;

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

export default router;
