/**
 * Auth API Integration Tests
 *
 * Tests for the authentication endpoints:
 * - POST /auth/register
 * - POST /auth/login
 * - GET /auth/me
 * - PATCH /auth/me
 * - PATCH /auth/settings
 * - POST /auth/change-password
 * - POST /auth/logout
 * - POST /auth/refresh
 */

import request from 'supertest';
import { app } from '../app.js';
import {
  clearDatabase,
  createTestUser,
  createAuthenticatedUser,
  setupTests,
  teardownTests,
  getAuthHeader,
} from './setup.js';

const API_BASE = '/api/v1/auth';

describe('Auth API', () => {
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
  // POST /auth/register
  // ==========================================
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post(`${API_BASE}/register`).send({
        email: 'newuser@beatbloom.com',
        password: 'SecurePassword123!',
        name: 'New User',
        role: 'artist',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe('newuser@beatbloom.com');
      expect(res.body.data.user.name).toBe('New User');
      expect(res.body.data.user.role).toBe('artist');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      // Password should not be returned
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should register a producer user', async () => {
      const res = await request(app).post(`${API_BASE}/register`).send({
        email: 'producer@beatbloom.com',
        password: 'SecurePassword123!',
        name: 'Producer User',
        role: 'producer',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('producer');
    });

    it('should fail with duplicate email', async () => {
      // Create first user
      await createTestUser({ email: 'duplicate@beatbloom.com' });

      // Try to register with same email
      const res = await request(app).post(`${API_BASE}/register`).send({
        email: 'duplicate@beatbloom.com',
        password: 'SecurePassword123!',
        name: 'Duplicate User',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exists');
    });

    it('should fail with invalid email format', async () => {
      const res = await request(app).post(`${API_BASE}/register`).send({
        email: 'invalid-email',
        password: 'SecurePassword123!',
        name: 'Invalid Email User',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with short password', async () => {
      const res = await request(app).post(`${API_BASE}/register`).send({
        email: 'user@beatbloom.com',
        password: 'short',
        name: 'Short Password User',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail without required fields', async () => {
      const res = await request(app).post(`${API_BASE}/register`).send({
        email: 'user@beatbloom.com',
        // Missing password and name
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // POST /auth/login
  // ==========================================
  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const { user, password } = await createTestUser({
        email: 'login@beatbloom.com',
      });

      const res = await request(app).post(`${API_BASE}/login`).send({
        email: 'login@beatbloom.com',
        password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.id).toBe(user.id);
      expect(res.body.data.user.email).toBe('login@beatbloom.com');
    });

    it('should be case-insensitive for email', async () => {
      await createTestUser({
        email: 'CaseTest@beatbloom.com',
        password: 'TestPassword123!',
      });

      const res = await request(app).post(`${API_BASE}/login`).send({
        email: 'casetest@BEATBLOOM.COM',
        password: 'TestPassword123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail with wrong password', async () => {
      await createTestUser({
        email: 'wrongpass@beatbloom.com',
        password: 'CorrectPassword123!',
      });

      const res = await request(app).post(`${API_BASE}/login`).send({
        email: 'wrongpass@beatbloom.com',
        password: 'WrongPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid');
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app).post(`${API_BASE}/login`).send({
        email: 'nonexistent@beatbloom.com',
        password: 'AnyPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with inactive user', async () => {
      await createTestUser({
        email: 'inactive@beatbloom.com',
        password: 'TestPassword123!',
        status: 'inactive',
      });

      const res = await request(app).post(`${API_BASE}/login`).send({
        email: 'inactive@beatbloom.com',
        password: 'TestPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('not active');
    });
  });

  // ==========================================
  // GET /auth/me
  // ==========================================
  describe('GET /auth/me', () => {
    it('should return current user profile', async () => {
      const { user, accessToken } = await createAuthenticatedUser({
        email: 'profile@beatbloom.com',
        name: 'Profile User',
      });

      const res = await request(app).get(`${API_BASE}/me`).set(getAuthHeader(accessToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(user.id);
      expect(res.body.data.email).toBe('profile@beatbloom.com');
      expect(res.body.data.name).toBe('Profile User');
      expect(res.body.data.password).toBeUndefined();
    });

    it('should fail without auth token', async () => {
      const res = await request(app).get(`${API_BASE}/me`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app).get(`${API_BASE}/me`).set(getAuthHeader('invalid-token'));

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // PATCH /auth/me
  // ==========================================
  describe('PATCH /auth/me', () => {
    it('should update user profile', async () => {
      const { accessToken } = await createAuthenticatedUser({
        email: 'update@beatbloom.com',
        name: 'Original Name',
      });

      const res = await request(app).patch(`${API_BASE}/me`).set(getAuthHeader(accessToken)).send({
        name: 'Updated Name',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('should update avatar URL', async () => {
      const { accessToken } = await createAuthenticatedUser();

      const res = await request(app).patch(`${API_BASE}/me`).set(getAuthHeader(accessToken)).send({
        avatar: 'https://example.com/avatar.jpg',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should not allow updating role', async () => {
      const { accessToken } = await createAuthenticatedUser({
        role: 'artist',
      });

      const res = await request(app).patch(`${API_BASE}/me`).set(getAuthHeader(accessToken)).send({
        role: 'admin', // Should be ignored
        name: 'Trying to be Admin',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('artist'); // Role unchanged
    });

    it('should fail without auth', async () => {
      const res = await request(app).patch(`${API_BASE}/me`).send({ name: 'New Name' });

      expect(res.status).toBe(401);
    });
  });

  // ==========================================
  // PATCH /auth/settings
  // ==========================================
  describe('PATCH /auth/settings', () => {
    it('should update user settings', async () => {
      const { accessToken } = await createAuthenticatedUser({
        emailNotifications: true,
        pushNotifications: false,
        theme: 'dark',
      });

      const res = await request(app)
        .patch(`${API_BASE}/settings`)
        .set(getAuthHeader(accessToken))
        .send({
          emailNotifications: false,
          pushNotifications: true,
          theme: 'light',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.emailNotifications).toBe(false);
      expect(res.body.data.pushNotifications).toBe(true);
      expect(res.body.data.theme).toBe('light');
    });

    it('should update public profile setting', async () => {
      const { accessToken } = await createAuthenticatedUser({
        publicProfile: true,
      });

      const res = await request(app)
        .patch(`${API_BASE}/settings`)
        .set(getAuthHeader(accessToken))
        .send({
          publicProfile: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.publicProfile).toBe(false);
    });
  });

  // ==========================================
  // POST /auth/change-password
  // ==========================================
  describe('POST /auth/change-password', () => {
    it('should change password successfully', async () => {
      const { accessToken, password } = await createAuthenticatedUser({
        email: 'changepass@beatbloom.com',
      });

      const res = await request(app)
        .post(`${API_BASE}/change-password`)
        .set(getAuthHeader(accessToken))
        .send({
          currentPassword: password,
          newPassword: 'NewSecurePassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify can login with new password
      const loginRes = await request(app).post(`${API_BASE}/login`).send({
        email: 'changepass@beatbloom.com',
        password: 'NewSecurePassword123!',
      });

      expect(loginRes.status).toBe(200);
    });

    it('should fail with wrong current password', async () => {
      const { accessToken } = await createAuthenticatedUser();

      const res = await request(app)
        .post(`${API_BASE}/change-password`)
        .set(getAuthHeader(accessToken))
        .send({
          currentPassword: 'WrongCurrentPassword!',
          newPassword: 'NewSecurePassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('incorrect');
    });

    it('should fail with short new password', async () => {
      const { accessToken, password } = await createAuthenticatedUser();

      const res = await request(app)
        .post(`${API_BASE}/change-password`)
        .set(getAuthHeader(accessToken))
        .send({
          currentPassword: password,
          newPassword: 'short',
        });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // POST /auth/refresh
  // ==========================================
  describe('POST /auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const { refreshToken } = await createAuthenticatedUser();

      const res = await request(app).post(`${API_BASE}/refresh`).send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app)
        .post(`${API_BASE}/refresh`)
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
    });

    it('should fail without refresh token', async () => {
      const res = await request(app).post(`${API_BASE}/refresh`).send({});

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // POST /auth/logout
  // ==========================================
  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const { accessToken, refreshToken } = await createAuthenticatedUser();

      const res = await request(app)
        .post(`${API_BASE}/logout`)
        .set(getAuthHeader(accessToken))
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Logged out');
    });
  });
});
