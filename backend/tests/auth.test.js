import { jest } from '@jest/globals';
import request from 'supertest';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import pool from '../src/config/db.js';

describe('Authentication API Endpoints', () => {
  const testGoogleId = 'google-auth-test-id-999';
  const testEmail = 'authtest@example.com';
  const testName = 'Automated Test User';

  let testUserId;
  let testJwtToken;
  let verifyIdTokenSpy;

  beforeAll(async () => {
    // Clean up any existing test user
    await pool.query('DELETE FROM users WHERE email = $1 OR google_id = $2', [testEmail, testGoogleId]);

    // Mock Google's OAuth2Client verifyIdToken so we don't call real Google servers
    verifyIdTokenSpy = jest.spyOn(OAuth2Client.prototype, 'verifyIdToken');
  });

  afterAll(async () => {
    // Restore original mock and clean up DB
    verifyIdTokenSpy.mockRestore();
    if (testUserId) {
      await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
    await pool.end();
  });

  describe('POST /api/auth/google', () => {
    it('should authenticate user, insert into DB, and return our JWT token', async () => {
      // Mock successful Google verification response
      verifyIdTokenSpy.mockResolvedValueOnce({
        getPayload: () => ({
          sub: testGoogleId,
          email: testEmail,
          name: testName,
        }),
      });

      const response = await request(app)
        .post('/api/auth/google')
        .send({ token: 'fake-google-id-token' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Authentication successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(testEmail);
      expect(response.body.user.name).toBe(testName);

      // Save token and userId for the subsequent /me tests
      testJwtToken = response.body.token;
      testUserId = response.body.user.id;

      // Verify user was actually inserted in PostgreSQL
      const dbUser = await pool.query('SELECT * FROM users WHERE id = $1', [testUserId]);
      expect(dbUser.rows.length).toBe(1);
      expect(dbUser.rows[0].google_id).toBe(testGoogleId);
    });

    it('should return 400 if token is missing in request body', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Google token is required'); 
    });

    it('should return 401 if Google rejects the token', async () => {
      // Mock a failed Google token verification (e.g., expired or forged token)
      verifyIdTokenSpy.mockRejectedValueOnce(new Error('Invalid token signature'));

      const response = await request(app)
        .post('/api/auth/google')
        .send({ token: 'invalid-or-expired-token' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid or expired Google token');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 200 and profile info when valid JWT is supplied', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testJwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(testUserId);
      expect(response.body.user.email).toBe(testEmail);
      expect(response.body.user.name).toBe(testName);
    });

    it('should return 401 when Authorization header is missing', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 401 when an invalid/tampered JWT is supplied', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer this.is.a.fake.token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid or expired token');
    });
  });
});
