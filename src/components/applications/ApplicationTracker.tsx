import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Plus,
  Filter,
  Search,
  TrendingUp,
  Target,
  Award,
  Users
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { applicationService, Application } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';

const ApplicationTracker: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Application['status'] | ''>('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadApplications();
      loadStats();
    }
  }, [user]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const apps = await applicationService.getApplications(user!.id);
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statistics = await applicationService.getApplicationStats(user!.id);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await applicationService.deleteApplication(applicationId);
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        loadStats(); // Refresh stats
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'draft':
        return <Edit className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'submitted':
        return <CheckCircle className="w-4 h-4" />;
      case 'under-review':
        return <Eye className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4" />;
      case 'waitlisted':
        return <Clock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchQuery || 
      app.university_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.program_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions: { value: Application['status'] | ''; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'waitlisted', label: 'Waitlisted' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Applications</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your university applications and their progress
          </p>
        </div>
        <Button
          onClick={() => window.location.href = '/universities'}
          leftIcon={<Plus size={16} />}
        >
          New Application
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Applications</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Submitted</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {(stats.byStatus.submitted || 0) + (stats.byStatus['under-review'] || 0)}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">In Progress</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {(stats.byStatus.draft || 0) + (stats.byStatus['in-progress'] || 0)}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Accepted</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.byStatus.accepted || 0}
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Filters */}
      {applications.length > 0 && (
        <Card>
          <CardBody className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Application['status'] | '')}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <Filter size={16} className="mr-2" />
                {filteredApplications.length} of {applications.length} shown
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const deadlineStatus = applicationService.getDeadlineStatus(application.deadline);
            
            return (
              <Card key={application.id} hoverable={true}>
                <CardBody className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {application.university_name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {application.program_name}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            {/* Status */}
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${applicationService.getStatusColor(application.status)}`}>
                                {getStatusIcon(application.status)}
                                <span className="ml-1">{applicationService.getStatusText(application.status)}</span>
                              </span>
                            </div>
                            
                            {/* Progress */}
                            <div className="flex items-center">
                              <TrendingUp size={14} className="mr-1 text-gray-500" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {application.progress_percentage}% complete
                              </span>
                            </div>
                            
                            {/* Deadline */}
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1 text-gray-500" />
                              <span className={deadlineStatus.color}>
                                {deadlineStatus.text}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Application Progress</span>
                          <span>{application.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${application.progress_percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Started</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Deadline</p>
                          <p className={`font-medium ${deadlineStatus.color}`}>
                            {new Date(application.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        {application.submitted_at && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Submitted</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(application.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {application.notes && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Notes:</strong> {application.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row lg:flex-col gap-2">
                      {application.status === 'draft' || application.status === 'in-progress' ? (
                        <Button size="sm" className="w-full sm:w-auto lg:w-full">
                          Continue Application
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full sm:w-auto lg:w-full">
                          View Application
                        </Button>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Edit size={14} />}
                          className="flex-1 sm:flex-none"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteApplication(application.id)}
                          leftIcon={<Trash2 size={14} />}
                          className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardBody className="p-12 text-center">
            {applications.length === 0 ? (
              <>
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Applications Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start your university application journey by exploring programs and submitting your first application.
                </p>
                <Button
                  onClick={() => window.location.href = '/universities'}
                  leftIcon={<Plus size={16} />}
                >
                  Start First Application
                </Button>
              </>
            ) : (
              <>
                <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  No applications match your current filters. Try adjusting your search criteria.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {/* Upcoming Deadlines */}
      {stats && stats.upcomingDeadlines.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.upcomingDeadlines.map((app: Application) => {
                const deadlineStatus = applicationService.getDeadlineStatus(app.deadline);
                return (
                  <div key={app.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{app.university_name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{app.program_name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${deadlineStatus.color}`}>
                        {new Date(app.deadline).toLocaleDateString()}
                      </p>
                      <p className={`text-sm ${deadlineStatus.color}`}>
                        {deadlineStatus.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default ApplicationTracker;