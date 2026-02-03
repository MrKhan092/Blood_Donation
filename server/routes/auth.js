const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { protect } = require('../middlewares/auth');
const {
  register,
  login,
  googleAuth,
  getMe,
  logout
} = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/google
// @desc    Google OAuth authentication (legacy - keep for compatibility)
// @access  Public
router.post('/google', googleAuth);

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth flow
// @access  Public
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
    session: false 
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      console.log('Google OAuth successful for user:', req.user.email);

      // Check if profile is complete
      const needsCompletion = req.user.phone === '0000000000' || 
                             req.user.location.city === 'Not provided';

      if (needsCompletion) {
        // Redirect with incomplete flag
        res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}&incomplete=true`);
      } else {
        // Redirect to dashboard
        res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

module.exports = router;