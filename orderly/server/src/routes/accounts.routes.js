import express from "express";
import { requireAuth, requirePermission } from "../auth/middleware.js";

const router = express.Router();
router.use(requireAuth);

router.get(
  "/invoices",
  requirePermission("invoices:read"),
  async (req, res) => {
    res.json([{ id: 101, amount: 250 }]);
  }
);

router.post(
  "/invoices",
  requirePermission("invoices:create"),
  async (req, res) => {
    res.status(201).json({ id: 102 });
  }
);

router.patch(
  "/invoices/:id",
  requirePermission("invoices:update"),
  async (req, res) => {
    res.json({
      id: req.params.id,
      updated: true,
    });
  }
);

export default router;
