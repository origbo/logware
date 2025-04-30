/**
 * Authentication API Tests
 */

const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { app } = require('../../../server');
const User = require('../../../models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock the logger
jest.mock('../../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

// Setup in-memory test database
let mongoServer;

describe('Authentication API', () => {
  beforeAll(async () => {
    // Create an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    // Close database connection and stop MongoDB server
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');

      // Check that the user was added to the database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.username).toBe(userData.username);
    });

    it('should not register a user with an existing email', async () => {
      // Create a user first
      const existingUser = new User({
        username: 'existinguser',
        email: 'existing@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Existing',
        lastName: 'User'
      });
      await existingUser.save();

      // Try to register with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/already exists/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      // Create a user
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        username: 'loginuser',
        email: 'login@example.com',
        password: hashedPassword,
        firstName: 'Login',
        lastName: 'User',
        role: 'user'
      });
      await user.save();

      // Login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      
      // Verify token contains user id
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET || 'logware-secret');
      expect(decoded).toHaveProperty('user');
      expect(decoded.user.id).toBe(user.id);
    });

    it('should not login a user with invalid credentials', async () => {
      // Create a user
      const user = new User({
        username: 'badlogin',
        email: 'badlogin@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Bad',
        lastName: 'Login',
        role: 'user'
      });
      await user.save();

      // Try to login with wrong password
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'badlogin@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/invalid credentials/i);
    });
  });

  describe('GET /api/auth/user', () => {
    it('should get user data when authenticated', async () => {
      // Create a user
      const user = new User({
        username: 'getuser',
        email: 'getuser@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Get',
        lastName: 'User',
        role: 'user'
      });
      await user.save();

      // Create token for authentication
      const token = jwt.sign(
        { user: { id: user.id, role: user.role } },
        process.env.JWT_SECRET || 'logware-secret',
        { expiresIn: '1h' }
      );

      // Get user data
      const res = await request(app)
        .get('/api/auth/user')
        .set('x-auth-token', token);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', user.id);
      expect(res.body).toHaveProperty('username', user.username);
      expect(res.body).toHaveProperty('email', user.email);
      expect(res.body).not.toHaveProperty('password');
    });

    it('should not get user data without authentication', async () => {
      const res = await request(app)
        .get('/api/auth/user');

      expect(res.statusCode).toBe(401);
    });
  });
});
