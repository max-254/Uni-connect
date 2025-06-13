import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Calendar, 
  Mail, 
  Download, 
  Eye, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';

interface ApplicationStatus {
  id: string;
  courseId: string;
  courseName: string;
  university: string;
  submissionDate: string;
  status: 'submitted' | 'document_verification' | 'under_review' | 'interview_scheduled' | 'accepted' | 'rejected' | 'waitlisted';
  lastUpdated: string;
  documents: {
    name: string;
    status: 'pending' | 'verified' | 'rejected';
    message?: string;
  }[];
  timeline: {
    date: string;
    status: string;
    message: string;
  }[];
  nextSteps?: string[];
  interviewDetails?: {
    date: string;
    time: string;
    location: string;
    interviewers: string[];
    format: string;
  };
  decisionDetails?: {
    date: string;
    message: string;
    nextSteps?: string[];
  };
}

const ApplicationStatusTracker: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationStatus[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'university'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        if (user) {
          const data = await courseService.getUserApplications(user.id);
          setApplications(data);
          setFilteredApplications(data);
        }
      } catch (error) {
        console.error('Error loading applications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, sortBy, sortOrder, applications]);

  const applyFilters = () => {
    let filtered = [...applications];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.courseName.toLowerCase().includes(query) || 
        app.university.toLowerCase().includes(query) ||
        app.id.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
      } else if (sortBy === 'status') {
        comparison = getStatusWeight(b.status) - getStatusWeight(a.status);
      } else if (sortBy === 'university') {
        comparison = a.university.localeCompare(b.university);
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    setFilteredApplications(filtered);
  };

  const getStatusWeight = (status: ApplicationStatus['status']): number => {
    const weights: Record<ApplicationStatus['status'], number> = {
      accepted: 6,
      rejected: 5,
      waitlisted: 4,
      interview_scheduled: 3,
      under_review: 2,
      document_verification: 1,
      submitted: 0
    };
    
    return weights[status] || 0;
  };

  const toggleSort = (field: 'date' | 'status' | 'university') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleExpand = (applicationId: string) => {
    setExpandedApplication(expandedApplication === applicationId ? null : applicationId);
  };

  const getStatusBadge = (status: ApplicationStatus['status']) => {
    const statusConfig = {
      submitted: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: <Clock size={14} className="mr-1" /> },
      document_verification: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <FileText size={14} className="mr-1" /> },
      under_review: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: <Eye size={14} className="mr-1" /> },
      interview_scheduled: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300', icon: <Calendar size={14} className="mr-1" /> },
      accepted: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle size={14} className="mr-1" /> },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <AlertCircle size={14} className="mr-1" /> },
      waitlisted: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', icon: <Clock size={14} className="mr-1" /> }
    };
    
    const config = statusConfig[status];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {getStatusText(status)}
      </span>
    );
  };

  const getStatusText = (status: ApplicationStatus['status']): string => {
    const statusTexts: Record<ApplicationStatus['status'], string> = {
      submitted: 'Submitted',
      document_verification: 'Document Verification',
      under_review: 'Under Review',
      interview_scheduled: 'Interview Scheduled',
      accepted: 'Accepted',
      rejected: 'Rejected',
      waitlisted: 'Waitlisted'
    };
    
    return statusTexts[status] || 'Unknown';
  };

  const getDocumentStatusBadge = (status: 'pending' | 'verified' | 'rejected') => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <Clock size={14} className="mr-1" /> },
      verified: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle size={14} className="mr-1" /> },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <AlertCircle size={14} className="mr-1" /> }
    };
    
    const config = statusConfig[status];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status === 'pending' ? 'Pending' : status === 'verified' ? 'Verified' : 'Rejected'}
      </span>
    );
  };

  const getProgressPercentage = (status: ApplicationStatus['status']): number => {
    const percentages: Record<ApplicationStatus['status'], number> = {
      submitted: 20,
      document_verification: 40,
      under_review: 60,
      interview_scheduled: 80,
      accepted: 100,
      rejected: 100,
      waitlisted: 90
    };
    
    return percentages[status] || 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
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
            Track the status of your course applications
          </p>
        </div>
        <Button
          onClick={() => navigate('/courses')}
          leftIcon={<ExternalLink size={16} />}
        >
          Browse Courses
        </Button>
      </div>

      {/* Filters */}
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="document_verification">Document Verification</option>
              <option value="under_review">Under Review</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
            </select>

            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Filter size={16} className="mr-2" />
              {filteredApplications.length} of {applications.length} shown
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <div className="space-y-6">
          {filteredApplications.map((application) => (
            <Card key={application.id}>
              <CardBody className="p-6">
                <div className="flex flex-col space-y-4">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {application.courseName}
                        </h3>
                        {getStatusBadge(application.status)}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {application.university}
                      </p>
                      <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-2">
                        <div className="flex items-center">
                          <FileText size={14} className="mr-1" />
                          <span>Application ID: {application.id}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          <span>Submitted: {new Date(application.submissionDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          <span>Last Updated: {new Date(application.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye size={14} />}
                        onClick={() => toggleExpand(application.id)}
                      >
                        {expandedApplication === application.id ? 'Hide Details' : 'View Details'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Download size={14} />}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Application Progress</span>
                      <span>{getProgressPercentage(application.status)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          application.status === 'rejected' 
                            ? 'bg-red-600' 
                            : application.status === 'accepted'
                              ? 'bg-green-600'
                              : 'bg-blue-600'
                        }`}
                        style={{ width: `${getProgressPercentage(application.status)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {expandedApplication === application.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {/* Document Status */}
                      <div className="mb-6">
                        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                          Document Status
                        </h4>
                        <div className="space-y-3">
                          {application.documents.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                                <span className="text-gray-900 dark:text-white">{doc.name}</span>
                              </div>
                              <div className="flex items-center">
                                {getDocumentStatusBadge(doc.status)}
                                {doc.message && (
                                  <button className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                                    <Info size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Application Timeline */}
                      <div className="mb-6">
                        <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                          Application Timeline
                        </h4>
                        <div className="relative">
                          {/* Timeline Line */}
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                          
                          {/* Timeline Events */}
                          <div className="space-y-6 relative">
                            {application.timeline.map((event, index) => (
                              <div key={index} className="flex items-start">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                                  index === 0 
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                }`}>
                                  {index === 0 ? (
                                    <CheckCircle size={16} />
                                  ) : (
                                    <Clock size={16} />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="flex items-center">
                                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                      {event.status}
                                    </h5>
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(event.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {event.message}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Interview Details (if applicable) */}
                      {application.status === 'interview_scheduled' && application.interviewDetails && (
                        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                          <h4 className="text-base font-medium text-indigo-900 dark:text-indigo-300 mb-3">
                            Interview Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-indigo-700 dark:text-indigo-400">Date & Time</p>
                              <p className="font-medium text-indigo-900 dark:text-indigo-300">
                                {new Date(application.interviewDetails.date).toLocaleDateString()} at {application.interviewDetails.time}
                              </p>
                            </div>
                            <div>
                              <p className="text-indigo-700 dark:text-indigo-400">Location/Format</p>
                              <p className="font-medium text-indigo-900 dark:text-indigo-300">
                                {application.interviewDetails.location} ({application.interviewDetails.format})
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-indigo-700 dark:text-indigo-400">Interviewers</p>
                              <p className="font-medium text-indigo-900 dark:text-indigo-300">
                                {application.interviewDetails.interviewers.join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button
                              size="sm"
                              leftIcon={<Calendar size={14} />}
                            >
                              Add to Calendar
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Decision Details (if applicable) */}
                      {(application.status === 'accepted' || application.status === 'rejected' || application.status === 'waitlisted') && application.decisionDetails && (
                        <div className={`mb-6 p-4 rounded-lg ${
                          application.status === 'accepted' 
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                            : application.status === 'rejected'
                              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                              : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                        }`}>
                          <h4 className={`text-base font-medium mb-3 ${
                            application.status === 'accepted' 
                              ? 'text-green-900 dark:text-green-300' 
                              : application.status === 'rejected'
                                ? 'text-red-900 dark:text-red-300'
                                : 'text-orange-900 dark:text-orange-300'
                          }`}>
                            Decision Details
                          </h4>
                          <p className={`text-sm mb-4 ${
                            application.status === 'accepted' 
                              ? 'text-green-700 dark:text-green-400' 
                              : application.status === 'rejected'
                                ? 'text-red-700 dark:text-red-400'
                                : 'text-orange-700 dark:text-orange-400'
                          }`}>
                            {application.decisionDetails.message}
                          </p>
                          
                          {application.decisionDetails.nextSteps && (
                            <div>
                              <h5 className={`text-sm font-medium mb-2 ${
                                application.status === 'accepted' 
                                  ? 'text-green-900 dark:text-green-300' 
                                  : application.status === 'rejected'
                                    ? 'text-red-900 dark:text-red-300'
                                    : 'text-orange-900 dark:text-orange-300'
                              }`}>
                                Next Steps:
                              </h5>
                              <ul className="list-disc list-inside space-y-1">
                                {application.decisionDetails.nextSteps.map((step, index) => (
                                  <li key={index} className={`text-sm ${
                                    application.status === 'accepted' 
                                      ? 'text-green-700 dark:text-green-400' 
                                      : application.status === 'rejected'
                                        ? 'text-red-700 dark:text-red-400'
                                        : 'text-orange-700 dark:text-orange-400'
                                  }`}>
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Mail size={14} />}
                        >
                          Contact Admissions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<MessageSquare size={14} />}
                        >
                          Send Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Download size={14} />}
                        >
                          Download Application
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Applications Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || statusFilter 
                ? "No applications match your current filters. Try adjusting your search criteria."
                : "You haven't submitted any course applications yet."}
            </p>
            {searchQuery || statusFilter ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/courses')}
                leftIcon={<ExternalLink size={16} />}
              >
                Browse Courses
              </Button>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default ApplicationStatusTracker;