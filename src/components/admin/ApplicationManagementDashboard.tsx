import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  MessageSquare,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  Bell,
  Mail,
  ExternalLink,
  User,
  MapPin,
  GraduationCap,
  Flag,
  Info,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { adminService } from '../../services/adminService';
import CommunicationModal from './CommunicationModal';
import ApplicationDetailModal from './ApplicationDetailModal';
import NotesModal from './NotesModal';
import { useAuth } from '../../context/AuthContext';

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  universityId: string;
  universityName: string;
  programName: string;
  country: string;
  status: 'pending' | 'under-review' | 'additional-docs' | 'interview' | 'accepted' | 'rejected' | 'deferred' | 'waitlisted';
  submittedAt: string;
  updatedAt: string;
  deadline: string;
  completionPercentage: number;
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
  lastCommunication?: string;
  tags?: string[];
}

const ApplicationManagementDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [programFilter, setProgramFilter] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<{start?: string; end?: string}>({});
  const [sortField, setSortField] = useState<string>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    applications, 
    searchQuery, 
    statusFilter, 
    countryFilter, 
    programFilter, 
    dateRangeFilter,
    sortField,
    sortDirection
  ]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await adminService.getApplications();
      setApplications(data);
      
      // Extract unique countries and programs for filters
      const uniqueCountries = [...new Set(data.map(app => app.country))].sort();
      const uniquePrograms = [...new Set(data.map(app => app.programName))].sort();
      
      setCountries(uniqueCountries);
      setPrograms(uniquePrograms);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.studentName.toLowerCase().includes(query) ||
        app.studentEmail.toLowerCase().includes(query) ||
        app.universityName.toLowerCase().includes(query) ||
        app.programName.toLowerCase().includes(query) ||
        app.id.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Apply country filter
    if (countryFilter) {
      filtered = filtered.filter(app => app.country === countryFilter);
    }

    // Apply program filter
    if (programFilter) {
      filtered = filtered.filter(app => app.programName === programFilter);
    }

    // Apply date range filter
    if (dateRangeFilter.start) {
      const startDate = new Date(dateRangeFilter.start);
      filtered = filtered.filter(app => new Date(app.submittedAt) >= startDate);
    }
    if (dateRangeFilter.end) {
      const endDate = new Date(dateRangeFilter.end);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(app => new Date(app.submittedAt) <= endDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'studentName':
          comparison = a.studentName.localeCompare(b.studentName);
          break;
        case 'universityName':
          comparison = a.universityName.localeCompare(b.universityName);
          break;
        case 'programName':
          comparison = a.programName.localeCompare(b.programName);
          break;
        case 'country':
          comparison = a.country.localeCompare(b.country);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'submittedAt':
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          break;
        case 'deadline':
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case 'updatedAt':
        default:
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredApplications(filtered);
  };

  const handleToggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: Application['status']) => {
    try {
      await adminService.updateApplicationStatus(applicationId, newStatus);
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus, updatedAt: new Date().toISOString() } 
            : app
        )
      );
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleBulkUpdateStatus = async (newStatus: Application['status']) => {
    if (bulkSelected.size === 0) return;
    
    try {
      const updatePromises = Array.from(bulkSelected).map(id => 
        adminService.updateApplicationStatus(id, newStatus)
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          bulkSelected.has(app.id)
            ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
            : app
        )
      );
      
      // Clear selection
      setBulkSelected(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error('Error performing bulk status update:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (bulkSelected.size === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${bulkSelected.size} applications? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const deletePromises = Array.from(bulkSelected).map(id => 
        adminService.deleteApplication(id)
      );
      
      await Promise.all(deletePromises);
      
      // Update local state
      setApplications(prev => prev.filter(app => !bulkSelected.has(app.id)));
      
      // Clear selection
      setBulkSelected(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error('Error performing bulk delete:', error);
    }
  };

  const handleBulkExport = () => {
    if (bulkSelected.size === 0) return;
    
    // In a real app, this would generate and download a CSV/Excel file
    alert(`Exporting ${bulkSelected.size} applications`);
  };

  const handleSendCommunication = async (applicationId: string, message: string, subject: string, template: string) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;
      
      await adminService.sendMessage(application.studentId, message, subject);
      
      // Update local state to reflect communication was sent
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, lastCommunication: new Date().toISOString() } 
            : app
        )
      );
      
      setShowCommunicationModal(false);
    } catch (error) {
      console.error('Error sending communication:', error);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectAll) {
      setBulkSelected(new Set());
    } else {
      setBulkSelected(new Set(filteredApplications.map(app => app.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleToggleSelect = (applicationId: string) => {
    const newSelected = new Set(bulkSelected);
    
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId);
    } else {
      newSelected.add(applicationId);
    }
    
    setBulkSelected(newSelected);
    
    // Update selectAll state based on whether all filtered applications are selected
    setSelectAll(newSelected.size === filteredApplications.length);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setCountryFilter('');
    setProgramFilter('');
    setDateRangeFilter({});
  };

  const getStatusBadge = (status: Application['status']) => {
    const statusConfig: Record<string, { color: string, icon: React.ReactNode }> = {
      'pending': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: <Clock size={14} className="mr-1" /> },
      'under-review': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <Eye size={14} className="mr-1" /> },
      'additional-docs': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: <FileText size={14} className="mr-1" /> },
      'interview': { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300', icon: <User size={14} className="mr-1" /> },
      'accepted': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle size={14} className="mr-1" /> },
      'rejected': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <X size={14} className="mr-1" /> },
      'deferred': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', icon: <Clock size={14} className="mr-1" /> },
      'waitlisted': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: <Clock size={14} className="mr-1" /> }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: Application['priority']) => {
    const priorityConfig: Record<string, { color: string }> = {
      'high': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      'medium': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      'low': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
    };
    
    const config = priorityConfig[priority] || priorityConfig['medium'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getDeadlineStatus = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Passed', color: 'text-red-600 dark:text-red-400' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, color: 'text-red-600 dark:text-red-400' };
    } else if (diffDays <= 30) {
      return { text: `${diffDays} days left`, color: 'text-yellow-600 dark:text-yellow-400' };
    } else {
      return { text: `${diffDays} days left`, color: 'text-green-600 dark:text-green-400' };
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Application Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track student applications
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => handleBulkExport()}
            disabled={bulkSelected.size === 0}
            leftIcon={<Download size={16} />}
          >
            Export {bulkSelected.size > 0 ? `(${bulkSelected.size})` : ''}
          </Button>
          <Button
            onClick={() => {/* Add new application logic */}}
            leftIcon={<Plus size={16} />}
          >
            Add Application
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
                  placeholder="Search by student name, email, university, or program..."
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
              {(searchQuery || statusFilter || countryFilter || programFilter || dateRangeFilter.start || dateRangeFilter.end) && (
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
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="under-review">Under Review</option>
                      <option value="additional-docs">Additional Docs</option>
                      <option value="interview">Interview</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="deferred">Deferred</option>
                      <option value="waitlisted">Waitlisted</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Country
                    </label>
                    <select
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Countries</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Program
                    </label>
                    <select
                      value={programFilter}
                      onChange={(e) => setProgramFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Programs</option>
                      {programs.map(program => (
                        <option key={program} value={program}>{program}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Application Date Range
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

      {/* Bulk Actions */}
      {bulkSelected.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              {bulkSelected.size} {bulkSelected.size === 1 ? 'application' : 'applications'} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Bulk Update:</span>
              <select
                onChange={(e) => e.target.value && handleBulkUpdateStatus(e.target.value as Application['status'])}
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                defaultValue=""
              >
                <option value="" disabled>Change Status</option>
                <option value="pending">Pending</option>
                <option value="under-review">Under Review</option>
                <option value="additional-docs">Additional Docs</option>
                <option value="interview">Interview</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="deferred">Deferred</option>
                <option value="waitlisted">Waitlisted</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkExport}
              leftIcon={<Download size={14} />}
            >
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              leftIcon={<Trash2 size={14} />}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkSelected(new Set())}
              leftIcon={<X size={14} />}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Applications ({filteredApplications.length})
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredApplications.length} of {applications.length} applications
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleToggleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    <button 
                      className="group inline-flex items-center"
                      onClick={() => handleToggleSort('studentName')}
                    >
                      Student
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    <button 
                      className="group inline-flex items-center"
                      onClick={() => handleToggleSort('universityName')}
                    >
                      University
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    <button 
                      className="group inline-flex items-center"
                      onClick={() => handleToggleSort('programName')}
                    >
                      Program
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    <button 
                      className="group inline-flex items-center"
                      onClick={() => handleToggleSort('country')}
                    >
                      Country
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    <button 
                      className="group inline-flex items-center"
                      onClick={() => handleToggleSort('status')}
                    >
                      Status
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    <button 
                      className="group inline-flex items-center"
                      onClick={() => handleToggleSort('submittedAt')}
                    >
                      Submitted
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    <button 
                      className="group inline-flex items-center"
                      onClick={() => handleToggleSort('deadline')}
                    >
                      Deadline
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Priority
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    <button 
                      className="group inline-flex items-center"
                      onClick={() => handleToggleSort('updatedAt')}
                    >
                      Last Updated
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((application) => {
                    const deadlineStatus = getDeadlineStatus(application.deadline);
                    
                    return (
                      <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-3 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={bulkSelected.has(application.id)}
                            onChange={() => handleToggleSelect(application.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                                {application.studentName.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {application.studentName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {application.studentEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {application.universityName}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {application.programName}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Flag className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {application.country}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <select
                            value={application.status}
                            onChange={(e) => handleUpdateStatus(application.id, e.target.value as Application['status'])}
                            className="text-xs rounded-full py-1 pl-2 pr-7 font-medium border-0 focus:ring-2 focus:ring-blue-500"
                            style={{
                              backgroundColor: getStatusBadge(application.status).props.className.split(' ').find(c => c.startsWith('bg-')),
                              color: getStatusBadge(application.status).props.className.split(' ').find(c => c.startsWith('text-'))
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="under-review">Under Review</option>
                            <option value="additional-docs">Additional Docs</option>
                            <option value="interview">Interview</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="deferred">Deferred</option>
                            <option value="waitlisted">Waitlisted</option>
                          </select>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(application.submittedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className={`text-sm ${deadlineStatus.color}`}>
                            {new Date(application.deadline).toLocaleDateString()} 
                            <span className="block text-xs">
                              {deadlineStatus.text}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          {getPriorityBadge(application.priority)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(application.updatedAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(application.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowDetailModal(true);
                              }}
                              leftIcon={<Eye size={14} />}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowCommunicationModal(true);
                              }}
                              leftIcon={<MessageSquare size={14} />}
                            >
                              Message
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowNotesModal(true);
                              }}
                              leftIcon={<FileText size={14} />}
                            >
                              Notes
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="px-6 py-10 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No applications found</p>
                      <p className="text-gray-500 dark:text-gray-500 max-w-md mx-auto mt-1">
                        {searchQuery || statusFilter || countryFilter || programFilter || dateRangeFilter.start || dateRangeFilter.end
                          ? "Try adjusting your filters to find what you're looking for."
                          : "There are no applications in the system yet."}
                      </p>
                      {(searchQuery || statusFilter || countryFilter || programFilter || dateRangeFilter.start || dateRangeFilter.end) && (
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

      {/* Modals */}
      <CommunicationModal
        isOpen={showCommunicationModal}
        onClose={() => setShowCommunicationModal(false)}
        onSend={handleSendCommunication}
        application={selectedApplication}
      />

      <ApplicationDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        application={selectedApplication}
        onStatusChange={handleUpdateStatus}
      />

      <NotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        application={selectedApplication}
      />
    </div>
  );
};

export default ApplicationManagementDashboard;