/**
 * User Management (Admin) Integration Tests
 *
 * Tests for admin-only user management endpoints:
 * - GET /users
 * - POST /users
 * - GET /users/:id
 * - PATCH /users/:id
 * - DELETE /users/:id
 * - PATCH /users/:id/role
 * - POST /users/:id/activate
 * - POST /users/:id/deactivate
 * - POST /users/:id/suspend
 */

import request from 'supertest';
import { app } from '../app.js';
import {
  clearDatabase,
  createTestUser,
  createAuthenticatedUser,
  createAdminUser,
  setupTests,
  teardownTests,
  getAuthHeader,
} from './setup.js';

const API_BASE = '/api/v1/users';

describe('User Management API (Admin)', () => {
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
  // Access Control Tests
  // ==========================================
  describe('Access Control', () => {
    it('should deny access to non-authenticated users', async () => {
      const res = await request(app).get(API_BASE);

      expect(res.status).toBe(401);
    });

    it('should deny access to non-admin users', async () => {
      const { accessToken } = await createAuthenticatedUser({
        role: 'artist',
      });

      const res = await request(app).get(API_BASE).set(getAuthHeader(accessToken));

      expect(res.status).toBe(403);
    });

    it('should allow access to admin users', async () => {
      const { accessToken } = await createAdminUser();

      const res = await request(app).get(API_BASE).set(getAuthHeader(accessToken));

      expect(res.status).toBe(200);
    });
  });

  // ==========================================
  // GET /users - List Users
  // ==========================================
  describe('GET /users', () => {
    it('should list all users with pagination', async () => {
      const { accessToken } = await createAdminUser();

      // Create some test users
      await createTestUser({ email: 'user1@beatbloom.com', name: 'User One' });
      await createTestUser({ email: 'user2@beatbloom.com', name: 'User Two' });

      const res = await request(app).get(API_BASE).set(getAuthHeader(accessToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2); // At least 2 + admin
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
    });

    it('should filter users by status', async () => {
      const { accessToken } = await createAdminUser();

      await createTestUser({ email: 'active@beatbloom.com', status: 'active' });
      await createTestUser({ email: 'suspended@beatbloom.com', status: 'suspended' });

      const res = await request(app)
        .get(`${API_BASE}?status=suspended`)
        .set(getAuthHeader(accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data.every((u) => u.status === 'suspended')).toBe(true);
    });

    it('should filter users by role', async () => {
      const { accessToken } = await createAdminUser();

      await createTestUser({ email: 'producer@beatbloom.com', role: 'producer' });
      await createTestUser({ email: 'artist@beatbloom.com', role: 'artist' });

      const res = await request(app)
        .get(`${API_BASE}?role=producer`)
        .set(getAuthHeader(accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data.every((u) => u.role === 'producer')).toBe(true);
    });

    it('should search users by email or name', async () => {
      const { accessToken } = await createAdminUser();

      await createTestUser({ email: 'searchme@beatbloom.com', name: 'Searchable User' });
      await createTestUser({ email: 'other@beatbloom.com', name: 'Other User' });

      const res = await request(app)
        .get(`${API_BASE}?search=searchme`)
        .set(getAuthHeader(accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].email).toBe('searchme@beatbloom.com');
    });

    it('should paginate results', async () => {
      const { accessToken } = await createAdminUser();

      // Create multiple users
      for (let i = 0; i < 5; i++) {
        await createTestUser({ email: `user${i}@beatbloom.com` });
      }

      const res = await request(app)
        .get(`${API_BASE}?page=1&limit=2`)
        .set(getAuthHeader(accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(5);
    });
  });

  // ==========================================
  // POST /users - Create User
  // ==========================================
  describe('POST /users', () => {
    it('should create a new user', async () => {
      const { accessToken } = await createAdminUser();

      const res = await request(app).post(API_BASE).set(getAuthHeader(accessToken)).send({
        email: 'newuser@beatbloom.com',
        password: 'SecurePassword123!',
        name: 'New User',
        role: 'artist',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('newuser@beatbloom.com');
      expect(res.body.data.name).toBe('New User');
      expect(res.body.data.password).toBeUndefined();
    });

    it('should create admin user', async () => {
      const { accessToken } = await createAdminUser();

      const res = await request(app).post(API_BASE).set(getAuthHeader(accessToken)).send({
        email: 'newadmin@beatbloom.com',
        password: 'SecurePassword123!',
        name: 'New Admin',
        role: 'admin',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.role).toBe('admin');
    });

    it('should fail with duplicate email', async () => {
      const { accessToken } = await createAdminUser();
      await createTestUser({ email: 'duplicate@beatbloom.com' });

      const res = await request(app).post(API_BASE).set(getAuthHeader(accessToken)).send({
        email: 'duplicate@beatbloom.com',
        password: 'SecurePassword123!',
        name: 'Duplicate',
      });

      expect(res.status).toBe(409);
    });
  });

  // ==========================================
  // GET /users/:id - Get User
  // ==========================================
  describe('GET /users/:id', () => {
    it('should get user by ID', async () => {
      const { accessToken } = await createAdminUser();
      const { user } = await createTestUser({
        email: 'getuser@beatbloom.com',
        name: 'Get User',
      });

      const res = await request(app).get(`${API_BASE}/${user.id}`).set(getAuthHeader(accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(user.id);
      expect(res.body.data.email).toBe('getuser@beatbloom.com');
    });

    it('should return 404 for non-existent user', async () => {
      const { accessToken } = await createAdminUser();

      const res = await request(app).get(`${API_BASE}/99999`).set(getAuthHeader(accessToken));

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // PATCH /users/:id - Update User
  // ==========================================
  describe('PATCH /users/:id', () => {
    it('should update user', async () => {
      const { accessToken } = await createAdminUser();
      const { user } = await createTestUser({
        email: 'update@beatbloom.com',
        name: 'Original',
      });

      const res = await request(app)
        .patch(`${API_BASE}/${user.id}`)
        .set(getAuthHeader(accessToken))
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('should update user status', async () => {
      const { accessToken } = await createAdminUser();
      const { user } = await createTestUser({ status: 'active' });

      const res = await request(app)
        .patch(`${API_BASE}/${user.id}`)
        .set(getAuthHeader(accessToken))
        .send({ status: 'inactive' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('inactive');
    });
  });

  // ==========================================
  // DELETE /users/:id - Delete User
  // ==========================================
  describe('DELETE /users/:id', () => {
    it('should soft delete user', async () => {
      const { accessToken } = await createAdminUser();
      const { user } = await createTestUser({ email: 'delete@beatbloom.com' });

      const res = await request(app)
        .delete(`${API_BASE}/${user.id}`)
        .set(getAuthHeader(accessToken));

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });

    it('should prevent self-deletion', async () => {
      const { user, accessToken } = await createAdminUser();

      const res = await request(app)
        .delete(`${API_BASE}/${user.id}`)
        .set(getAuthHeader(accessToken));

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('own account');
    });
  });

  // ==========================================
  // PATCH /users/:id/role - Update Role
  // ==========================================
  describe('PATCH /users/:id/role', () => {
    it('should update user role', async () => {
      const { accessToken } = await createAdminUser();
      const { user } = await createTestUser({ role: 'artist' });

      const res = await request(app)
        .patch(`${API_BASE}/${user.id}/role`)
        .set(getAuthHeader(accessToken))
        .send({ role: 'producer' });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('producer');
    });

    it('should promote to admin', async () => {
      const { accessToken } = await createAdminUser();
      const { user } = await createTestUser({ role: 'artist' });

      const res = await request(app)
        .patch(`${API_BASE}/${user.id}/role`)
        .set(getAuthHeader(accessToken))
        .send({ role: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('admin');
    });
  });

  // ==========================================
  // Status Actions
  // ==========================================
  describe('User Status Actions', () => {
    it('should activate user', async () => {
      const { accessToken } = await createAdminUser();
      const { user } = await createTestUser({ status: 'inactive' });

      const res = await request(app)
        .post(`${API_BASE}/${user.id}/activate`)
        .set(getAuthHeader(accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('active');
    });

    it('should deactivate user', async () => {
      const { accessToken } = await createAdminUser();
      const { user } = await createTestUser({ status: 'active' });

      const res = await request(app)
        .post(`${API_BASE}/${user.id}/deactivate`)
        .set(getAuthHeader(accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('inactive');
    });

    it('should suspend user', async () => {
      const { accessToken } = await createAdminUser();
      const { user } = await createTestUser({ status: 'active' });

      const res = await request(app)
        .post(`${API_BASE}/${user.id}/suspend`)
        .set(getAuthHeader(accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('suspended');
    });
  });

  // ==========================================
  // POST /users/:id/restore - Restore User
  // ==========================================
  describe('POST /users/:id/restore', () => {
    it('should restore deleted user', async () => {
      const { accessToken } = await createAdminUser();
      const { user } = await createTestUser({ email: 'restore@beatbloom.com' });

      // Soft delete the user first
      await request(app).delete(`${API_BASE}/${user.id}`).set(getAuthHeader(accessToken));

      // Restore user
      const res = await request(app)
        .post(`${API_BASE}/${user.id}/restore`)
        .set(getAuthHeader(accessToken));

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('restored');
    });
  });
});
