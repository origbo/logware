/**
 * Role-Based Access Control (RBAC) Service Unit Tests
 */

const rbacService = require('../../services/rbacService');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('mongoose');
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

describe('RBAC Service', () => {
  // Mock Permission and Role models
  const mockPermissionModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
    insertMany: jest.fn()
  };

  const mockRoleModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    insertMany: jest.fn(),
    deleteOne: jest.fn()
  };

  // Mock global constructors before tests run
  global.Role = jest.fn().mockImplementation(function(data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(true)
    };
  });
  
  global.Permission = jest.fn().mockImplementation(function(data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(true)
    };
  });

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup mongoose model mocks
    mongoose.model.mockImplementation((modelName) => {
      if (modelName === 'Permission') {
        return mockPermissionModel;
      } else if (modelName === 'Role') {
        return mockRoleModel;
      }
    });
    
    // Mock save method for models
    const mockSave = jest.fn().mockResolvedValue(true);
    
    // Mock for role creation/update
    mockRoleModel.findOne.mockImplementation((query) => {
      if (query && query.name === 'ExistingRole') {
        return Promise.resolve({ name: 'ExistingRole' });
      }
      return Promise.resolve(null);
    });
    
    mockRoleModel.findById.mockImplementation((id) => {
      if (id === 'nonexistent') {
        return Promise.resolve(null);
      }
      if (id === 'system-role') {
        return Promise.resolve({
          _id: 'system-role',
          name: 'Administrator',
          isSystem: true,
          save: mockSave
        });
      }
      return Promise.resolve({
        _id: id,
        name: 'TestRole',
        isSystem: false,
        permissions: ['perm1', 'perm2'],
        save: mockSave
      });
    });
  });

  describe('initializeSystem', () => {
    it('should initialize system permissions when none exist', async () => {
      // No permissions in the database
      mockPermissionModel.countDocuments.mockResolvedValueOnce(0);
      mockPermissionModel.insertMany.mockResolvedValueOnce([
        { _id: 'perm1', name: 'dashboard:view' },
        { _id: 'perm2', name: 'alerts:view' }
      ]);
      
      await rbacService.initializeSystem();
      
      expect(mockPermissionModel.countDocuments).toHaveBeenCalled();
      expect(mockPermissionModel.insertMany).toHaveBeenCalled();
      expect(mockRoleModel.insertMany).toHaveBeenCalled();
    });
    
    it('should skip initialization if permissions already exist', async () => {
      // Permissions already exist
      mockPermissionModel.countDocuments.mockResolvedValueOnce(10);
      
      await rbacService.initializeSystem();
      
      expect(mockPermissionModel.countDocuments).toHaveBeenCalled();
      expect(mockPermissionModel.insertMany).not.toHaveBeenCalled();
      expect(mockRoleModel.insertMany).not.toHaveBeenCalled();
    });
    
    it('should handle errors during initialization', async () => {
      mockPermissionModel.countDocuments.mockRejectedValueOnce(new Error('Database error'));
      
      await rbacService.initializeSystem();
      
      // Should not throw, but log the error
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin role regardless of permission', async () => {
      const user = { _id: 'user1', role: 'admin' };
      
      const result = await rbacService.hasPermission(user, 'anyPermission');
      
      expect(result).toBe(true);
    });
    
    it('should check role permissions for non-admin users', async () => {
      const user = { _id: 'user1', role: 'analyst' };
      
      // Mock role with permissions
      mockRoleModel.findOne.mockResolvedValueOnce({
        name: 'analyst',
        permissions: [
          { name: 'dashboard:view' },
          { name: 'alerts:view' }
        ]
      });
      
      // Should have this permission
      const result1 = await rbacService.hasPermission(user, 'dashboard:view');
      expect(result1).toBe(true);
      
      // Reset mock for second call
      mockRoleModel.findOne.mockResolvedValueOnce({
        name: 'analyst',
        permissions: [
          { name: 'dashboard:view' },
          { name: 'alerts:view' }
        ]
      });
      
      // Should not have this permission
      const result2 = await rbacService.hasPermission(user, 'users:delete');
      expect(result2).toBe(false);
    });
    
    it('should return false if role is not found', async () => {
      const user = { _id: 'user1', role: 'nonexistent' };
      
      // Role doesn't exist
      mockRoleModel.findOne.mockResolvedValueOnce(null);
      
      const result = await rbacService.hasPermission(user, 'dashboard:view');
      
      expect(result).toBe(false);
    });
    
    it('should handle errors when checking permissions', async () => {
      const user = { _id: 'user1', role: 'analyst' };
      
      mockRoleModel.findOne.mockRejectedValueOnce(new Error('Database error'));
      
      const result = await rbacService.hasPermission(user, 'dashboard:view');
      
      expect(result).toBe(false);
    });
  });

  describe('getAllPermissions', () => {
    it('should return all permissions', async () => {
      const mockPermissions = [
        { name: 'dashboard:view', resource: 'dashboard' },
        { name: 'alerts:view', resource: 'alerts' }
      ];
      
      mockPermissionModel.find.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValue(mockPermissions)
      });
      
      const result = await rbacService.getAllPermissions();
      
      expect(mockPermissionModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockPermissions);
    });
    
    it('should handle errors when getting permissions', async () => {
      mockPermissionModel.find.mockReturnValueOnce({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });
      
      await expect(rbacService.getAllPermissions()).rejects.toThrow('Database error');
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles with populated permissions', async () => {
      const mockRoles = [
        { name: 'Administrator', permissions: [] },
        { name: 'Analyst', permissions: [] }
      ];
      
      mockRoleModel.find.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockRoles)
        })
      });
      
      const result = await rbacService.getAllRoles();
      
      expect(mockRoleModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockRoles);
    });
    
    it('should handle errors when getting roles', async () => {
      mockRoleModel.find.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });
      
      await expect(rbacService.getAllRoles()).rejects.toThrow('Database error');
    });
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const roleData = {
        name: 'NewRole',
        description: 'A new test role',
        permissions: ['perm1', 'perm2']
      };
      
      // Role doesn't exist yet
      mockRoleModel.findOne.mockResolvedValueOnce(null);
      
      // Mock Role constructor
      const mockRole = {
        ...roleData,
        isSystem: false,
        save: jest.fn().mockResolvedValue(true)
      };
      
      jest.spyOn(global, 'Role').mockImplementation(() => mockRole);
      
      const result = await rbacService.createRole(roleData);
      
      expect(mockRoleModel.findOne).toHaveBeenCalledWith({ name: roleData.name });
      expect(result).toEqual(mockRole);
      expect(mockRole.save).toHaveBeenCalled();
    });
    
    it('should reject if role already exists', async () => {
      const roleData = {
        name: 'ExistingRole',
        description: 'This role already exists',
        permissions: ['perm1']
      };
      
      // Role already exists
      mockRoleModel.findOne.mockResolvedValueOnce({ name: 'ExistingRole' });
      
      await expect(rbacService.createRole(roleData)).rejects.toThrow('already exists');
    });
  });

  describe('updateRole', () => {
    it('should update an existing role', async () => {
      const roleId = 'role123';
      const updates = {
        name: 'UpdatedRole',
        description: 'Updated description'
      };
      
      const mockRole = {
        _id: roleId,
        name: 'TestRole',
        description: 'Original description',
        isSystem: false,
        save: jest.fn().mockResolvedValue(true)
      };
      
      mockRoleModel.findById.mockResolvedValueOnce(mockRole);
      
      const result = await rbacService.updateRole(roleId, updates);
      
      expect(mockRoleModel.findById).toHaveBeenCalledWith(roleId);
      expect(mockRole.name).toBe(updates.name);
      expect(mockRole.description).toBe(updates.description);
      expect(mockRole.save).toHaveBeenCalled();
      expect(result).toEqual(mockRole);
    });
    
    it('should prevent renaming system roles', async () => {
      const roleId = 'system-role';
      const updates = {
        name: 'NewName',
        description: 'Updated description'
      };
      
      const mockRole = {
        _id: roleId,
        name: 'Administrator',
        description: 'Original description',
        isSystem: true,
        save: jest.fn().mockResolvedValue(true)
      };
      
      mockRoleModel.findById.mockResolvedValueOnce(mockRole);
      
      await expect(rbacService.updateRole(roleId, updates)).rejects.toThrow('System roles cannot be renamed');
    });
    
    it('should reject if role does not exist', async () => {
      mockRoleModel.findById.mockResolvedValueOnce(null);
      
      await expect(rbacService.updateRole('nonexistent', {})).rejects.toThrow('Role not found');
    });
  });

  describe('deleteRole', () => {
    it('should delete a non-system role', async () => {
      const roleId = 'role123';
      
      const mockRole = {
        _id: roleId,
        name: 'TestRole',
        isSystem: false
      };
      
      mockRoleModel.findById.mockResolvedValueOnce(mockRole);
      mockRoleModel.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
      
      const result = await rbacService.deleteRole(roleId);
      
      expect(mockRoleModel.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleModel.deleteOne).toHaveBeenCalledWith({ _id: roleId });
      expect(result).toBe(true);
    });
    
    it('should prevent deleting system roles', async () => {
      const roleId = 'system-role';
      
      const mockRole = {
        _id: roleId,
        name: 'Administrator',
        isSystem: true
      };
      
      mockRoleModel.findById.mockResolvedValueOnce(mockRole);
      
      await expect(rbacService.deleteRole(roleId)).rejects.toThrow('System roles cannot be deleted');
      expect(mockRoleModel.deleteOne).not.toHaveBeenCalled();
    });
    
    it('should reject if role does not exist', async () => {
      mockRoleModel.findById.mockResolvedValueOnce(null);
      
      await expect(rbacService.deleteRole('nonexistent')).rejects.toThrow('Role not found');
    });
  });

  describe('getUserPermissions', () => {
    it('should return all permissions for admin users', async () => {
      const user = { _id: 'user1', role: 'admin' };
      
      const mockPermissions = [
        { name: 'dashboard:view' },
        { name: 'alerts:view' }
      ];
      
      mockPermissionModel.find.mockResolvedValueOnce(mockPermissions);
      
      const result = await rbacService.getUserPermissions(user);
      
      expect(mockPermissionModel.find).toHaveBeenCalled();
      expect(result).toEqual(['dashboard:view', 'alerts:view']);
    });
    
    it('should return role-specific permissions for non-admin users', async () => {
      const user = { _id: 'user1', role: 'analyst' };
      
      mockRoleModel.findOne.mockResolvedValueOnce({
        name: 'analyst',
        permissions: [
          { name: 'dashboard:view' },
          { name: 'alerts:view' }
        ]
      });
      
      const result = await rbacService.getUserPermissions(user);
      
      expect(mockRoleModel.findOne).toHaveBeenCalledWith({ name: user.role });
      expect(result).toEqual(['dashboard:view', 'alerts:view']);
    });
    
    it('should return empty array if role is not found', async () => {
      const user = { _id: 'user1', role: 'nonexistent' };
      
      mockRoleModel.findOne.mockResolvedValueOnce(null);
      
      const result = await rbacService.getUserPermissions(user);
      
      expect(result).toEqual([]);
    });
    
    it('should handle errors when getting user permissions', async () => {
      const user = { _id: 'user1', role: 'analyst' };
      
      mockRoleModel.findOne.mockRejectedValueOnce(new Error('Database error'));
      
      const result = await rbacService.getUserPermissions(user);
      
      expect(result).toEqual([]);
    });
  });
});
