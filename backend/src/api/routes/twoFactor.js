/**
 * Two-Factor Authentication API Routes
 */

const express = require('express');
const router = express.Router();
const twoFactorService = require('../../services/twoFactorService');
const authenticate = require('../../middleware/authenticate');
const User = require('../../models/User');
const logger = require('../../utils/logger');

/**
 * @route   POST api/2fa/setup
 * @desc    Setup 2FA for a user
 * @access  Private
 */
router.post('/setup', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled for this user' });
    }
    
    // Generate 2FA secret
    const twoFactorData = await twoFactorService.generateSecret(userId, user.email);
    
    // Save the secret to the user record (but don't enable 2FA yet until verified)
    user.twoFactorSecret = twoFactorData.secret;
    user.twoFactorEnabled = false;
    await user.save();
    
    res.json({
      qrCode: twoFactorData.qrCode,
      secret: twoFactorData.secret
    });
  } catch (error) {
    logger.error('2FA setup error:', error);
    res.status(500).json({ message: 'Failed to set up 2FA' });
  }
});

/**
 * @route   POST api/2fa/verify
 * @desc    Verify 2FA token and enable 2FA
 * @access  Private
 */
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has a 2FA secret
    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA has not been set up for this user' });
    }
    
    // Verify the token
    const verified = twoFactorService.verifyToken(token, user.twoFactorSecret);
    
    if (verified) {
      // If this is the first verification, enable 2FA
      if (!user.twoFactorEnabled) {
        user.twoFactorEnabled = true;
        await user.save();
        logger.info(`2FA enabled for user: ${userId}`);
      }
      
      res.json({ success: true, message: '2FA verification successful' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid 2FA token' });
    }
  } catch (error) {
    logger.error('2FA verification error:', error);
    res.status(500).json({ message: 'Failed to verify 2FA token' });
  }
});

/**
 * @route   POST api/2fa/validate
 * @desc    Validate 2FA token (for login)
 * @access  Public
 */
router.post('/validate', async (req, res) => {
  try {
    const { userId, token } = req.body;
    
    if (!userId || !token) {
      return res.status(400).json({ message: 'User ID and token are required' });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if 2FA is enabled
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA is not enabled for this user' });
    }
    
    // Verify the token
    const verified = twoFactorService.verifyToken(token, user.twoFactorSecret);
    
    if (verified) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Invalid 2FA token' });
    }
  } catch (error) {
    logger.error('2FA validation error:', error);
    res.status(500).json({ message: 'Failed to validate 2FA token' });
  }
});

/**
 * @route   DELETE api/2fa/disable
 * @desc    Disable 2FA for a user
 * @access  Private
 */
router.delete('/disable', authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if 2FA is enabled
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA is not enabled for this user' });
    }
    
    // Verify the token
    const verified = twoFactorService.verifyToken(token, user.twoFactorSecret);
    
    if (verified) {
      // Disable 2FA
      user.twoFactorEnabled = false;
      user.twoFactorSecret = null;
      await user.save();
      
      logger.info(`2FA disabled for user: ${userId}`);
      res.json({ success: true, message: '2FA has been disabled' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid 2FA token' });
    }
  } catch (error) {
    logger.error('2FA disable error:', error);
    res.status(500).json({ message: 'Failed to disable 2FA' });
  }
});

/**
 * @route   GET api/2fa/status
 * @desc    Check if 2FA is enabled for the current user
 * @access  Private
 */
router.get('/status', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      enabled: user.twoFactorEnabled || false
    });
  } catch (error) {
    logger.error('2FA status check error:', error);
    res.status(500).json({ message: 'Failed to check 2FA status' });
  }
});

module.exports = router;
