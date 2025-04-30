/**
 * Minimal Notification Service Tests
 * Focuses on core functionality with simplified mocks
 */

// Mock dependencies before requiring the service
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ data: { messageId: 'test-sms-id' } })
}));

jest.mock('../../models/User', () => ({
  findById: jest.fn().mockResolvedValue({
    _id: 'user-id',
    email: 'test@example.com',
    phoneNumber: '+1234567890',
    pushTokens: ['token1'],
    preferences: { notifications: { email: true, sms: true, push: true } }
  }),
  find: jest.fn().mockResolvedValue([
    { _id: 'admin1' },
    { _id: 'admin2' }
  ])
}));

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

// Set environment variables for testing
process.env.SMTP_HOST = 'smtp.example.com';
process.env.SMTP_PORT = '587';
process.env.EMAIL_FROM = 'test@example.com';
process.env.SMS_API_KEY = 'test-key';
process.env.SMS_API_URL = 'https://api.example.com/sms';
process.env.SMS_FROM_NUMBER = '+1234567890';

// Now require the service after mocks are in place
const notificationService = require('../../services/notificationService');

describe('Notification Service - Basic Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should send email correctly', async () => {
    const result = await notificationService.sendEmail({
      to: 'recipient@example.com',
      subject: 'Test Subject',
      text: 'Test Content'
    });

    expect(result.success).toBe(true);
  });

  test('Should handle missing email parameters', async () => {
    const result = await notificationService.sendEmail({});
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
  });

  test('Should send alert via appropriate channels', async () => {
    const result = await notificationService.sendAlert({
      userId: 'user-id',
      title: 'Test Alert',
      message: 'This is a test alert',
      severity: 'high'
    });

    expect(result.success).toBe(true);
  });
});
