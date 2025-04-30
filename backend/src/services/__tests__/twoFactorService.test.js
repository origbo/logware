/**
 * Two-Factor Authentication Service Tests
 */

const twoFactorService = require('../twoFactorService');

// Mock the logger to prevent console output during tests
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

describe('Two-Factor Authentication Service', () => {
  describe('generateSecret', () => {
    it('should generate a secret and QR code for a user', async () => {
      // Test data
      const userId = '12345';
      const email = 'test@example.com';
      
      // Call the method
      const result = await twoFactorService.generateSecret(userId, email);
      
      // Check the result
      expect(result).toHaveProperty('userId', userId);
      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCode');
      expect(result).toHaveProperty('otpAuthUrl');
      expect(result.secret).toBeTruthy();
      expect(result.qrCode.startsWith('data:image/png;base64,')).toBeTruthy();
      expect(result.otpAuthUrl.includes(email)).toBeTruthy();
    });

    it('should handle errors gracefully', async () => {
      // Force an error by passing invalid parameters
      await expect(twoFactorService.generateSecret()).rejects.toThrow();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      // For testing purposes, we'll use a known secret and generate a valid token
      const secret = 'JBSWY3DPEHPK3PXP'; // Example secret for testing
      
      // Generate a valid token using the same library
      const speakeasy = require('speakeasy');
      const validToken = speakeasy.totp({
        secret: secret,
        encoding: 'base32'
      });
      
      // Verify the token
      const result = twoFactorService.verifyToken(validToken, secret);
      
      // The token should be valid
      expect(result).toBe(true);
    });

    it('should reject an invalid token', () => {
      // Use a known secret
      const secret = 'JBSWY3DPEHPK3PXP';
      
      // Use an invalid token
      const invalidToken = '000000';
      
      // Verify the token
      const result = twoFactorService.verifyToken(invalidToken, secret);
      
      // The token should be invalid
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', () => {
      // Call with invalid parameters
      const result = twoFactorService.verifyToken();
      
      // Should return false
      expect(result).toBe(false);
    });
  });
});
