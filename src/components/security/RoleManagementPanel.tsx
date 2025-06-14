import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  Shield, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Search 
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { adminService } from '../../services/adminService';
import { UserRole } from '../../types/user';

const RoleManagementPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    name: '',
    role: 'student' as UserRole,
    institutionId: ''
  });
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    loadInstitutions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadInstitutions = async () => {
    try {
      const data = await adminService.getInstitutions();
      setInstitutions(data);
    } catch (error) {
      console.error('Error loading institutions:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleUpdateRole = async (userId: string) => {
    try {
      setError(null);
      setSuccess(null);
      
      await adminService.updateUserRole(userId, selectedRole);
      
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, role: selectedRole } 
            : user
        )
      );
      
      setEditingUserId(null);
      setSelectedRole('student');
      setSuccess('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role');
    }
  };

  const handleAddUser = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      // Validate inputs
      if (!newUserData.email || !newUserData.name) {
        setError('Email and name are required');
        return;
      }
      
      if (newUserData.role === 'institution_admin' && !newUserData.institutionId) {
        setError('Institution is required for institution admins');
        return;
      }
      
      // Create user
      const newUser = await adminService.createUser(newUserData);
      
      // Update local state
      setUsers(prev => [...prev, newUser]);
      
      // Reset form
      setNewUserData({
        email: '',
        name: '',
        role: 'student',
        institutionId: ''
      });
      
      setShowAddUser(false);
      setSuccess('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      
      await adminService.deleteUser(userId);
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      setSuccess('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Role Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user roles and permissions
          </p>
        </div>
        <Button
          onClick={() => setShowAddUser(!showAddUser)}
          leftIcon={showAddUser ? <X size={16} /> : <Plus size={16} />}
        >
          {showAddUser ? 'Cancel' : 'Add User'}
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-900 dark:text-red-300">Error</h4>
            <p className="mt-1 text-sm text-red-700 dark:text-red-200">
              {error}
            </p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-900 dark:text-green-300">Success</h4>
            <p className="mt-1 text-sm text-green-700 dark:text-green-200">
              {success}
            </p>
          </div>
        </div>
      )}

      {/* Add User Form */}
      {showAddUser && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New User</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />
                <Input
                  label="Name"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full Name"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="student">Student</option>
                    <option value="institution_admin">Institution Admin</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                
                {newUserData.role === 'institution_admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Institution
                    </label>
                    <select
                      value={newUserData.institutionId}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, institutionId: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select an institution</option>
                      {institutions.map(institution => (
                        <option key={institution.id} value={institution.id}>
                          {institution.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={handleAddUser}
                  leftIcon={<Plus size={16} />}
                >
                  Add User
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Search and User List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Institution
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUserId === user.id ? (
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="student">Student</option>
                            <option value="institution_admin">Institution Admin</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'super_admin' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
                              : user.role === 'admin'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                : user.role === 'institution_admin'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {user.role.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {user.institutionName || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingUserId === user.id ? (
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateRole(user.id)}
                              leftIcon={<Save size={14} />}
                            >
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingUserId(null);
                                setSelectedRole('student');
                              }}
                              leftIcon={<X size={14} />}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingUserId(user.id);
                                setSelectedRole(user.role);
                              }}
                              leftIcon={<Edit size={14} />}
                            >
                              Edit Role
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              leftIcon={<Trash2 size={14} />}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No users found</p>
                      <p className="text-gray-500 dark:text-gray-500 max-w-md mx-auto mt-1">
                        {searchQuery
                          ? "Try adjusting your search to find what you're looking for."
                          : "There are no users in the system yet."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default RoleManagementPanel;