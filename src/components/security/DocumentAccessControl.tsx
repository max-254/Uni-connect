import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  Shield, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  X, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { documentService } from '../../services/documentService';

interface DocumentAccessControlProps {
  documentId: string;
  currentAccess?: any[];
}

const DocumentAccessControl: React.FC<DocumentAccessControlProps> = ({
  documentId,
  currentAccess = []
}) => {
  const { user } = useAuth();
  const [accessList, setAccessList] = useState<any[]>(currentAccess);
  const [loading, setLoading] = useState(true);
  const [showAddAccess, setShowAddAccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [accessLevel, setAccessLevel] = useState<'view' | 'edit' | 'admin'>('view');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (documentId) {
      loadDocumentAccess();
    }
  }, [documentId]);

  const loadDocumentAccess = async () => {
    try {
      setLoading(true);
      const access = await documentService.getDocumentAccess(documentId);
      setAccessList(access);
      setIsPublic(access.some(a => a.userId === 'public'));
    } catch (error) {
      console.error('Error loading document access:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await documentService.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleAddAccess = async () => {
    if (!selectedUser) return;

    try {
      await documentService.addDocumentAccess(documentId, selectedUser.id, accessLevel);
      
      // Update local state
      setAccessList(prev => [
        ...prev,
        {
          id: `access-${Date.now()}`,
          userId: selectedUser.id,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          accessLevel,
          addedBy: user?.name || 'Unknown',
          addedAt: new Date().toISOString()
        }
      ]);
      
      // Reset form
      setSelectedUser(null);
      setAccessLevel('view');
      setShowAddAccess(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding document access:', error);
    }
  };

  const handleRemoveAccess = async (accessId: string) => {
    try {
      await documentService.removeDocumentAccess(documentId, accessId);
      
      // Update local state
      setAccessList(prev => prev.filter(a => a.id !== accessId));
    } catch (error) {
      console.error('Error removing document access:', error);
    }
  };

  const handleTogglePublicAccess = async () => {
    try {
      if (isPublic) {
        // Remove public access
        await documentService.removeDocumentAccess(documentId, 'public');
        
        // Update local state
        setAccessList(prev => prev.filter(a => a.userId !== 'public'));
      } else {
        // Add public access
        await documentService.addDocumentAccess(documentId, 'public', 'view');
        
        // Update local state
        setAccessList(prev => [
          ...prev,
          {
            id: `access-public-${Date.now()}`,
            userId: 'public',
            userName: 'Public Access',
            userEmail: '',
            accessLevel: 'view',
            addedBy: user?.name || 'Unknown',
            addedAt: new Date().toISOString()
          }
        ]);
      }
      
      setIsPublic(!isPublic);
    } catch (error) {
      console.error('Error toggling public access:', error);
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'view':
        return <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'edit':
        return <Edit className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Access Control</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePublicAccess}
              leftIcon={isPublic ? <Lock size={14} /> : <Unlock size={14} />}
              className={isPublic ? 'text-red-600 hover:text-red-700' : ''}
            >
              {isPublic ? 'Make Private' : 'Make Public'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddAccess(!showAddAccess)}
              leftIcon={showAddAccess ? <X size={14} /> : <Plus size={14} />}
            >
              {showAddAccess ? 'Cancel' : 'Add Access'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-6">
          {/* Public Access Banner */}
          {isPublic && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start">
              <Unlock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-300">Public Access Enabled</h4>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-200">
                  This document is publicly accessible to anyone with the link. No authentication is required.
                </p>
              </div>
            </div>
          )}

          {/* Add Access Form */}
          {showAddAccess && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Add User Access</h4>
              
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Search users by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim()}
                >
                  Search
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {searchResults.map(result => (
                    <div 
                      key={result.id}
                      className={`p-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                        selectedUser?.id === result.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => setSelectedUser(result)}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                            {result.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {result.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {result.email}
                          </div>
                        </div>
                      </div>
                      {selectedUser?.id === result.id && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {selectedUser && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Access Level
                    </label>
                    <select
                      value={accessLevel}
                      onChange={(e) => setAccessLevel(e.target.value as 'view' | 'edit' | 'admin')}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="view">View Only</option>
                      <option value="edit">Edit</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddAccess}
                      leftIcon={<Plus size={16} />}
                    >
                      Add Access
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Access List */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Who has access</h4>
            
            {accessList.length > 0 ? (
              <div className="space-y-3">
                {/* Owner (current user) */}
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name || 'You'} (Owner)
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email || 'Your email'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <Shield className="w-3 h-3 mr-1" />
                      Owner
                    </span>
                  </div>
                </div>
                
                {/* Other users with access */}
                {accessList
                  .filter(access => access.userId !== user?.id && access.userId !== 'public')
                  .map(access => (
                    <div key={access.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {access.userName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {access.userName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {access.userEmail}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {getAccessLevelIcon(access.accessLevel)}
                          <span className="ml-1 capitalize">{access.accessLevel}</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAccess(access.id)}
                          leftIcon={<Trash2 size={14} />}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                
                {/* Public access (if enabled) */}
                {isPublic && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Public Access
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Anyone with the link
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        <Eye className="w-3 h-3 mr-1" />
                        View Only
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Additional Access
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Only you have access to this document.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowAddAccess(true)}
                  leftIcon={<Plus size={16} />}
                >
                  Add Access
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default DocumentAccessControl;