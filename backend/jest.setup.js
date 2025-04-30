// Mock all route dependencies for testing
jest.mock('./src/api/routes/users', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.json([]));
  return router;
});

jest.mock('./src/api/routes/dashboard', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.json({}));
  return router;
});

jest.mock('./src/api/routes/logs', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.json([]));
  return router;
});

jest.mock('./src/api/routes/alerts', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.json([]));
  return router;
});

jest.mock('./src/api/routes/reports', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.json([]));
  return router;
});

jest.mock('./src/api/routes/integrations', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.json([]));
  return router;
});

jest.mock('./src/api/routes/twoFactor', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/status', (req, res) => res.json({ enabled: false }));
  router.post('/setup', (req, res) => res.json({ success: true }));
  router.post('/verify', (req, res) => res.json({ success: true }));
  return router;
});
