import jwt from "jsonwebtoken";

const ACCESS_TTL = "15m"; // access tokens live ~15 minutes
const REFRESH_TTL = "7d"; // refresh tokens live ~7 days

export function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TTL,
    algorithm: "HS256",
  });
}

export function verifyAccess(token) {
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
}

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TTL,
    algorithm: "HS256",
  });
};

export const verifyRefresh = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
};
