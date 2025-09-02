import express from "express";
import { requireAuth, requirePermission } from "../auth/middleware.js";

const router = express.Router();
router.use(requireAuth);

router.get("/orders", requirePermission("orders:read"), async (req, res) => {
  res.json([{ id: 901, total: 500 }]);
});

router.post("/orders", requirePermission("orders:create"), async (req, res) => {
  res.status(201).json({ id: 902 });
});

router.patch(
  "/orders/:id",
  requirePermission("orders:update"),
  async (req, res) => {
    res.json({ id: req.params.id, update: true });
  }
);

export default router;
