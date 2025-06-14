const crypto = require('crypto');
const argon2 = require('argon2');
const { validationResult } = require('express-validator');
const { createUser, findUserByEmail, updateUserVerification, updateUserPassword } = require('../models/userModel');
const { createSession, invalidateUserSessions } = require('../models/sessionModel');
const { createPasswordResetToken, findPasswordResetToken } = require('../models/tokenModel');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { generateSecureToken, hashToken } = require('../utils/tokenUtils');
const { setSessionCookie, clearSessionCookie } = require('../utils/cookieUtils');
const { rateLimit } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

/**
 * User registration controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password, name, preferredLanguage = 'en' } = req.body;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password using Argon2id
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64MB
      timeCost: 3,       // 3 iterations
      parallelism: 4     // 4 parallel threads
    });

    // Generate verification token
    const verificationToken = generateSecureToken(32);
    const hashedToken = hashToken(verificationToken);
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user in database
    const user = await createUser({
      email,
      password: hashedPassword,
      name,
      preferredLanguage,
      verificationToken: hashedToken,
      verificationTokenExpiry: tokenExpiry,
      isVerified: false
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken, preferredLanguage);

    // Log registration event
    logger.info('User registered', { 
      userId: user.id, 
      email: user.email,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message, stack: error.stack });
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during registration. Please try again later.' 
    });
  }
};

/**
 * Email verification controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification token is required' 
      });
    }

    const hashedToken = hashToken(token);
    
    // Find user with matching token
    const user = await findUserByVerificationToken(hashedToken);
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification token' 
      });
    }

    // Check if token is expired
    if (user.verificationTokenExpiry < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification token has expired. Please request a new one.' 
      });
    }

    // Update user as verified
    await updateUserVerification(user.id, true);

    // Log verification event
    logger.info('Email verified', { 
      userId: user.id, 
      email: user.email 
    });

    return res.status(200).json({
      success: true,
      message: 'Email verification successful. You can now log in.'
    });
  } catch (error) {
    logger.error('Email verification error', { error: error.message, stack: error.stack });
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during email verification. Please try again later.' 
    });
  }
};

/**
 * User login controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(req, 'login', 5, 60);
    if (!rateLimitResult.success) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many login attempts. Please try again later.' 
      });
    }

    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password, rememberMe = false } = req.body;

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email before logging in' 
      });
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      // Log failed login attempt
      logger.warn('Failed login attempt', { 
        email, 
        ip: req.ip, 
        userAgent: req.headers['user-agent'] 
      });
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Determine session expiration
    const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000; // 30 days or 2 hours
    const sessionExpiry = new Date(Date.now() + sessionDuration);

    // Create session
    const session = await createSession({
      userId: user.id,
      expiresAt: sessionExpiry,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Generate CSRF token
    const csrfToken = generateSecureToken(32);

    // Set session cookie
    setSessionCookie(res, session.token, sessionExpiry, rememberMe);

    // Log successful login
    logger.info('User logged in', { 
      userId: user.id, 
      email: user.email,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      rememberMe
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      csrfToken
    });
  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during login. Please try again later.' 
    });
  }
};

/**
 * Logout controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.logout = async (req, res) => {
  try {
    // Clear session cookie
    clearSessionCookie(res);

    // Invalidate session in database
    if (req.session && req.session.id) {
      await invalidateSession(req.session.id);
      
      // Log logout event
      logger.info('User logged out', { 
        userId: req.user.id, 
        sessionId: req.session.id 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error', { error: error.message, stack: error.stack });
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred during logout. Please try again later.' 
    });
  }
};

/**
 * Forgot password controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.forgotPassword = async (req, res) => {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(req, 'forgotPassword', 3, 60 * 60);
    if (!rateLimitResult.success) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many password reset requests. Please try again later.' 
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      // Don't reveal that the email doesn't exist
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link shortly.'
      });
    }

    // Generate reset token
    const resetToken = generateSecureToken(64);
    const hashedToken = hashToken(resetToken);
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await createPasswordResetToken({
      userId: user.id,
      token: hashedToken,
      expiresAt: tokenExpiry
    });

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken, user.preferredLanguage);

    // Log password reset request
    logger.info('Password reset requested', { 
      userId: user.id, 
      email: user.email,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link shortly.'
    });
  } catch (error) {
    logger.error('Forgot password error', { error: error.message, stack: error.stack });
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your request. Please try again later.' 
    });
  }
};

/**
 * Reset password controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Validate token format
    if (!token || typeof token !== 'string' || token.length !== 128) { // 64 bytes in hex = 128 chars
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reset token format' 
      });
    }

    // Validate password
    if (!password || password.length < 12) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 12 characters long' 
      });
    }

    const hashedToken = hashToken(token);
    
    // Find token in database
    const resetToken = await findPasswordResetToken(hashedToken);
    if (!resetToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset token has expired. Please request a new one.' 
      });
    }

    // Hash new password
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64MB
      timeCost: 3,       // 3 iterations
      parallelism: 4     // 4 parallel threads
    });

    // Update user password
    await updateUserPassword(resetToken.userId, hashedPassword);

    // Invalidate all active sessions for user
    await invalidateUserSessions(resetToken.userId);

    // Delete used token
    await deletePasswordResetToken(resetToken.id);

    // Log password reset
    logger.info('Password reset successful', { 
      userId: resetToken.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    logger.error('Reset password error', { error: error.message, stack: error.stack });
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while resetting your password. Please try again later.' 
    });
  }
};