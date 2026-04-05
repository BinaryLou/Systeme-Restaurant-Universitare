const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/admin");
const serviceRoutes = require("./routes/services");
const reservatiosRoutes = require("./routes/reservations");
const protectedRoutes = require("./routes/protected");
const scanRoutes = require("./routes/scan");
const usersRoutes = require("./routes/users");
const menuRoutes = require("./routes/menus");

const errorHandler = require("./middlewares/errorHandler");
const { logger } = require("./middlewares/logger");

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.set("trust proxy", 1);

// Securite HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logger
app.use(logger);

// Rate limiting global leger
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Trop de requêtes, veuillez réessayer plus tard",
  },
});

app.use(globalLimiter);

// Rate limiting routes sensibles auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Trop de tentatives, veuillez réessayer plus tard",
  },
});

app.use("/api/auth", authLimiter);

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/reservations", reservatiosRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/users",usersRoutes);
app.use("/api/admin", menuRoutes);

// Route 404
app.use((req, res) => {
  return res.status(404).json({
    status: "error",
    message: "Route introuvable",
  });
});

// Middleware global d erreur
app.use(errorHandler);

module.exports = app;