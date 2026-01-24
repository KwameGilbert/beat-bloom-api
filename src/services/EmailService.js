import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Email Service for BeatBloom
 * Handles all transactional emails with BeatBloom branding
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.from = env.EMAIL_FROM || `BeatBloom <noreply@beatbloom.com>`;
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
   * Get email template wrapper
   */
  getEmailTemplate(content, footerText = '') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#171717;border-radius:16px;overflow:hidden;">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#ea580c,#f97316);padding:32px;text-align:center;">
                    <h1 style="margin:0;color:white;font-size:28px;font-weight:700;">🎵 BeatBloom</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding:40px 32px;">
                    ${content}
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding:24px 32px;border-top:1px solid #262626;text-align:center;">
                    <p style="margin:0;color:#737373;font-size:12px;">
                      ${footerText || '© 2026 BeatBloom. All rights reserved.'}
                    </p>
                    <p style="margin:8px 0 0;color:#525252;font-size:11px;">
                      You received this email because you signed up for BeatBloom.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Get button HTML
   */
  getButton(text, url, color = '#ea580c') {
    return `
      <a href="${url}" style="display:inline-block;background:${color};color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;margin:16px 0;">
        ${text}
      </a>
    `;
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
    const url = `${env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const content = `
      <h2 style="color:#fafafa;margin:0 0 16px;font-size:24px;">Verify Your Email</h2>
      <p style="color:#a3a3a3;margin:0 0 24px;font-size:16px;line-height:1.6;">
        Hi ${name},<br><br>
        Thanks for joining BeatBloom! Please verify your email address to get started with discovering and creating amazing beats.
      </p>
      <div style="text-align:center;">
        ${this.getButton('Verify Email', url)}
      </div>
      <p style="color:#737373;margin:24px 0 0;font-size:14px;">
        Or copy this link: <br>
        <a href="${url}" style="color:#ea580c;word-break:break-all;">${url}</a>
      </p>
      <p style="color:#525252;margin:16px 0 0;font-size:12px;">
        This link expires in 24 hours.
      </p>
    `;

    return this.send({
      to,
      subject: `Verify your email - BeatBloom`,
      html: this.getEmailTemplate(content),
      text: `Hi ${name}, verify your email: ${url}`,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to, name, token) {
    const url = `${env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const content = `
      <h2 style="color:#fafafa;margin:0 0 16px;font-size:24px;">Reset Your Password</h2>
      <p style="color:#a3a3a3;margin:0 0 24px;font-size:16px;line-height:1.6;">
        Hi ${name},<br><br>
        We received a request to reset your password. Click the button below to choose a new password.
      </p>
      <div style="text-align:center;">
        ${this.getButton('Reset Password', url, '#3b82f6')}
      </div>
      <p style="color:#737373;margin:24px 0 0;font-size:14px;">
        Or copy this link: <br>
        <a href="${url}" style="color:#ea580c;word-break:break-all;">${url}</a>
      </p>
      <p style="color:#525252;margin:16px 0 0;font-size:12px;">
        This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
      </p>
    `;

    return this.send({
      to,
      subject: `Reset your password - BeatBloom`,
      html: this.getEmailTemplate(content),
      text: `Hi ${name}, reset your password: ${url}`,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to, name) {
    const content = `
      <h2 style="color:#fafafa;margin:0 0 16px;font-size:24px;">Welcome to BeatBloom! 🎉</h2>
      <p style="color:#a3a3a3;margin:0 0 24px;font-size:16px;line-height:1.6;">
        Hi ${name},<br><br>
        Your email has been verified and your account is now active! You're all set to explore the world of premium beats.
      </p>
      <div style="background:#262626;border-radius:12px;padding:24px;margin:24px 0;">
        <h3 style="color:#fafafa;margin:0 0 16px;font-size:18px;">What you can do:</h3>
        <ul style="color:#a3a3a3;margin:0;padding-left:20px;line-height:1.8;">
          <li>🎧 Discover trending beats from top producers</li>
          <li>❤️ Like and save beats to your playlists</li>
          <li>🛒 Purchase licenses for commercial use</li>
          <li>🎤 Upload and sell your own beats (as a producer)</li>
        </ul>
      </div>
      <div style="text-align:center;">
        ${this.getButton('Start Browsing', env.FRONTEND_URL || 'http://localhost:5173')}
      </div>
    `;

    return this.send({
      to,
      subject: `Welcome to BeatBloom! 🎵`,
      html: this.getEmailTemplate(content),
      text: `Welcome to BeatBloom, ${name}! Your account is now active.`,
    });
  }

  /**
   * Send password changed notification
   */
  async sendPasswordChangedEmail(to, name) {
    const content = `
      <h2 style="color:#fafafa;margin:0 0 16px;font-size:24px;">Password Changed</h2>
      <p style="color:#a3a3a3;margin:0 0 24px;font-size:16px;line-height:1.6;">
        Hi ${name},<br><br>
        Your password was successfully changed on ${new Date().toLocaleString()}.
      </p>
      <div style="background:#262626;border-radius:12px;padding:24px;margin:24px 0;border-left:4px solid #f59e0b;">
        <p style="color:#fafafa;margin:0;font-weight:600;">⚠️ Wasn't you?</p>
        <p style="color:#a3a3a3;margin:8px 0 0;font-size:14px;">
          If you didn't make this change, please contact our support team immediately.
        </p>
      </div>
    `;

    return this.send({
      to,
      subject: `Password changed - BeatBloom`,
      html: this.getEmailTemplate(content),
      text: `Hi ${name}, your password was changed. If this wasn't you, contact support.`,
    });
  }

  /**
   * Send purchase confirmation email
   */
  async sendPurchaseConfirmation(to, name, order) {
    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #262626;">
          <p style="margin:0;color:#fafafa;font-weight:600;">${item.beatTitle}</p>
          <p style="margin:4px 0 0;color:#737373;font-size:13px;">${item.licenseName} License</p>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #262626;text-align:right;color:#fafafa;">
          $${item.price.toFixed(2)}
        </td>
      </tr>
    `
      )
      .join('');

    const content = `
      <h2 style="color:#fafafa;margin:0 0 16px;font-size:24px;">Order Confirmed! 🎉</h2>
      <p style="color:#a3a3a3;margin:0 0 24px;font-size:16px;line-height:1.6;">
        Hi ${name},<br><br>
        Thank you for your purchase! Your beats are ready to download.
      </p>
      <div style="background:#262626;border-radius:12px;padding:24px;margin:24px 0;">
        <p style="color:#737373;margin:0 0 16px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Order #${order.orderNumber}</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${itemsHtml}
          <tr>
            <td style="padding:16px 0 0;color:#fafafa;font-weight:600;">Total</td>
            <td style="padding:16px 0 0;text-align:right;color:#ea580c;font-weight:700;font-size:18px;">
              $${order.total.toFixed(2)}
            </td>
          </tr>
        </table>
      </div>
      <div style="text-align:center;">
        ${this.getButton('Download Beats', `${env.FRONTEND_URL || 'http://localhost:5173'}/purchases`)}
      </div>
    `;

    return this.send({
      to,
      subject: `Order Confirmed #${order.orderNumber} - BeatBloom`,
      html: this.getEmailTemplate(content),
      text: `Order confirmed! Order #${order.orderNumber}. Total: $${order.total.toFixed(2)}`,
    });
  }

  /**
   * Send payout notification to producer
   */
  async sendPayoutNotification(to, name, payout) {
    const content = `
      <h2 style="color:#fafafa;margin:0 0 16px;font-size:24px;">Payout ${payout.status === 'completed' ? 'Completed! 💰' : 'Processing'}</h2>
      <p style="color:#a3a3a3;margin:0 0 24px;font-size:16px;line-height:1.6;">
        Hi ${name},<br><br>
        ${
          payout.status === 'completed'
            ? 'Great news! Your payout has been sent successfully.'
            : 'Your payout request is being processed.'
        }
      </p>
      <div style="background:#262626;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
        <p style="color:#737373;margin:0;font-size:14px;">Amount</p>
        <p style="color:#22c55e;margin:8px 0 0;font-size:36px;font-weight:700;">
          $${payout.amount.toFixed(2)}
        </p>
        <p style="color:#737373;margin:16px 0 0;font-size:13px;">
          Sent to: ${payout.method}
        </p>
      </div>
    `;

    return this.send({
      to,
      subject: `Payout ${payout.status === 'completed' ? 'Completed' : 'Processing'} - BeatBloom`,
      html: this.getEmailTemplate(content),
      text: `Payout ${payout.status}: $${payout.amount.toFixed(2)} to ${payout.method}`,
    });
  }

  /**
   * Send a test email to verify configuration
   */
  async sendTestEmail(to) {
    const content = `
      <h2 style="color:#fafafa;margin:0 0 16px;font-size:24px;">Test Email Successful! 🚀</h2>
      <p style="color:#a3a3a3;margin:0 0 24px;font-size:16px;line-height:1.6;">
        If you're reading this, your BeatBloom email configuration is working perfectly!
      </p>
      <div style="background:#262626;border-radius:12px;padding:24px;margin:24px 0;border-left:4px solid #22c55e;">
        <p style="color:#fafafa;margin:0;font-weight:600;">Configuration Details:</p>
        <ul style="color:#a3a3a3;margin:8px 0 0;font-size:14px;padding-left:20px;">
          <li>Host: ${env.EMAIL_HOST}</li>
          <li>User: ${env.EMAIL_USER}</li>
          <li>From: ${this.from}</li>
          <li>Time: ${new Date().toLocaleString()}</li>
        </ul>
      </div>
    `;

    return this.send({
      to,
      subject: `Test Email - BeatBloom Configuration`,
      html: this.getEmailTemplate(content),
      text: `Your BeatBloom email configuration is working! Host: ${env.EMAIL_HOST}`,
    });
  }
}

export const emailService = new EmailService();
export default emailService;
