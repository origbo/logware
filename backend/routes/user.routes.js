const express = require('express');
const router = express.Router();

// Mock user database (would connect to the same users from auth routes in a real app)
const users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    lastLogin: new Date('2025-04-17T15:30:00'),
    status: 'active',
    createdAt: new Date('2025-01-01')
  },
  {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    firstName: 'Regular',
    lastName: 'User',
    role: 'user',
    lastLogin: new Date('2025-04-16T09:15:00'),
    status: 'active',
    createdAt: new Date('2025-01-15')
  },
  {
    id: '3',
    username: 'analyst',
    email: 'analyst@example.com',
    firstName: 'Security',
    lastName: 'Analyst',
    role: 'user',
    lastLogin: new Date('2025-04-15T14:20:00'),
    status: 'active',
    createdAt: new Date('2025-02-10')
  },
  {
    id: '4',
    username: 'inactive',
    email: 'inactive@example.com',
    firstName: 'Inactive',
    lastName: 'User',
    role: 'user',
    lastLogin: new Date('2025-03-01T10:00:00'),
    status: 'inactive',
    createdAt: new Date('2025-01-20')
  }
];

// Middleware to simulate authentication
const authenticate = (req, res, next) => {
  // In a real app, this would verify the JWT token
  // For now, we'll just add a mock user to the request
  req.user = { id: '1', role: 'admin' };
  next();
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Get all users (admin only)
router.get('/', authenticate, requireAdmin, (req, res) => {
  // Return users without sensitive information
  const safeUsers = users.map(({ password, ...user }) => user);
  res.json(safeUsers);
});

// Get user by ID
router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  
  // Check if the requesting user is an admin or is requesting their own profile
  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Return user without password
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// Create new user (admin only)
router.post('/', authenticate, requireAdmin, (req, res) => {
  try {
    const { username, email, firstName, lastName, role, password } = req.body;
    
    // Validate required fields
    if (!username || !email || !firstName || !lastName || !role || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if username or email already exists
    if (users.some(u => u.username === username)) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // In a real app, we would hash the password here
    
    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      username,
      email,
      firstName,
      lastName,
      role,
      password: 'hashed-password', // Would be hashed in a real app
      status: 'active',
      createdAt: new Date(),
      lastLogin: null
    };
    
    // Add to mock database
    users.push(newUser);
    
    // Return user without password
    const { password: _, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'An error occurred while creating user' });
  }
});

// Update user
router.put('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the requesting user is an admin or is updating their own profile
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { username, email, firstName, lastName, role, status } = req.body;
    
    // Only admins can change roles or status
    if (req.user.role !== 'admin') {
      if (role && role !== users[userIndex].role) {
        return res.status(403).json({ message: 'You cannot change your role' });
      }
      
      if (status && status !== users[userIndex].status) {
        return res.status(403).json({ message: 'You cannot change your status' });
      }
    }
    
    // Update user fields
    if (username) users[userIndex].username = username;
    if (email) users[userIndex].email = email;
    if (firstName) users[userIndex].firstName = firstName;
    if (lastName) users[userIndex].lastName = lastName;
    if (role && req.user.role === 'admin') users[userIndex].role = role;
    if (status && req.user.role === 'admin') users[userIndex].status = status;
    
    // Return updated user without password
    const { password, ...safeUser } = users[userIndex];
    res.json(safeUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'An error occurred while updating user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting the last admin
    if (users[userIndex].role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last admin user' });
    }
    
    // Remove from mock database
    users.splice(userIndex, 1);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'An error occurred while deleting user' });
  }
});

// Get current user profile
router.get('/profile/me', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Return user without password
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// Update password
router.put('/profile/password', authenticate, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // In a real app, we would verify the current password and hash the new one
    // For demo purposes, we'll just update it directly
    users[userIndex].password = 'new-hashed-password';
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'An error occurred while updating password' });
  }
});

module.exports = router;
