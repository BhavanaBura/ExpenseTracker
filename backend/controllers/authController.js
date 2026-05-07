const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─────────────────────────────────────────────
// Helper: Generate JWT Token
// ─────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },          // Payload: user's MongoDB _id
    process.env.JWT_SECRET,  // Secret key from .env
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ─────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Create user — password hashing happens in the User model pre-save hook
    const user = await User.create({ name, email, password });

    // Generate token for immediate login after registration
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
      },
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Authenticate user and return JWT
// @access  Public
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user — we explicitly select password (hidden by default via `select: false`)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Use the instance method defined in User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get current logged-in user profile
// @access  Private (requires protect middleware)
// ─────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
