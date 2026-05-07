const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─────────────────────────────────────────────
// User Model
// Stores user credentials. Password is hashed
// automatically before saving using bcrypt.
// ─────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Enforces no duplicate emails
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in queries by default
    },
    currency: {
      type: String,
      default: "USD",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Pre-save Hook: Hash password before storing ──
// Runs only if the password field was modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12); // Cost factor: 12 rounds
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Method: Compare entered password with hash ──
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
