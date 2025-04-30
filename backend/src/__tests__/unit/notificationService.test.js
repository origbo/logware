/**
 * Notification Service Unit Tests
 */

const notificationService = require('../../services/notificationService');
const User = require('../../models/User');
const nodemailer = require('nodemailer');
const axios = require('axios');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('nodemailer');
jest.mock('axios');
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

// Mock environment variables needed for the notification service
process.env = {
  ...process.env,
  SMTP_HOST: 'smtp.example.com',
  SMTP_PORT: '587',
  SMTP_USER: 'test-user',
  SMTP_PASS: 'test-pass',
  EMAIL_FROM: 'noreply@example.com',
  SMS_API_KEY: 'test-sms-key',
  SMS_API_URL: 'https://sms-api.example.com',
  SMS_FROM_NUMBER: '+1234567890',
  PUSH_ENABLED: 'true',
  PUSH_API_KEY: 'test-push-key'
};

describe('Notification Service', () => {
  // Mock data
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

  // Mock nodemailer transport
  const mockTransport = {
    sendMail: jest.fn().mockResolvedValue({ messageId: 'email123' })
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock nodemailer createTransport to return our mock transport
    nodemailer.createTransport.mockReturnValue(mockTransport);
    
    // Mock User.findById to return mock user
    User.findById.mockResolvedValue(mockUser);
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      const emailOptions = {
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'This is a test email'
      };

      const result = await notificationService.sendEmail(emailOptions);

      expect(mockTransport.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: emailOptions.to,
          subject: emailOptions.subject,
          text: emailOptions.text
        })
      );
      expect(result).toEqual({ success: true, messageId: 'email123' });
    });

    it('should handle missing recipient or subject', async () => {
      const result = await notificationService.sendEmail({});

      expect(mockTransport.sendMail).not.toHaveBeenCalled();
      expect(result).toEqual({ 
        success: false, 
        error: expect.stringContaining('recipient and subject are required') 
      });
    });

    it('should handle email sending errors', async () => {
      mockTransport.sendMail.mockRejectedValueOnce(new Error('Failed to send'));

      const result = await notificationService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email'
      });

      expect(result).toEqual({ 
        success: false, 
        error: expect.stringContaining('Failed to send') 
      });
    });
  });

  describe('sendSMS', () => {
    beforeEach(() => {
      // Set SMS configuration
      process.env.SMS_API_KEY = 'test-api-key';
      process.env.SMS_API_URL = 'https://sms-api.example.com';
      process.env.SMS_FROM_NUMBER = '+9876543210';
      
      // Mock axios post to simulate successful API call
      axios.post.mockResolvedValue({ data: { messageId: 'sms123' } });
    });

    afterEach(() => {
      // Reset environment variables
      delete process.env.SMS_API_KEY;
      delete process.env.SMS_API_URL;
      delete process.env.SMS_FROM_NUMBER;
    });

    it('should send an SMS successfully', async () => {
      const smsOptions = {
        to: '+1234567890',
        message: 'This is a test SMS'
      };

      const result = await notificationService.sendSMS(smsOptions);

      expect(axios.post).toHaveBeenCalledWith(
        process.env.SMS_API_URL,
        expect.objectContaining({
          from: process.env.SMS_FROM_NUMBER,
          to: smsOptions.to,
          message: smsOptions.message
        }),
        expect.any(Object)
      );
      expect(result).toEqual({ success: true, messageId: 'sms123' });
    });

    it('should handle missing recipient or message', async () => {
      const result = await notificationService.sendSMS({});

      expect(axios.post).not.toHaveBeenCalled();
      expect(result).toEqual({ 
        success: false, 
        error: expect.stringContaining('recipient and message are required') 
      });
    });

    it('should handle unconfigured SMS service', async () => {
      // Reset environment variables to simulate unconfigured service
      delete process.env.SMS_API_KEY;
      delete process.env.SMS_API_URL;

      const result = await notificationService.sendSMS({
        to: '+1234567890',
        message: 'Test message'
      });

      expect(axios.post).not.toHaveBeenCalled();
      expect(result).toEqual({ 
        success: false, 
        error: expect.stringContaining('not configured') 
      });
    });

    it('should handle SMS API errors', async () => {
      axios.post.mockRejectedValueOnce(new Error('API error'));

      const result = await notificationService.sendSMS({
        to: '+1234567890',
        message: 'Test message'
      });

      expect(result).toEqual({ 
        success: false, 
        error: expect.stringContaining('API error') 
      });
    });
  });

  describe('sendAlert', () => {
    it('should send alerts through multiple channels based on severity', async () => {
      // Spy on the individual send methods
      const sendEmailSpy = jest.spyOn(notificationService, 'sendEmail')
        .mockResolvedValue({ success: true });
      const sendSMSSpy = jest.spyOn(notificationService, 'sendSMS')
        .mockResolvedValue({ success: true });
      const sendPushSpy = jest.spyOn(notificationService, 'sendPushNotification')
        .mockResolvedValue({ success: true });

      // Critical alert should use all channels
      await notificationService.sendAlert({
        userId: mockUser._id,
        title: 'Critical Alert',
        message: 'This is a critical security alert',
        severity: 'critical'
      });

      expect(sendEmailSpy).toHaveBeenCalled();
      expect(sendSMSSpy).toHaveBeenCalled();
      expect(sendPushSpy).toHaveBeenCalled();

      // Reset spies
      sendEmailSpy.mockClear();
      sendSMSSpy.mockClear();
      sendPushSpy.mockClear();

      // Medium alert should respect user preferences
      await notificationService.sendAlert({
        userId: mockUser._id,
        title: 'Medium Alert',
        message: 'This is a medium security alert',
        severity: 'medium'
      });

      // Since our mock user has all preferences enabled
      expect(sendEmailSpy).toHaveBeenCalled();
      expect(sendPushSpy).toHaveBeenCalled();
      // SMS not expected for medium alerts
      expect(sendSMSSpy).not.toHaveBeenCalled();
    });

    it('should handle missing user', async () => {
      User.findById.mockResolvedValueOnce(null);

      const result = await notificationService.sendAlert({
        userId: 'nonexistent',
        title: 'Test Alert',
        message: 'This is a test alert'
      });

      expect(result).toEqual({ 
        success: false, 
        error: expect.stringContaining('User not found') 
      });
    });

    it('should handle missing required parameters', async () => {
      const result = await notificationService.sendAlert({
        userId: mockUser._id
        // Missing title and message
      });

      expect(result).toEqual({ 
        success: false, 
        error: expect.stringContaining('title, and message are required') 
      });
    });
  });

  describe('notifyAdmins', () => {
    it('should send alert to all admin users', async () => {
      // Mock finding admin users
      const mockAdmins = [
        { _id: 'admin1' },
        { _id: 'admin2' }
      ];
      User.find.mockResolvedValueOnce(mockAdmins);

      // Spy on sendAlert
      const sendAlertSpy = jest.spyOn(notificationService, 'sendAlert')
        .mockResolvedValue({ success: true });

      await notificationService.notifyAdmins({
        title: 'Admin Alert',
        message: 'This is an admin notification',
        severity: 'high'
      });

      expect(User.find).toHaveBeenCalledWith({ role: 'admin' });
      expect(sendAlertSpy).toHaveBeenCalledTimes(mockAdmins.length);
      mockAdmins.forEach(admin => {
        expect(sendAlertSpy).toHaveBeenCalledWith(expect.objectContaining({
          userId: admin._id,
          title: 'Admin Alert',
          message: 'This is an admin notification',
          severity: 'high'
        }));
      });
    });

    it('should handle no admin users found', async () => {
      User.find.mockResolvedValueOnce([]);

      const result = await notificationService.notifyAdmins({
        title: 'Admin Alert',
        message: 'This is an admin notification'
      });

      expect(result).toEqual({ 
        success: false, 
        error: expect.stringContaining('No admin users found') 
      });
    });
  });
});
