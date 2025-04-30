const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const twoFactorService = require('../../services/twoFactorService');
const logger = require('../../utils/logger');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      role: role || 'user' // Default role is user
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'logware-secret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, twoFactorToken } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if 2FA is enabled for this user
    if (user.twoFactorEnabled && !twoFactorToken) {
      return res.status(200).json({ 
        requiresTwoFactor: true, 
        message: 'Two-Factor Authentication code required' 
      });
    }

    // Verify 2FA token if enabled
    if (user.twoFactorEnabled && twoFactorToken) {
      const isValid = twoFactorService.verifyToken(user.twoFactorSecret, twoFactorToken);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid two-factor authentication code' });
      }
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'logware-secret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled
          } 
        });
      }
    );
  } catch (err) {
    logger.error('Login error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    // Get user from database (exclude password)
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    logger.error('Error getting user data:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST api/auth/verify-2fa
// @desc    Verify 2FA code without being logged in
// @access  Public
router.post('/verify-2fa', async (req, res) => {
  try {
    const { email, token } = req.body;
    
    if (!email || !token) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: 'Two-factor authentication is not enabled for this user' });
    }
    
    // Verify token
    const verified = twoFactorService.verifyToken(user.twoFactorSecret, token);
    
    res.json({ verified });
  } catch (err) {
    logger.error('Error verifying 2FA:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
