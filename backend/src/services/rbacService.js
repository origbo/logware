/**
 * Role-Based Access Control (RBAC) Service
 * Handles user permissions and role management
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Define Permission schema
const PermissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'manage', 'execute'],
    required: true
  },
  scope: {
    type: String,
    enum: ['global', 'team', 'self'],
    default: 'global'
  }
});

// Define Role schema
const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  isSystem: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create models if they don't exist
let Permission, Role;
try {
  Permission = mongoose.model('Permission');
} catch (error) {
  Permission = mongoose.model('Permission', PermissionSchema);
}

try {
  Role = mongoose.model('Role');
} catch (error) {
  Role = mongoose.model('Role', RoleSchema);
}

class RBACService {
  constructor() {
    // Initialize with system roles and permissions
    this.initializeSystem();
    logger.info('RBAC service initialized');
  }
  
  /**
   * Initialize system roles and permissions
   */
  async initializeSystem() {
    try {
      // Check if system permissions already exist
      const permissionCount = await Permission.countDocuments();
      if (permissionCount === 0) {
        logger.info('Initializing system permissions');
        
        // Define system permissions
        const systemPermissions = [
          // Dashboard permissions
          { name: 'dashboard:view', description: 'View dashboards', resource: 'dashboard', action: 'read' },
          { name: 'dashboard:edit', description: 'Edit dashboards', resource: 'dashboard', action: 'update' },
          
          // Alerts permissions
          { name: 'alerts:view', description: 'View security alerts', resource: 'alerts', action: 'read' },
          { name: 'alerts:acknowledge', description: 'Acknowledge security alerts', resource: 'alerts', action: 'update' },
          { name: 'alerts:resolve', description: 'Resolve security alerts', resource: 'alerts', action: 'update' },
          { name: 'alerts:delete', description: 'Delete security alerts', resource: 'alerts', action: 'delete' },
          
          // Log permissions
          { name: 'logs:view', description: 'View security logs', resource: 'logs', action: 'read' },
          { name: 'logs:export', description: 'Export security logs', resource: 'logs', action: 'read' },
          
          // User permissions
          { name: 'users:view', description: 'View users', resource: 'users', action: 'read' },
          { name: 'users:create', description: 'Create users', resource: 'users', action: 'create' },
          { name: 'users:edit', description: 'Edit users', resource: 'users', action: 'update' },
          { name: 'users:delete', description: 'Delete users', resource: 'users', action: 'delete' },
          
          // Role permissions
          { name: 'roles:view', description: 'View roles', resource: 'roles', action: 'read' },
          { name: 'roles:create', description: 'Create roles', resource: 'roles', action: 'create' },
          { name: 'roles:edit', description: 'Edit roles', resource: 'roles', action: 'update' },
          { name: 'roles:delete', description: 'Delete roles', resource: 'roles', action: 'delete' },
          
          // Report permissions
          { name: 'reports:view', description: 'View security reports', resource: 'reports', action: 'read' },
          { name: 'reports:create', description: 'Create security reports', resource: 'reports', action: 'create' },
          { name: 'reports:export', description: 'Export security reports', resource: 'reports', action: 'read' },
          
          // Configuration permissions
          { name: 'config:view', description: 'View system configuration', resource: 'config', action: 'read' },
          { name: 'config:edit', description: 'Edit system configuration', resource: 'config', action: 'update' },
          
          // Integration permissions
          { name: 'integrations:view', description: 'View security integrations', resource: 'integrations', action: 'read' },
          { name: 'integrations:manage', description: 'Manage security integrations', resource: 'integrations', action: 'manage' },
          
          // Vulnerability management
          { name: 'vulnerabilities:view', description: 'View vulnerabilities', resource: 'vulnerabilities', action: 'read' },
          { name: 'vulnerabilities:manage', description: 'Manage vulnerabilities', resource: 'vulnerabilities', action: 'manage' },
          { name: 'vulnerabilities:scan', description: 'Run vulnerability scans', resource: 'vulnerabilities', action: 'execute' },
          
          // API access
          { name: 'api:access', description: 'Access API endpoints', resource: 'api', action: 'read' },
          { name: 'api:manage', description: 'Manage API keys', resource: 'api', action: 'manage' }
        ];
        
        // Create permissions in database
        const createdPermissions = await Permission.insertMany(systemPermissions);
        logger.info(`Created ${createdPermissions.length} system permissions`);
        
        // Create permission lookup map
        const permissionMap = {};
        createdPermissions.forEach(permission => {
          permissionMap[permission.name] = permission._id;
        });
        
        // Define system roles
        const systemRoles = [
          {
            name: 'Administrator',
            description: 'Full system access and administration',
            permissions: createdPermissions.map(p => p._id),
            isSystem: true
          },
          {
            name: 'Security Analyst',
            description: 'Manages and responds to security events',
            permissions: [
              permissionMap['dashboard:view'],
              permissionMap['alerts:view'],
              permissionMap['alerts:acknowledge'],
              permissionMap['alerts:resolve'],
              permissionMap['logs:view'],
              permissionMap['logs:export'],
              permissionMap['vulnerabilities:view'],
              permissionMap['reports:view'],
              permissionMap['reports:create'],
              permissionMap['reports:export']
            ],
            isSystem: true
          },
          {
            name: 'SOC Manager',
            description: 'Oversees security operations',
            permissions: [
              permissionMap['dashboard:view'],
              permissionMap['dashboard:edit'],
              permissionMap['alerts:view'],
              permissionMap['alerts:acknowledge'],
              permissionMap['alerts:resolve'],
              permissionMap['logs:view'],
              permissionMap['logs:export'],
              permissionMap['users:view'],
              permissionMap['reports:view'],
              permissionMap['reports:create'],
              permissionMap['reports:export'],
              permissionMap['vulnerabilities:view'],
              permissionMap['vulnerabilities:manage'],
              permissionMap['vulnerabilities:scan'],
              permissionMap['config:view']
            ],
            isSystem: true
          },
          {
            name: 'Compliance Officer',
            description: 'Monitors compliance with security standards',
            permissions: [
              permissionMap['dashboard:view'],
              permissionMap['reports:view'],
              permissionMap['reports:create'],
              permissionMap['reports:export'],
              permissionMap['logs:view'],
              permissionMap['logs:export'],
              permissionMap['vulnerabilities:view']
            ],
            isSystem: true
          },
          {
            name: 'Read-Only User',
            description: 'View-only access to security data',
            permissions: [
              permissionMap['dashboard:view'],
              permissionMap['alerts:view'],
              permissionMap['logs:view'],
              permissionMap['reports:view'],
              permissionMap['vulnerabilities:view']
            ],
            isSystem: true
          }
        ];
        
        // Create roles in database
        const createdRoles = await Role.insertMany(systemRoles);
        logger.info(`Created ${createdRoles.length} system roles`);
      }
    } catch (error) {
      logger.error('Error initializing RBAC system:', error);
    }
  }
  
  /**
   * Check if a user has a specific permission
   * @param {Object} user - User object
   * @param {String} permissionName - Permission name to check
   * @returns {Promise<Boolean>} - Whether the user has the permission
   */
  async hasPermission(user, permissionName) {
    try {
      // Admin role has all permissions
      if (user.role === 'admin') {
        return true;
      }
      
      // Get user's role
      const role = await Role.findOne({ name: user.role }).populate('permissions');
      
      if (!role) {
        logger.warn(`Role not found for user ${user._id}: ${user.role}`);
        return false;
      }
      
      // Check if the role has the required permission
      const hasPermission = role.permissions.some(permission => permission.name === permissionName);
      return hasPermission;
    } catch (error) {
      logger.error(`Error checking permission "${permissionName}" for user ${user._id}:`, error);
      return false;
    }
  }
  
  /**
   * Get all available permissions
   * @returns {Promise<Array>} - List of permissions
   */
  async getAllPermissions() {
    try {
      return await Permission.find().sort({ resource: 1, name: 1 });
    } catch (error) {
      logger.error('Error getting all permissions:', error);
      throw error;
    }
  }
  
  /**
   * Get all available roles
   * @returns {Promise<Array>} - List of roles
   */
  async getAllRoles() {
    try {
      return await Role.find().populate('permissions').sort({ name: 1 });
    } catch (error) {
      logger.error('Error getting all roles:', error);
      throw error;
    }
  }
  
  /**
   * Get a role by name
   * @param {String} name - Role name
   * @returns {Promise<Object>} - Role object
   */
  async getRoleByName(name) {
    try {
      return await Role.findOne({ name }).populate('permissions');
    } catch (error) {
      logger.error(`Error getting role by name "${name}":`, error);
      throw error;
    }
  }
  
  /**
   * Create a new role
   * @param {Object} roleData - Role data
   * @returns {Promise<Object>} - Created role
   */
  async createRole(roleData) {
    try {
      const { name, description, permissions } = roleData;
      
      // Check if role already exists
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        throw new Error(`Role with name "${name}" already exists`);
      }
      
      // Create new role
      const role = new Role({
        name,
        description,
        permissions,
        isSystem: false
      });
      
      await role.save();
      logger.info(`Created new role: ${name}`);
      
      return role;
    } catch (error) {
      logger.error('Error creating role:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing role
   * @param {String} roleId - Role ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} - Updated role
   */
  async updateRole(roleId, updates) {
    try {
      const role = await Role.findById(roleId);
      
      if (!role) {
        throw new Error('Role not found');
      }
      
      // Prevent modification of system roles
      if (role.isSystem && (updates.name || updates.isSystem === false)) {
        throw new Error('System roles cannot be renamed or converted to non-system roles');
      }
      
      // Apply updates
      if (updates.name) role.name = updates.name;
      if (updates.description) role.description = updates.description;
      if (updates.permissions) role.permissions = updates.permissions;
      
      role.updatedAt = new Date();
      
      await role.save();
      logger.info(`Updated role ${roleId}: ${JSON.stringify(updates)}`);
      
      return role;
    } catch (error) {
      logger.error(`Error updating role ${roleId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a role
   * @param {String} roleId - Role ID
   * @returns {Promise<Boolean>} - Whether the deletion was successful
   */
  async deleteRole(roleId) {
    try {
      const role = await Role.findById(roleId);
      
      if (!role) {
        throw new Error('Role not found');
      }
      
      // Prevent deletion of system roles
      if (role.isSystem) {
        throw new Error('System roles cannot be deleted');
      }
      
      // Delete the role
      await Role.deleteOne({ _id: roleId });
      logger.info(`Deleted role ${roleId}`);
      
      return true;
    } catch (error) {
      logger.error(`Error deleting role ${roleId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get permissions for a user
   * @param {Object} user - User object
   * @returns {Promise<Array>} - List of permission names
   */
  async getUserPermissions(user) {
    try {
      // Admin role has all permissions
      if (user.role === 'admin') {
        const allPermissions = await Permission.find();
        return allPermissions.map(p => p.name);
      }
      
      // Get user's role and permissions
      const role = await Role.findOne({ name: user.role }).populate('permissions');
      
      if (!role) {
        logger.warn(`Role not found for user ${user._id}: ${user.role}`);
        return [];
      }
      
      return role.permissions.map(p => p.name);
    } catch (error) {
      logger.error(`Error getting permissions for user ${user._id}:`, error);
      return [];
    }
  }
}

module.exports = new RBACService();
