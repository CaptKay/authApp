import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import connectDB from "./db/connection.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import accountsRoutes from "./routes/accounts.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import meRoutes from "./routes/me.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// … your other imports
import "./models/Permission.js"; // 👈 guarantees model is registered
import "./models/Role.js";
import "./models/User.js";

const app = express();
app.set("trust proxy", 1);

//Middleware setup
const ALLOWED_ORIGINS = (process.env.CLIENT_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (like Postman, curl)
      if (!origin) return cb(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) {
        return cb(null, true);
      }

      return cb(new Error("Not allowed by CORS"), false); 
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use("/api", cookieParser());

// Health Check
app.get("/api/health", (_req, res) => res.status(200).json({ ok: true }));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/me", meRoutes);
app.use("/api/admin", adminRoutes);

//404 handler
app.use((req, res, _next) => {
  if (!res.headersSent) res.status(404).json({ error: "Not found" });
});

//Error handling
app.use((err, _req, res, _next) => {
  console.log(err);
  if (!res.headersSent) res.status(500).json({ error: "Server error" });
});

// Coneection setup
const PORT = process.env.PORT;
try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
} catch (error) {
  console.error("❌ Failed to start server (DB error):", error.message);
  process.exit(1);
}
