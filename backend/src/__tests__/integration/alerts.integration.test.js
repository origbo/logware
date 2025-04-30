/**
 * Alerts API Integration Tests
 * Tests the complete alerts flow including fetching, filtering, and updating
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../../server');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

let mongoServer;
let token;
let adminToken;

// Test user data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test@123456',
  role: 'user'
};

const adminUser = {
  username: 'adminuser',
  email: 'admin@example.com',
  password: 'Admin@123456',
  role: 'admin'
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
  
  // Create test users
  const user = new User(testUser);
  const admin = new User(adminUser);
  
  // Hash passwords
  const salt = await require('bcryptjs').genSalt(10);
  user.password = await require('bcryptjs').hash(testUser.password, salt);
  admin.password = await require('bcryptjs').hash(adminUser.password, salt);
  
  await user.save();
  await admin.save();
  
  // Create tokens
  const userPayload = { user: { id: user.id, role: user.role } };
  const adminPayload = { user: { id: admin.id, role: admin.role } };
  
  token = jwt.sign(
    userPayload,
    process.env.JWT_SECRET || 'logware-secret',
    { expiresIn: '1h' }
  );
  
  adminToken = jwt.sign(
    adminPayload,
    process.env.JWT_SECRET || 'logware-secret',
    { expiresIn: '1h' }
  );
});

// Disconnect and close database after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Alerts API', () => {
  describe('GET /api/alerts', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/alerts')
        .expect(401);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('token');
    });
    
    it('should fetch all alerts for authenticated user', async () => {
      const response = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBeTruthy();
    });
    
    it('should filter alerts by severity', async () => {
      const response = await request(app)
        .get('/api/alerts?severity=high')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBeTruthy();
      
      // Every alert should have the filtered severity
      if (response.body.length > 0) {
        response.body.forEach(alert => {
          expect(alert.severity).toBe('high');
        });
      }
    });
    
    it('should filter alerts by status', async () => {
      const response = await request(app)
        .get('/api/alerts?status=open')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBeTruthy();
      
      // Every alert should have the filtered status
      if (response.body.length > 0) {
        response.body.forEach(alert => {
          expect(alert.status).toBe('open');
        });
      }
    });
    
    it('should limit number of alerts returned', async () => {
      const limit = 5;
      const response = await request(app)
        .get(`/api/alerts?limit=${limit}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeLessThanOrEqual(limit);
    });
  });
  
  describe('GET /api/alerts/summary', () => {
    it('should return summary of alerts by severity', async () => {
      const response = await request(app)
        .get('/api/alerts/summary')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('bySeverity');
      expect(response.body.bySeverity).toHaveProperty('critical');
      expect(response.body.bySeverity).toHaveProperty('high');
      expect(response.body.bySeverity).toHaveProperty('medium');
      expect(response.body.bySeverity).toHaveProperty('low');
    });
  });
  
  describe('GET /api/alerts/trends', () => {
    it('should return alert trends over time', async () => {
      const response = await request(app)
        .get('/api/alerts/trends')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBeTruthy();
      
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('date');
        expect(response.body[0]).toHaveProperty('count');
      }
    });
    
    it('should accept timeframe parameter', async () => {
      const response = await request(app)
        .get('/api/alerts/trends?timeframe=week')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });
  
  describe('GET /api/alerts/:id', () => {
    let alertId;
    
    // Get an alert ID first
    beforeAll(async () => {
      const response = await request(app)
        .get('/api/alerts?limit=1')
        .set('Authorization', `Bearer ${token}`);
      
      if (response.body.length > 0) {
        alertId = response.body[0].id;
      }
    });
    
    it('should get alert details by ID', async () => {
      // Skip if no alerts found
      if (!alertId) {
        return;
      }
      
      const response = await request(app)
        .get(`/api/alerts/${alertId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('id', alertId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('severity');
      expect(response.body).toHaveProperty('status');
    });
    
    it('should return 404 for non-existent alert', async () => {
      const response = await request(app)
        .get('/api/alerts/nonexistentid')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });
  
  describe('PUT /api/alerts/:id', () => {
    let alertId;
    
    // Get an alert ID first
    beforeAll(async () => {
      const response = await request(app)
        .get('/api/alerts?limit=1')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.body.length > 0) {
        alertId = response.body[0].id;
      }
    });
    
    it('should update alert status', async () => {
      // Skip if no alerts found
      if (!alertId) {
        return;
      }
      
      const update = {
        status: 'acknowledged',
        notes: 'Testing alert update'
      };
      
      const response = await request(app)
        .put(`/api/alerts/${alertId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(update)
        .expect(200);
      
      expect(response.body).toHaveProperty('id', alertId);
      expect(response.body).toHaveProperty('status', update.status);
      expect(response.body).toHaveProperty('notes', update.notes);
    });
    
    it('should restrict alert updates for non-admin users', async () => {
      // Skip if no alerts found
      if (!alertId) {
        return;
      }
      
      const update = {
        status: 'resolved'
      };
      
      // Using regular user token
      const response = await request(app)
        .put(`/api/alerts/${alertId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(update)
        .expect(403);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('permission');
    });
    
    it('should validate update data', async () => {
      // Skip if no alerts found
      if (!alertId) {
        return;
      }
      
      const update = {
        status: 'invalid-status' // Invalid status value
      };
      
      const response = await request(app)
        .put(`/api/alerts/${alertId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(update)
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('validation');
    });
  });
});
