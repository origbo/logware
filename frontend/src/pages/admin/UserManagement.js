import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
  InputAdornment, Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

// Mock API call for users data
const fetchUsers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'user1',
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          status: 'active',
          lastLogin: new Date(Date.now() - 3600000), // 1 hour ago
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        },
        {
          id: 'user2',
          username: 'john.doe',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          status: 'active',
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
        },
        {
          id: 'user3',
          username: 'jane.smith',
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'user',
          status: 'active',
          lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago
        },
        {
          id: 'user4',
          username: 'robert.johnson',
          email: 'robert.johnson@example.com',
          firstName: 'Robert',
          lastName: 'Johnson',
          role: 'user',
          status: 'inactive',
          lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
        },
        {
          id: 'user5',
          username: 'sarah.miller',
          email: 'sarah.miller@example.com',
          firstName: 'Sarah',
          lastName: 'Miller',
          role: 'user',
          status: 'active',
          lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
        }
      ]);
    }, 1000);
  });
};

// User form dialog
const UserFormDialog = ({ open, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'user',
    status: 'active',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role || 'user',
        status: user.status || 'active',
        password: '',
        confirmPassword: ''
      });
    } else {
      // Reset form for new user
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'user',
        status: 'active',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user, open]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };
  
  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!user && !formData.password) {
      setError('Password is required for new users');
      return false;
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Remove confirmPassword before saving
    const userData = { ...formData };
    delete userData.confirmPassword;
    
    // If editing and no new password is provided, remove password field
    if (user && !userData.password) {
      delete userData.password;
    }
    
    // Simulate API call
    setTimeout(() => {
      onSave(userData);
      setLoading(false);
      onClose();
    }, 1000);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                label="Role"
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="password"
              label={user ? "New Password (leave blank to keep current)" : "Password"}
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
              required={!user}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              fullWidth
              required={!user || Boolean(formData.password)}
              disabled={!formData.password && Boolean(user)}
            />
          </Grid>
        </Grid>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : (user ? 'Update' : 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Delete confirmation dialog
const DeleteUserDialog = ({ open, onClose, user, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  
  const handleDelete = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onConfirm(user.id);
      setLoading(false);
      onClose();
    }, 1000);
  };
  
  if (!user) return null;
  
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete User</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the user <strong>{user.username}</strong>?
        </Typography>
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleDelete} 
          variant="contained" 
          color="error"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormDialogOpen(true);
  };
  
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormDialogOpen(true);
  };
  
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };
  
  const handleSaveUser = (userData) => {
    if (selectedUser) {
      // Update existing user
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === selectedUser.id ? { ...user, ...userData } : user
      ));
    } else {
      // Add new user
      const newUser = {
        id: `user${Date.now()}`,
        ...userData,
        lastLogin: null,
        createdAt: new Date()
      };
      setUsers(prevUsers => [newUser, ...prevUsers]);
    }
  };
  
  const handleConfirmDelete = (userId) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(query)
    );
  });
  
  // Paginate users
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Box>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={loadUsers}
            variant="outlined"
            color="secondary"
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            startIcon={<PersonAddIcon />}
            variant="contained"
            color="secondary"
            onClick={handleAddUser}
          >
            Add User
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={0} sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role === 'admin' ? 'Administrator' : 'User'} 
                        color={user.role === 'admin' ? 'secondary' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.status === 'active' ? 'Active' : 'Inactive'} 
                        color={user.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? user.lastLogin.toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditUser(user)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.role === 'admin' && user.username === 'admin'} // Prevent deleting main admin
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Dialogs */}
      <UserFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
      
      <DeleteUserDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        user={selectedUser}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default UserManagement;
