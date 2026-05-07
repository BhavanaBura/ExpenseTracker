const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─────────────────────────────────────────────
// Protect Middleware
// Verifies the JWT token from the Authorization header.
// Attaches the authenticated user to req.user.
// Usage: Add `protect` as middleware to any protected route.
// ─────────────────────────────────────────────

const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. No token provided.",
    });
  }

  try {
    // Verify token using our JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the full user object (without password) to the request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    next(); // Proceed to the next middleware / route handler
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid token.",
    });
  }
};

module.exports = { protect };
