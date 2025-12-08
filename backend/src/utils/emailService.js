const axios = require('axios');
const { logger } = require('../api/middleware/errorHandler');

/**
 * Send email using SendGrid
 * Note: This is a placeholder implementation. In production, you'd use SendGrid's SDK
 */
class EmailService {
  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@getstride.app';
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email, name) {
    try {
      logger.info(`Sending welcome email to ${email}`);
      
      // In production, implement actual SendGrid API call
      // For now, just log
      const emailData = {
        to: email,
        from: this.fromEmail,
        subject: 'Welcome to Stride!',
        text: `Hi ${name},\n\nWelcome to Stride! We're excited to have you on board.`,
        html: `<p>Hi ${name},</p><p>Welcome to Stride! We're excited to have you on board.</p>`,
      };

      logger.info('Welcome email sent successfully', { email });
      return true;
    } catch (error) {
      logger.error('Failed to send welcome email', { email, error: error.message });
      return false;
    }
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email, token) {
    try {
      logger.info(`Sending verification email to ${email}`);
      
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      
      const emailData = {
        to: email,
        from: this.fromEmail,
        subject: 'Verify your Stride account',
        text: `Please verify your email by visiting: ${verificationUrl}`,
        html: `<p>Please verify your email by clicking the link below:</p><p><a href="${verificationUrl}">Verify Email</a></p>`,
      };

      logger.info('Verification email sent successfully', { email });
      return true;
    } catch (error) {
      logger.error('Failed to send verification email', { email, error: error.message });
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, token) {
    try {
      logger.info(`Sending password reset email to ${email}`);
      
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      
      const emailData = {
        to: email,
        from: this.fromEmail,
        subject: 'Reset your Stride password',
        text: `Reset your password by visiting: ${resetUrl}`,
        html: `<p>Reset your password by clicking the link below:</p><p><a href="${resetUrl}">Reset Password</a></p>`,
      };

      logger.info('Password reset email sent successfully', { email });
      return true;
    } catch (error) {
      logger.error('Failed to send password reset email', { email, error: error.message });
      return false;
    }
  }

  /**
   * Send achievement notification email
   */
  async sendAchievementEmail(email, name, badgeType) {
    try {
      logger.info(`Sending achievement email to ${email}`, { badgeType });
      
      const badgeNames = {
        early_adopter: 'Early Adopter',
        explorer_100km: 'Explorer (100km)',
        reporter_10: 'Reporter (10 reports)',
        photographer_10: 'Photographer (10 photos)',
        top_contributor: 'Top Contributor',
        community_leader: 'Community Leader',
      };

      const badgeName = badgeNames[badgeType] || badgeType;
      
      const emailData = {
        to: email,
        from: this.fromEmail,
        subject: `You earned a new badge: ${badgeName}!`,
        text: `Congratulations ${name}! You've earned the ${badgeName} badge!`,
        html: `<p>Congratulations ${name}!</p><p>You've earned the <strong>${badgeName}</strong> badge!</p>`,
      };

      logger.info('Achievement email sent successfully', { email, badgeType });
      return true;
    } catch (error) {
      logger.error('Failed to send achievement email', { email, error: error.message });
      return false;
    }
  }
}

module.exports = new EmailService();
