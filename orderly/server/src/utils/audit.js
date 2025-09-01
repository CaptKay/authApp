import AuditLog from "../models/AuditLogs.js";

export async function audit({ userId, event, req, meta }) {
  try {
    await AuditLog.create({
      user: userId || undefined,
      event,
      ip: (
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        " "
      ).toString(),
      ua: req.headers["user-agent"],
      meta,
    });
  } catch (error) {
    console.warn("[audit] failed", event, error.message);
  }
}
