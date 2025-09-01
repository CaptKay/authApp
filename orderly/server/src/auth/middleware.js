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

//User must have all listed permissions
export function requirePermission(...needed) {
  return (req, res, next) => {
    const have = new Set(req.user?.permissions || []);
    const ok = needed.every((p) => have.has(p));
    if (!ok) return res.status(403).json({ errorMessage: "Forbidden" });
    next();
  };
}

//User must have one of the listed permissions
export function requireAnyPermission(...anyOf) {
  return (req, res, next) => {
    const have = new Set(req.user?.permissions || []);
    const ok = anyOf.some((p) => have.has(p));
    if (!ok) return res.status(403).json({ errorMessage: "Forbidden" });
    next();
  };
}

//Role gate
export function requireRole(...roles) {
  return (req, res, next) => {
    const have = new Set(req.user?.roleNames || []);
    const ok = roles.some((r) => have.has(r));
    if (!ok) return res.status(403).json({ errorMessage: "Forbidden" });
    next();
  };
}
