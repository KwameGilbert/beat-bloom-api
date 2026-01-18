/**
 * Password Reset and Email Verification Integration Tests
 *
 * Tests for:
 * - POST /auth/forgot-password
 * - POST /auth/reset-password
 * - GET /auth/verify-email
 * - POST /auth/resend-verification
 */

import request from 'supertest';
import { app } from '../app.js';
import { db } from '../database/connection.js';
import { clearDatabase, createTestUser, setupTests, teardownTests } from './setup.js';

const API_BASE = '/api/v1/auth';

describe('Password Reset & Email Verification', () => {
  beforeAll(async () => {
    await setupTests();
  });

  afterAll(async () => {
    await teardownTests();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  // ==========================================
  // POST /auth/forgot-password
  // ==========================================
  describe('POST /auth/forgot-password', () => {
    it('should accept request for existing email', async () => {
      await createTestUser({ email: 'reset@beatbloom.com' });

      const res = await request(app)
        .post(`${API_BASE}/forgot-password`)
        .send({ email: 'reset@beatbloom.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Message should be generic (not reveal if email exists)
      expect(res.body.message).toContain('If an account exists');
    });

    it('should accept request for non-existent email (no reveal)', async () => {
      const res = await request(app)
        .post(`${API_BASE}/forgot-password`)
        .send({ email: 'nonexistent@beatbloom.com' });

      // Should still return 200 to not reveal if email exists
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should create a password reset token', async () => {
      const { user } = await createTestUser({ email: 'token@beatbloom.com' });

      await request(app).post(`${API_BASE}/forgot-password`).send({ email: 'token@beatbloom.com' });

      // Check token was created in database
      const token = await db('authTokens')
        .where('userId', user.id)
        .where('type', 'passwordReset')
        .first();

      expect(token).toBeDefined();
      expect(token.token).toBeDefined();
      expect(new Date(token.expiresAt) > new Date()).toBe(true);
    });

    it('should fail with invalid email format', async () => {
      const res = await request(app)
        .post(`${API_BASE}/forgot-password`)
        .send({ email: 'invalid-email' });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // POST /auth/reset-password
  // ==========================================
  describe('POST /auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const { user } = await createTestUser({
        email: 'resetpass@beatbloom.com',
        password: 'OldPassword123!',
      });

      // Create a reset token manually
      const token = 'valid-reset-token-123456';
      await db('authTokens').insert({
        userId: user.id,
        type: 'passwordReset',
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });

      const res = await request(app).post(`${API_BASE}/reset-password`).send({
        token,
        password: 'NewPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify login with new password works
      const loginRes = await request(app).post(`${API_BASE}/login`).send({
        email: 'resetpass@beatbloom.com',
        password: 'NewPassword123!',
      });

      expect(loginRes.status).toBe(200);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app).post(`${API_BASE}/reset-password`).send({
        token: 'invalid-token',
        password: 'NewPassword123!',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid');
    });

    it('should fail with expired token', async () => {
      const { user } = await createTestUser({ email: 'expired@beatbloom.com' });

      // Create an expired token
      const token = 'expired-token-123456';
      await db('authTokens').insert({
        userId: user.id,
        type: 'passwordReset',
        token,
        expiresAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      });

      const res = await request(app).post(`${API_BASE}/reset-password`).send({
        token,
        password: 'NewPassword123!',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid');
    });

    it('should fail with already-used token', async () => {
      const { user } = await createTestUser({ email: 'used@beatbloom.com' });

      // Create a used token
      const token = 'used-token-123456';
      await db('authTokens').insert({
        userId: user.id,
        type: 'passwordReset',
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        usedAt: new Date(), // Already used
      });

      const res = await request(app).post(`${API_BASE}/reset-password`).send({
        token,
        password: 'NewPassword123!',
      });

      expect(res.status).toBe(400);
    });

    it('should fail with short password', async () => {
      const { user } = await createTestUser({ email: 'short@beatbloom.com' });

      const token = 'valid-token-short';
      await db('authTokens').insert({
        userId: user.id,
        type: 'passwordReset',
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      const res = await request(app).post(`${API_BASE}/reset-password`).send({
        token,
        password: 'short',
      });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // GET /auth/verify-email
  // ==========================================
  describe('GET /auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      const { user } = await createTestUser({
        email: 'verify@beatbloom.com',
      });

      // Create verification token
      const token = 'valid-verification-token';
      await db('authTokens').insert({
        userId: user.id,
        type: 'emailVerification',
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      const res = await request(app).get(`${API_BASE}/verify-email?token=${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verified).toBe(true);

      // Check user is now verified
      const updatedUser = await db('users').where('id', user.id).first();
      expect(updatedUser.emailVerifiedAt).not.toBeNull();
    });

    it('should fail without token', async () => {
      const res = await request(app).get(`${API_BASE}/verify-email`);

      expect(res.status).toBe(400);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app).get(`${API_BASE}/verify-email?token=invalid`);

      expect(res.status).toBe(400);
    });

    it('should fail with expired token', async () => {
      const { user } = await createTestUser({ email: 'expiredverify@beatbloom.com' });

      const token = 'expired-verify-token';
      await db('authTokens').insert({
        userId: user.id,
        type: 'emailVerification',
        token,
        expiresAt: new Date(Date.now() - 60 * 60 * 1000), // Expired
      });

      const res = await request(app).get(`${API_BASE}/verify-email?token=${token}`);

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // POST /auth/resend-verification
  // ==========================================
  describe('POST /auth/resend-verification', () => {
    it('should resend verification email', async () => {
      const { user } = await createTestUser({
        email: 'resend@beatbloom.com',
        // emailVerifiedAt is null by default
      });

      const res = await request(app)
        .post(`${API_BASE}/resend-verification`)
        .send({ email: 'resend@beatbloom.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Check new token was created
      const token = await db('authTokens')
        .where('userId', user.id)
        .where('type', 'emailVerification')
        .whereNull('usedAt')
        .first();

      expect(token).toBeDefined();
    });

    it('should fail for non-existent email (but not reveal)', async () => {
      const res = await request(app)
        .post(`${API_BASE}/resend-verification`)
        .send({ email: 'nonexistent@beatbloom.com' });

      // Should still return 200 to not reveal if email exists
      expect(res.status).toBe(200);
    });

    it('should fail for already verified email', async () => {
      await createTestUser({
        email: 'alreadyverified@beatbloom.com',
        emailVerifiedAt: new Date(),
      });

      const res = await request(app)
        .post(`${API_BASE}/resend-verification`)
        .send({ email: 'alreadyverified@beatbloom.com' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already verified');
    });
  });
});
