import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  ArrowUpDown,
  Shield,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { adminService } from '../../services/adminService';
import { AuditLog } from '../../types/user';

const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState<{start?: string; end?: string}>({});
  const [userFilter, setUserFilter] = useState('');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [actions, setActions] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  const [users, setUsers] = useState<{id: string; name: string}[]>([]);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    logs, 
    searchQuery, 
    actionFilter, 
    resourceFilter, 
    dateRangeFilter,
    userFilter,
    sortField,
    sortDirection
  ]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAuditLogs();
      setLogs(data);
      
      // Extract unique values for filters
      const uniqueActions = [...new Set(data.map(log => log.action))].sort();
      const uniqueResources = [...new Set(data.map(log => log.resource))].sort();
      const uniqueUsers = [...new Set(data.map(log => ({ id: log.userId, name: log.userName })))];
      
      setActions(uniqueActions);
      setResources(uniqueResources);
      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(query) ||
        log.resource.toLowerCase().includes(query) ||
        log.userName?.toLowerCase().includes(query) ||
        JSON.stringify(log.details).toLowerCase().includes(query)
      );
    }

    // Apply action filter
    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Apply resource filter
    if (resourceFilter) {
      filtered = filtered.filter(log => log.resource === resourceFilter);
    }

    // Apply user filter
    if (userFilter) {
      filtered = filtered.filter(log => log.userId === userFilter);
    }

    // Apply date range filter
    if (dateRangeFilter.start) {
      const startDate = new Date(dateRangeFilter.start);
      filtered = filtered.filter(log => new Date(log.createdAt) >= startDate);
    }
    if (dateRangeFilter.end) {
      const endDate = new Date(dateRangeFilter.end);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(log => new Date(log.createdAt) <= endDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'action':
          comparison = a.action.localeCompare(b.action);
          break;
        case 'resource':
          comparison = a.resource.localeCompare(b.resource);
          break;
        case 'userName':
          comparison = (a.userName || '').localeCompare(b.userName || '');
          break;
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredLogs(filtered);
  };

  const handleToggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportLogs = () => {
    // In a real app, this would generate and download a CSV/Excel file
    alert('Exporting audit logs');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setActionFilter('');
    setResourceFilter('');
    setUserFilter('');
    setDateRangeFilter({});
  };

  const getActionBadge = (action: string) => {
    const actionConfig: Record<string, { color: string, icon: React.ReactNode }> = {
      'create': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle size={14} className="mr-1" /> },
      'update': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: <FileText size={14} className="mr-1" /> },
      'delete': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <X size={14} className="mr-1" /> },
      'login': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: <User size={14} className="mr-1" /> },
      'logout': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: <User size={14} className="mr-1" /> },
      'view': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <FileText size={14} className="mr-1" /> },
      'export': { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300', icon: <Download size={14} className="mr-1" /> },
      'permission_change': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', icon: <Shield size={14} className="mr-1" /> },
      'error': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <AlertCircle size={14} className="mr-1" /> }
    };
    
    // Default for any action not specifically defined
    const defaultConfig = { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: <FileText size={14} className="mr-1" /> };
    
    const config = actionConfig[action.toLowerCase()] || defaultConfig;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h2>
          <p className="text-gray-600 dark:text-gray-400">
            View and search system activity logs
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleExportLogs}
            leftIcon={<Download size={16} />}
          >
            Export Logs
          </Button>
          <Button
            onClick={loadAuditLogs}
            leftIcon={<Shield size={16} />}
          >
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search audit logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<Filter size={16} />}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              {(searchQuery || actionFilter || resourceFilter || userFilter || dateRangeFilter.start || dateRangeFilter.end) && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  leftIcon={<X size={16} />}
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Action
                    </label>
                    <select
                      value={actionFilter}
                      onChange={(e) => setActionFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Actions</option>
                      {actions.map(action => (
                        <option key={action} value={action}>{action}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Resource
                    </label>
                    <select
                      value={resourceFilter}
                      onChange={(e) => setResourceFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Resources</option>
                      {resources.map(resource => (
                        <option key={resource} value={resource}>{resource}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      User
                    </label>
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Users</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date Range
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        type="date"
                        value={dateRangeFilter.start || ''}
                        onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
                        placeholder="Start Date"
                      />
                      <Input
                        type="date"
                        value={dateRangeFilter.end || ''}
                        onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
                        placeholder="End Date"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              System Activity Logs ({filteredLogs.length})
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredLogs.length} of {logs.length} logs
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    <button 
                      className="group inline-flex items-center"
                      onClick={() => handleToggleSort('createdAt')}
                    >
                      Timestamp
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    <button 
                      className="group inline-flex items-center"
                      onClick={() => handleToggleSort('userName')}
                    >
                      User
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    <button 
                      className="group inline-flex items-center"
                      onClick={() => handleToggleSort('action')}
                    >
                      Action
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    <button 
                      className="group inline-flex items-center"
                      onClick={() => handleToggleSort('resource')}
                    >
                      Resource
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Details
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                              {log.userName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {log.userName || 'Unknown User'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {log.userRole || 'Unknown Role'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {log.resource}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {JSON.stringify(log.details)}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {log.ipAddress}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No audit logs found</p>
                      <p className="text-gray-500 dark:text-gray-500 max-w-md mx-auto mt-1">
                        {searchQuery || actionFilter || resourceFilter || userFilter || dateRangeFilter.start || dateRangeFilter.end
                          ? "Try adjusting your filters to find what you're looking for."
                          : "There are no audit logs in the system yet."}
                      </p>
                      {(searchQuery || actionFilter || resourceFilter || userFilter || dateRangeFilter.start || dateRangeFilter.end) && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={clearAllFilters}
                        >
                          Clear All Filters
                        </Button>
                      )}
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

export default AuditLogViewer;