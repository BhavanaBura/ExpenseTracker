const Expense = require("../models/Expense");

// ─────────────────────────────────────────────
// @route   GET /api/expenses
// @desc    Get all expenses for logged-in user
//          Supports: ?month=6&year=2024&category=Food&page=1&limit=10
// @access  Private
// ─────────────────────────────────────────────
const getExpenses = async (req, res, next) => {
  try {
    const { month, year, category, page = 1, limit = 20 } = req.query;

    // Always filter by the authenticated user
    const filter = { user: req.user.id };

    // Optional date filtering by month and year
    if (month && year) {
      const start = new Date(year, month - 1, 1);       // First day of month
      const end = new Date(year, month, 0, 23, 59, 59); // Last day of month
      filter.date = { $gte: start, $lte: end };
    } else if (year) {
      filter.date = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59),
      };
    }

    // Optional category filter
    if (category) {
      filter.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Expense.countDocuments(filter);

    const expenses = await Expense.find(filter)
      .sort({ date: -1 }) // Newest first
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: expenses.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/expenses
// @desc    Create a new expense
// @access  Private
// ─────────────────────────────────────────────
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, description, paymentMethod } = req.body;

    const expense = await Expense.create({
      user: req.user.id, // Automatically tie to logged-in user
      title,
      amount,
      category,
      date: date || Date.now(),
      description,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @route   PUT /api/expenses/:id
// @desc    Update an expense
// @access  Private (only owner can update)
// ─────────────────────────────────────────────
const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    // Authorization check: ensure the expense belongs to the logged-in user
    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this expense",
      });
    }

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return updated doc, run schema validators
    );

    res.json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private (only owner can delete)
// ─────────────────────────────────────────────
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    if (expense.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this expense",
      });
    }

    await expense.deleteOne();

    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/expenses/stats
// @desc    Dashboard stats — total, monthly summary, by category
// @access  Private
// ─────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // ── Total all-time spending ──
    const totalResult = await Expense.aggregate([
      { $match: { user: require("mongoose").Types.ObjectId.createFromHexString(userId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalSpending = totalResult[0]?.total || 0;

    // ── This month's spending ──
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const monthResult = await Expense.aggregate([
      {
        $match: {
          user: require("mongoose").Types.ObjectId.createFromHexString(userId),
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const thisMonthSpending = monthResult[0]?.total || 0;

    // ── Monthly summary for current year (for chart) ──
    const monthlySummary = await Expense.aggregate([
      {
        $match: {
          user: require("mongoose").Types.ObjectId.createFromHexString(userId),
          date: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31, 23, 59, 59),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // ── Spending by category (all time) ──
    const byCategory = await Expense.aggregate([
      { $match: { user: require("mongoose").Types.ObjectId.createFromHexString(userId) } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // ── Last 5 expenses ──
    const recentExpenses = await Expense.find({ user: userId })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalSpending,
        thisMonthSpending,
        totalTransactions: (totalResult[0] && (await Expense.countDocuments({ user: userId }))) || 0,
        monthlySummary,
        byCategory,
        recentExpenses,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense, getStats };
