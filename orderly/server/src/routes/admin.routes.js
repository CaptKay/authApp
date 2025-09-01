import express from "express";
import { requireAuth, requirePermission } from "../auth/middleware.js";

const router = express.Router();
router.use(requireAuth);
router.use(requirePermission("users:manage"));

router.get("/users", async (req, res) => {
  res.json([{ id: "u1", email: "kay@example.com" }]);
});

export default router;
