import express from "express";
import { requireAuth, requirePermission } from "../auth/middleware.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", requirePermission("profile:read"), async (req, res) => {
  res.json({ userId: req.user.sub, fullName: "Kingsley Kanu" });
});

router.put("/", requirePermission("profile:update"), async (req, res) => {
  res.json({ ok: true });
});

export default router;
