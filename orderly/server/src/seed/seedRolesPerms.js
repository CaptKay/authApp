import "dotenv/config";
import mongoose from "mongoose";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";

const PERMS = [
  "users:manage",
  "orders:read",
  "orders:create",
  "orders:update",
  "invoices:read",
  "invoices:create",
  "invoices:update",
  "profile:read",
  "profile:update",
];

const ROLE_MAP = {
  admin: [...PERMS],
  accounts: [
    "invoices:read",
    "invoices:create",
    "invoices:update",
    "profile:read",
    "profile:update",
  ],
  sales: [
    "orders:read",
    "orders:create",
    "orders:update",
    "profile:read",
    "profile:update",
  ],
  user: ["profile:read", "profile:update"],
};

await mongoose.connect(process.env.MONGODB_URI);
const created = {};
for (const p of PERMS)
  created[p] = await Permission.findOneAndUpdate(
    { name: p },
    { name: p },
    { upsert: true, new: true }
  );
for (const [name, list] of Object.entries(ROLE_MAP)) {
  await Role.findOneAndUpdate(
    { name },
    { name, permissions: list.map((p) => created[p]._id) },
    { upsert: true }
  );
}
console.log("seeded roles & permissions");
await mongoose.disconnect();
