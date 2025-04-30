const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock user database for demo purposes
const users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1dXgGkbLQAU2hHgJUJCop.rEkOg4i', // "password"
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: new Date('2025-01-01')
  },
  {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LG1dXgGkbLQAU2hHgJUJCop.rEkOg4i', // "password"
    firstName: 'Regular',
    lastName: 'User',
    role: 'user',
    createdAt: new Date('2025-01-15')
  }
];

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      'your-secret-key', // This would be in an environment variable in production
      { expiresIn: '1h' }
    );
    
    // Return user info (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, company, jobTitle } = req.body;
    
    // Check if username or email already exists
    if (users.some(u => u.username === username)) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user (in a real app, this would be saved to a database)
    const newUser = {
      id: (users.length + 1).toString(),
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      company: company || '',
      jobTitle: jobTitle || '',
      role: 'user', // Default role for new users
      createdAt: new Date()
    };
    
    // Add to mock database
    users.push(newUser);
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'An error occurred during registration' });
  }
});

// Password reset request route
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  
  // Check if user exists
  const user = users.find(u => u.email === email);
  
  if (!user) {
    // For security reasons, don't reveal that the user doesn't exist
    return res.json({ message: 'If your email is registered, you will receive a password reset link' });
  }
  
  // In a real app, this would generate a token and send an email
  // For now, we'll just simulate a successful request
  
  res.json({ message: 'If your email is registered, you will receive a password reset link' });
});

// Validate auth token (for frontend authentication checks)
router.get('/validate-token', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, 'your-secret-key');
    
    // Find user
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ valid: false });
    }
    
    // Token is valid
    res.json({ valid: true, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
