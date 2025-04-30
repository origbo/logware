/**
 * Notification Service Unit Tests (Fixed Version)
 * Uses correct mocking techniques to test notification functionality
 */

// Setup mocks before importing the service
const nodemailerMock = {
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-email-id' })
  })
};

const axiosMock = {
  post: jest.fn().mockResolvedValue({ data: { messageId: 'test-sms-id' } })
};

const userMock = {
  findById: jest.fn(),
  find: jest.fn()
};

const loggerMock = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// Apply mocks
jest.mock('nodemailer', () => nodemailerMock);
jest.mock('axios', () => axiosMock);
jest.mock('../../models/User', () => userMock);
jest.mock('../../utils/logger', () => loggerMock);

// Set environment variables for testing
process.env = {
  ...process.env,
  SMTP_HOST: 'smtp.example.com',
  SMTP_PORT: '587',
  SMTP_SECURE: 'false',
  SMTP_USER: 'test-user',
  SMTP_PASS: 'test-pass',
  EMAIL_FROM: 'noreply@example.com',
  SMS_API_KEY: 'test-sms-key',
  SMS_API_URL: 'https://sms-api.example.com',
  SMS_FROM_NUMBER: '+1234567890',
  PUSH_ENABLED: 'true',
  PUSH_API_KEY: 'test-push-key'
};

// Now import the service after all mocks are in place
const notificationService = require('../../services/notificationService');

describe('Notification Service', () => {
  // Mock user data
  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    phoneNumber: '+1234567890',
    pushTokens: ['token1', 'token2'],
    preferences: {
      notifications: {
        email: true,
        sms: true,
        push: true
      }
    }
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Set default mock return values
    userMock.findById.mockResolvedValue(mockUser);
    userMock.find.mockResolvedValue([
      { _id: 'admin1' },
      { _id: 'admin2' }
    ]);
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      const emailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'This is a test email'
      };

      const result = await notificationService.sendEmail(emailOptions);

      expect(nodemailerMock.createTransport).toHaveBeenCalled();
      expect(nodemailerMock.createTransport().sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: emailOptions.to,
          subject: emailOptions.subject,
          text: emailOptions.text
        })
      );
      expect(result).toEqual({ success: true, messageId: 'test-email-id' });
    });

    it('should handle missing recipient or subject', async () => {
      const result = await notificationService.sendEmail({});

      expect(nodemailerMock.createTransport().sendMail).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should handle email sending errors', async () => {
      // Mock sendMail to reject for this test
      nodemailerMock.createTransport().sendMail.mockRejectedValueOnce(new Error('Send failed'));

      const result = await notificationService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Send failed');
    });
  });

  describe('sendSMS', () => {
    it('should send an SMS successfully', async () => {
      const smsOptions = {
        to: '+1234567890',
        message: 'This is a test SMS'
      };

      const result = await notificationService.sendSMS(smsOptions);

      expect(axiosMock.post).toHaveBeenCalledWith(
        process.env.SMS_API_URL,
        expect.objectContaining({
          from: process.env.SMS_FROM_NUMBER,
          to: smsOptions.to,
          message: smsOptions.message
        }),
        expect.any(Object)
      );
      expect(result).toEqual({ success: true, messageId: 'test-sms-id' });
    });

    it('should handle missing recipient or message', async () => {
      const result = await notificationService.sendSMS({});

      expect(axiosMock.post).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should handle SMS API errors', async () => {
      // Mock post to reject for this test
      axiosMock.post.mockRejectedValueOnce(new Error('API error'));

      const result = await notificationService.sendSMS({
        to: '+1234567890',
        message: 'Test message'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('API error');
    });
  });

  describe('sendAlert', () => {
    beforeEach(() => {
      // Spy on notification sending methods
      jest.spyOn(notificationService, 'sendEmail').mockResolvedValue({ success: true });
      jest.spyOn(notificationService, 'sendSMS').mockResolvedValue({ success: true });
      jest.spyOn(notificationService, 'sendPushNotification').mockResolvedValue({ success: true });
    });

    it('should send critical alerts through all channels', async () => {
      const result = await notificationService.sendAlert({
        userId: mockUser._id,
        title: 'Critical Alert',
        message: 'This is a critical security alert',
        severity: 'critical'
      });

      expect(userMock.findById).toHaveBeenCalledWith(mockUser._id);
      expect(notificationService.sendEmail).toHaveBeenCalled();
      expect(notificationService.sendSMS).toHaveBeenCalled();
      expect(notificationService.sendPushNotification).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should respect user preferences for non-critical alerts', async () => {
      // Set user preferences to only enable email
      userMock.findById.mockResolvedValueOnce({
        ...mockUser,
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: false
          }
        }
      });

      await notificationService.sendAlert({
        userId: mockUser._id,
        title: 'Medium Alert',
        message: 'This is a medium security alert',
        severity: 'medium'
      });

      expect(notificationService.sendEmail).toHaveBeenCalled();
      expect(notificationService.sendSMS).not.toHaveBeenCalled();
      expect(notificationService.sendPushNotification).not.toHaveBeenCalled();
    });

    it('should handle missing required parameters', async () => {
      const result = await notificationService.sendAlert({
        userId: mockUser._id
        // Missing title and message
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should handle user not found', async () => {
      // Mock user not found
      userMock.findById.mockResolvedValueOnce(null);

      const result = await notificationService.sendAlert({
        userId: 'nonexistent',
        title: 'Test Alert',
        message: 'This is a test alert'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('notifyAdmins', () => {
    beforeEach(() => {
      // Spy on sendAlert
      jest.spyOn(notificationService, 'sendAlert').mockResolvedValue({ success: true });
    });

    it('should notify all admin users', async () => {
      const result = await notificationService.notifyAdmins({
        title: 'Admin Alert',
        message: 'This is an admin notification',
        severity: 'high'
      });

      expect(userMock.find).toHaveBeenCalledWith({ role: 'admin' });
      expect(notificationService.sendAlert).toHaveBeenCalledTimes(2); // Two admin users
      expect(result.success).toBe(true);
      expect(result.adminCount).toBe(2);
    });

    it('should handle no admin users found', async () => {
      // Mock no admin users
      userMock.find.mockResolvedValueOnce([]);

      const result = await notificationService.notifyAdmins({
        title: 'Admin Alert',
        message: 'This is an admin notification'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No admin users found');
    });
  });
});
