const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
  registerValidation, 
  loginValidation, 
  forgotPasswordValidation, 
  resetPasswordValidation 
} = require('../middleware/validationMiddleware');
const { authenticate, csrfProtection } = require('../middleware/authMiddleware');
const { rateLimiterMiddleware } = require('../middleware/rateLimiter');

// Apply rate limiting to all auth routes
router.use(rateLimiterMiddleware({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  keyGenerator: (req) => `${req.ip}:auth`
}));

// Registration route
router.post(
  '/register',
  registerValidation,
  authController.register
);

// Email verification route
router.get(
  '/verify-email/:token',
  authController.verifyEmail
);

// Login route with stricter rate limiting
router.post(
  '/login',
  rateLimiterMiddleware({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute
    keyGenerator: (req) => `${req.ip}:login`
  }),
  loginValidation,
  authController.login
);

// Logout route
router.post(
  '/logout',
  authenticate,
  csrfProtection,
  authController.logout
);

// Forgot password route
router.post(
  '/forgot-password',
  rateLimiterMiddleware({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per hour
    keyGenerator: (req) => `${req.body.email}:forgotPassword`
  }),
  forgotPasswordValidation,
  authController.forgotPassword
);

// Reset password route
router.post(
  '/reset-password',
  resetPasswordValidation,
  authController.resetPassword
);

// Get current user route
router.get(
  '/me',
  authenticate,
  (req, res) => {
    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      }
    });
  }
);

module.exports = router;