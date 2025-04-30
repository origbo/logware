/**
 * Authentication API Integration Tests
 * Tests the complete authentication flow including registration, login, and 2FA
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../../server');
const User = require('../../models/User');
const speakeasy = require('speakeasy');

let mongoServer;

// Test user data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test@123456',
  role: 'user'
};

// Connect to in-memory database before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };
  
  await mongoose.connect(uri, mongooseOpts);
});

// Clear database between tests
beforeEach(async () => {
  await User.deleteMany({});
});

// Disconnect and close database after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Authentication API', () => {
  describe('User Registration', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
      
      // Verify user was created in database
      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeTruthy();
      expect(user.username).toBe(testUser.username);
      expect(user.role).toBe(testUser.role);
    });
    
    it('should return error for existing email', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      // Try to create user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('exists');
    });
    
    it('should validate user input', async () => {
      const invalidUser = {
        username: 'te', // Too short
        email: 'invalid-email',
        password: '123' // Too short
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('User Login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });
    
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });
    
    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid credentials');
    });
    
    it('should reject login for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid credentials');
    });
  });
  
  describe('Two-Factor Authentication', () => {
    let userId;
    let authToken;
    let secret;
    
    beforeEach(async () => {
      // Create a test user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      authToken = registerResponse.body.token;
      
      // Get user ID
      const user = await User.findOne({ email: testUser.email });
      userId = user._id;
      
      // Setup 2FA for the user
      secret = speakeasy.generateSecret();
      user.twoFactorSecret = secret.base32;
      user.twoFactorEnabled = true;
      await user.save();
    });
    
    it('should require 2FA code on login when enabled', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('requiresTwoFactor');
      expect(response.body.requiresTwoFactor).toBe(true);
      expect(response.body).not.toHaveProperty('token');
    });
    
    it('should login with valid 2FA code', async () => {
      // Generate valid TOTP code
      const token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32'
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
          twoFactorToken: token
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });
    
    it('should reject login with invalid 2FA code', async () => {
      // Use an invalid TOTP code
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
          twoFactorToken: '000000' // Invalid code
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid two-factor authentication code');
    });
    
    it('should verify 2FA code separately', async () => {
      // Generate valid TOTP code
      const token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32'
      });
      
      const response = await request(app)
        .post('/api/auth/verify-2fa')
        .send({
          email: testUser.email,
          token
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('verified');
      expect(response.body.verified).toBe(true);
    });
  });
  
  describe('Protected Routes', () => {
    let authToken;
    
    beforeEach(async () => {
      // Create a test user and get token
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      authToken = response.body.token;
    });
    
    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe(testUser.email);
    });
    
    it('should reject access without token', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .expect(401);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No token');
    });
    
    it('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Token is not valid');
    });
  });
});
