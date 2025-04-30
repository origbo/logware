/**
 * Notification Service
 * Handles sending alerts via email, SMS, and push notifications
 */

/**
 * Notification Service - Mock Implementation
 * Simplified version for demonstration purposes
 */
// Using mock services instead of actual external dependencies
// No need for nodemailer import with our mock implementation
const axios = require('axios');
const mongoose = require('../utils/mockModels');
const User = mongoose.model('User');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    // Initialize mock email transporter for development
    this.emailTransporter = {
      sendMail: async (options) => {
        console.log('📧 EMAIL NOTIFICATION SENT:', options);
        return { success: true, messageId: `mock-${Date.now()}` };
      }
    };
    
    // Mock SMS service
    this.smsService = {
      sendSMS: async (phoneNumber, message) => {
        console.log(`📱 SMS NOTIFICATION SENT to ${phoneNumber}:`, message);
        return { success: true, messageId: `mock-sms-${Date.now()}` };
      }
    };
    
    // Mock push notification service
    this.pushService = {
      sendPush: async (userId, notification) => {
        console.log(`🔔 PUSH NOTIFICATION SENT to ${userId}:`, notification);
        return { success: true, notificationId: `mock-push-${Date.now()}` };
      }
    };

    logger.info('Notification service initialized');
  }

  /**
   * Send an email notification
   * @param {Object} options - Email options
   * @param {String} options.to - Recipient email
   * @param {String} options.subject - Email subject
   * @param {String} options.text - Plain text content
   * @param {String} options.html - HTML content
   * @returns {Promise<Object>} - Send result
   */
  async sendEmail({ to, subject, text, html }) {
    try {
      if (!to || !subject) {
        throw new Error('Email recipient and subject are required');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Logware <noreply@logware.example.com>',
        to,
        subject,
        text,
        html: html || text
      };

      const info = await this.emailTransporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${subject}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send an SMS notification
   * @param {Object} options - SMS options
   * @param {String} options.to - Recipient phone number
   * @param {String} options.message - SMS message
   * @returns {Promise<Object>} - Send result
   */
  async sendSMS({ to, message }) {
    try {
      if (!to || !message) {
        throw new Error('SMS recipient and message are required');
      }

      const result = await this.smsService.sendSMS(to, message);
      logger.info(`SMS sent to ${to}: ${message.substring(0, 30)}...`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('Error sending SMS:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a push notification
   * @param {Object} options - Push notification options
   * @param {String} options.userId - User ID to send to
   * @param {String} options.title - Notification title
   * @param {String} options.body - Notification body
   * @param {Object} options.data - Additional data
   * @returns {Promise<Object>} - Send result
   */
  async sendPushNotification({ userId, title, body, data = {} }) {
    try {
      if (!userId || !title) {
        throw new Error('User ID and notification title are required');
      }

      const result = await this.pushService.sendPush(userId, { title, body, data });
      logger.info(`Push notification sent to user ${userId}: ${title}`);
      return { success: true, notificationId: result.notificationId };
    } catch (error) {
      logger.error('Error sending push notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send an alert via multiple channels based on severity and user preferences
   * @param {Object} options - Alert options
   * @param {String} options.userId - User ID to send to
   * @param {String} options.title - Alert title
   * @param {String} options.message - Alert message
   * @param {String} options.severity - Alert severity (critical, high, medium, low)
   * @param {Object} options.data - Additional data
   * @returns {Promise<Object>} - Send results
   */
  async sendAlert({ userId, title, message, severity = 'medium', data = {} }) {
    try {
      if (!userId || !title || !message) {
        throw new Error('User ID, title, and message are required');
      }

      // Get user and their notification preferences
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const results = {};

      // Determine which channels to use based on severity and user preferences
      const notificationPrefs = user.preferences?.notifications || {};
      
      // For critical alerts, use all available channels regardless of preferences
      if (severity === 'critical') {
        // Send email
        if (user.email) {
          results.email = await this.sendEmail({
            to: user.email,
            subject: `[CRITICAL ALERT] ${title}`,
            text: message,
            html: `<h1 style="color: #ff0000;">CRITICAL ALERT</h1><p>${message}</p>`
          });
        }
        
        // Send SMS if phone number is available
        if (user.phoneNumber) {
          results.sms = await this.sendSMS({
            to: user.phoneNumber,
            message: `CRITICAL ALERT: ${title} - ${message}`
          });
        }
        
        // Send push notification
        results.push = await this.sendPushNotification({
          userId,
          title: `🚨 CRITICAL ALERT: ${title}`,
          body: message,
          data: { ...data, severity, type: 'alert' }
        });
      } else {
        // For non-critical alerts, respect user preferences
        if (notificationPrefs.email && user.email) {
          results.email = await this.sendEmail({
            to: user.email,
            subject: `[${severity.toUpperCase()} ALERT] ${title}`,
            text: message,
            html: `<h1 style="color: ${this.getSeverityColor(severity)};">${severity.toUpperCase()} ALERT</h1><p>${message}</p>`
          });
        }
        
        // Send SMS for high severity or if explicitly enabled for all
        if ((severity === 'high' && notificationPrefs.sms) && user.phoneNumber) {
          results.sms = await this.sendSMS({
            to: user.phoneNumber,
            message: `${severity.toUpperCase()} ALERT: ${title} - ${message}`
          });
        }
        
        // Send push notification if enabled
        if (notificationPrefs.push) {
          results.push = await this.sendPushNotification({
            userId,
            title: `${this.getSeverityEmoji(severity)} ${severity.toUpperCase()} ALERT: ${title}`,
            body: message,
            data: { ...data, severity, type: 'alert' }
          });
        }
      }

      logger.info(`Alert sent to user ${userId}: ${title} (${severity})`);
      return { success: true, channels: Object.keys(results), results };
    } catch (error) {
      logger.error('Error sending alert:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a notification to all admin users
   * @param {Object} options - Notification options
   * @param {String} options.title - Notification title
   * @param {String} options.message - Notification message
   * @param {String} options.severity - Notification severity
   * @returns {Promise<Object>} - Send results
   */
  async notifyAdmins({ title, message, severity = 'medium' }) {
    try {
      // Find all admin users
      const admins = await User.find({ role: 'admin' });
      
      if (!admins || admins.length === 0) {
        logger.warn('No admin users found for notification');
        return { success: false, error: 'No admin users found' };
      }
      
      // Send alert to each admin
      const results = await Promise.all(
        admins.map(admin => 
          this.sendAlert({
            userId: admin._id,
            title,
            message,
            severity
          })
        )
      );
      
      logger.info(`Notification sent to ${admins.length} admins: ${title}`);
      return { success: true, adminCount: admins.length, results };
    } catch (error) {
      logger.error('Error notifying admins:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get color code for severity level
   * @param {String} severity - Severity level
   * @returns {String} - Color code
   */
  getSeverityColor(severity) {
    switch (severity.toLowerCase()) {
      case 'critical': return '#ff0000'; // Red
      case 'high': return '#ff9800'; // Orange
      case 'medium': return '#ffcc00'; // Yellow
      case 'low': return '#4caf50'; // Green
      default: return '#2196f3'; // Blue
    }
  }

  /**
   * Get emoji for severity level
   * @param {String} severity - Severity level
   * @returns {String} - Emoji
   */
  getSeverityEmoji(severity) {
    switch (severity.toLowerCase()) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📊';
      case 'low': return '📝';
      default: return '🔔';
    }
  }
}

module.exports = new NotificationService();
