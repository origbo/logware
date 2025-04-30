/**
 * Two-Factor Authentication Service
 * Provides TOTP (Time-based One-Time Password) generation and verification
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const logger = require('../utils/logger');

class TwoFactorService {
  /**
   * Generate a new secret for TOTP authentication
   * @param {String} userId - User identifier
   * @param {String} email - User email
   * @returns {Promise<Object>} - Secret and QR code data
   */
  async generateSecret(userId, email) {
    try {
      // Generate a secret key
      const secret = speakeasy.generateSecret({
        name: `Logware:${email}`
      });
      
      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);
      
      logger.info(`Generated 2FA secret for user: ${userId}`);
      
      return {
        userId,
        secret: secret.base32,
        qrCode,
        otpAuthUrl: secret.otpauth_url
      };
    } catch (error) {
      logger.error(`Error generating 2FA secret for user ${userId}:`, error);
      throw new Error('Failed to generate 2FA secret');
    }
  }
  
  /**
   * Verify a TOTP token against a secret
   * @param {String} token - Token provided by the user
   * @param {String} secret - Secret key (base32 encoded)
   * @returns {Boolean} - Whether the token is valid
   */
  verifyToken(token, secret) {
    try {
      // Verify the token
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1 // Allow one step before/after for time drift
      });
      
      return verified;
    } catch (error) {
      logger.error('Error verifying 2FA token:', error);
      return false;
    }
  }
}

module.exports = new TwoFactorService();
