const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const { protect } = require("../middleware/auth");

// GET /api/categories → Return the list of valid expense categories
router.get("/", protect, (req, res) => {
  res.json({
    success: true,
    data: Expense.schema.path("category").enumValues,
  });
});

module.exports = router;
