import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Email Service - Simple SMTP-based email sending
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.from = env.EMAIL_FROM || `${env.APP_NAME} <noreply@example.com>`;
    this.isConfigured = !!(env.EMAIL_HOST && env.EMAIL_USER);
    
    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT || 587,
        secure: env.EMAIL_SECURE === 'true',
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASSWORD,
        },
      });
      logger.info('Email service initialized');
    } else {
      logger.warn('Email not configured. Set EMAIL_HOST and EMAIL_USER.');
    }
  }

  /**
   * Send an email
   */
  async send({ to, subject, html, text }) {
    if (!this.isConfigured) {
      logger.warn({ to, subject }, 'Email not sent - not configured');
      return { success: false };
    }

    try {
      const result = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
        text,
      });
      
      logger.info({ to, subject }, 'Email sent');
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error({ to, error: error.message }, 'Email failed');
      throw error;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(to, name, token) {
    const url = `${env.APP_URL || 'http://localhost:3000'}/api/${env.API_VERSION}/auth/verify-email?token=${token}`;
    
    return this.send({
      to,
      subject: `Verify your email - ${env.APP_NAME}`,
      html: `
        <h2>Verify Your Email</h2>
        <p>Hi ${name},</p>
        <p>Please verify your email by clicking below:</p>
        <p><a href="${url}" style="background:#4CAF50;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;">Verify Email</a></p>
        <p>Or copy: ${url}</p>
        <p>This link expires in 24 hours.</p>
      `,
      text: `Verify your email: ${url}`,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to, name, token) {
    const url = `${env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    return this.send({
      to,
      subject: `Reset your password - ${env.APP_NAME}`,
      html: `
        <h2>Reset Your Password</h2>
        <p>Hi ${name},</p>
        <p>Click below to reset your password:</p>
        <p><a href="${url}" style="background:#2196F3;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;">Reset Password</a></p>
        <p>Or copy: ${url}</p>
        <p>This link expires in 1 hour.</p>
      `,
      text: `Reset your password: ${url}`,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to, name) {
    return this.send({
      to,
      subject: `Welcome to ${env.APP_NAME}!`,
      html: `
        <h2>Welcome to ${env.APP_NAME}!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for joining us. We're excited to have you!</p>
      `,
      text: `Welcome to ${env.APP_NAME}!`,
    });
  }

  /**
   * Send password changed notification
   */
  async sendPasswordChangedEmail(to, name) {
    return this.send({
      to,
      subject: `Password changed - ${env.APP_NAME}`,
      html: `
        <h2>Password Changed</h2>
        <p>Hi ${name},</p>
        <p>Your password was changed on ${new Date().toLocaleString()}.</p>
        <p>If this wasn't you, contact support immediately.</p>
      `,
      text: `Your password was changed. If this wasn't you, contact support.`,
    });
  }
}

export const emailService = new EmailService();
export default emailService;
