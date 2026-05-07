// ─────────────────────────────────────────────
// server.js — Main Entry Point
// Sets up Express, connects to MongoDB,
// registers all routes, and starts the server.
// ─────────────────────────────────────────────

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ──────────────────────────────
// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: false }));

// Enable CORS — allows the React frontend (Vite on port 5173)
// to make requests to this backend (port 5000)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // Allow cookies/auth headers
  })
);

// ── Routes ──────────────────────────────────
// Auth routes:     POST /api/auth/register, POST /api/auth/login
// Expense routes:  GET/POST/PUT/DELETE /api/expenses (protected)
// Category routes: GET /api/categories (protected)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Expense Tracker API is running",
    timestamp: new Date().toISOString(),
  });
});

// ── Global Error Handler ─────────────────────
// Must be LAST middleware — catches all errors passed via next(err)
app.use(errorHandler);

// ── Start Server ─────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});
