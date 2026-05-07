const mongoose = require("mongoose");

// ─────────────────────────────────────────────
// Expense Model
// Each expense belongs to a user (via user field).
// The `user` field is the foreign key linking to User model.
// ─────────────────────────────────────────────

const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Health & Medical",
  "Housing & Utilities",
  "Education",
  "Travel",
  "Personal Care",
  "Savings & Investments",
  "Other",
];

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // References the User model
      ref: "User",
      required: true,
      index: true, // Index for faster lookups by user
    },
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      },
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Credit Card", "Debit Card", "UPI", "Bank Transfer", "Other"],
      default: "Other",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: speeds up queries that filter by user + sort by date
expenseSchema.index({ user: 1, date: -1 });

// Export categories so they can be reused in routes/controllers
expenseSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model("Expense", expenseSchema);
