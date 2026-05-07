const express = require("express");
const router = express.Router();
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getStats,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/auth");

// All expense routes require authentication
// The `protect` middleware verifies the JWT and sets req.user

// GET  /api/expenses/stats  → Dashboard stats (must be before /:id)
router.get("/stats", protect, getStats);

// GET  /api/expenses        → Get all expenses (with optional filters)
// POST /api/expenses        → Create new expense
router.route("/").get(protect, getExpenses).post(protect, createExpense);

// PUT    /api/expenses/:id  → Update expense by ID
// DELETE /api/expenses/:id  → Delete expense by ID
router.route("/:id").put(protect, updateExpense).delete(protect, deleteExpense);

module.exports = router;
