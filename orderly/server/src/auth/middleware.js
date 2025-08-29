import { verifyAccess } from "./tokens.js";

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || " ";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ errorMsg: "Missing token" });

  try {
    req.user = verifyAccess(token);
    next();
  } catch (error) {
    res.status(401).json({ errorMsg: "Invalid/expired token" });
  }
}
