import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Globe, 
  Briefcase,
  Plane,
  DollarSign,
  Camera,
  MapPin,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Eye,
  Plus,
  ExternalLink,
  Shield
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { visaService } from '../../services/visaService';
import { useAuth } from '../../context/AuthContext';
import VisaDocumentUploadModal from './VisaDocumentUploadModal';
import VisaRequirementsModal from './VisaRequirementsModal';
import VisaAppointmentModal from './VisaAppointmentModal';
import VisaNotificationSettingsModal from './VisaNotificationSettingsModal';

const VisaApplicationTracker: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  
  // Modals
  const [showDocumentUploadModal, setShowDocumentUploadModal] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showNotificationSettingsModal, setShowNotificationSettingsModal] = useState(false);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        if (user) {
          const data = await visaService.getUserVisaApplications(user.id);
          setApplications(data);
          setFilteredApplications(data);
        }
      } catch (error) {
        console.error('Error loading visa applications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, countryFilter, applications]);

  const applyFilters = () => {
    let filtered = [...applications];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.visaType.toLowerCase().includes(query) || 
        app.country.toLowerCase().includes(query) ||
        app.applicationId.toLowerCase().includes(query)
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

    setFilteredApplications(filtered);
  };

  const handleToggleExpand = (applicationId: string) => {
    setExpandedApplication(expandedApplication === applicationId ? null : applicationId);
  };

  const handleUploadDocument = (application: any) => {
    setSelectedApplication(application);
    setShowDocumentUploadModal(true);
  };

  const handleViewRequirements = (application: any) => {
    setSelectedApplication(application);
    setShowRequirementsModal(true);
  };

  const handleManageAppointment = (application: any) => {
    setSelectedApplication(application);
    setShowAppointmentModal(true);
  };

  const handleDocumentUploaded = async (documentData: any, file: File) => {
    try {
      if (!selectedApplication) return;
      
      const newDocument = await visaService.uploadVisaDocument(
        user!.id, 
        selectedApplication.id, 
        documentData, 
        file
      );
      
      // Update application with new document
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { 
                ...app, 
                documents: [...app.documents, newDocument],
                completedRequirements: app.completedRequirements + 1
              } 
            : app
        )
      );
      
      setShowDocumentUploadModal(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    }
  };

  const handleCreateApplication = async () => {
    try {
      const newApplication = await visaService.createVisaApplication(user!.id);
      setApplications(prev => [newApplication, ...prev]);
      setExpandedApplication(newApplication.id);
    } catch (error) {
      console.error('Error creating visa application:', error);
      alert('Failed to create visa application. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: React.ReactNode }> = {
      'not_started': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: <Clock size={14} className="mr-1" /> },
      'documents_collection': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: <FileText size={14} className="mr-1" /> },
      'forms_completion': { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300', icon: <FileText size={14} className="mr-1" /> },
      'payment_pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <DollarSign size={14} className="mr-1" /> },
      'appointment_scheduled': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: <Calendar size={14} className="mr-1" /> },
      'biometrics_completed': { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300', icon: <Camera size={14} className="mr-1" /> },
      'interview_completed': { color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300', icon: <Briefcase size={14} className="mr-1" /> },
      'under_review': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', icon: <Clock size={14} className="mr-1" /> },
      'approved': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle size={14} className="mr-1" /> },
      'rejected': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <AlertTriangle size={14} className="mr-1" /> }
    };
    
    const config = statusConfig[status] || statusConfig['not_started'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  const getDocumentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: React.ReactNode }> = {
      'pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <Clock size={14} className="mr-1" /> },
      'approved': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle size={14} className="mr-1" /> },
      'rejected': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <AlertTriangle size={14} className="mr-1" /> }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getProgressPercentage = (application: any): number => {
    if (!application) return 0;
    
    const totalRequirements = application.totalRequirements || 1;
    const completedRequirements = application.completedRequirements || 0;
    
    return Math.round((completedRequirements / totalRequirements) * 100);
  };

  const getCountryFlag = (countryCode: string): string => {
    return `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;
  };

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return { text: 'Passed', color: 'text-red-600 dark:text-red-400' };
    } else if (daysLeft <= 7) {
      return { text: `${daysLeft} days left`, color: 'text-red-600 dark:text-red-400' };
    } else if (daysLeft <= 30) {
      return { text: `${daysLeft} days left`, color: 'text-yellow-600 dark:text-yellow-400' };
    } else {
      return { text: `${daysLeft} days left`, color: 'text-green-600 dark:text-green-400' };
    }
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visa Applications</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your visa applications from start to finish
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleCreateApplication}
            leftIcon={<Plus size={16} />}
          >
            New Visa Application
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowNotificationSettingsModal(true)}
            leftIcon={<Bell size={16} />}
          >
            Notification Settings
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <option value="not_started">Not Started</option>
              <option value="documents_collection">Documents Collection</option>
              <option value="forms_completion">Forms Completion</option>
              <option value="payment_pending">Payment Pending</option>
              <option value="appointment_scheduled">Appointment Scheduled</option>
              <option value="biometrics_completed">Biometrics Completed</option>
              <option value="interview_completed">Interview Completed</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Countries</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Netherlands">Netherlands</option>
              <option value="Ireland">Ireland</option>
              <option value="China">China</option>
              <option value="Japan">Japan</option>
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
          {filteredApplications.map((application) => {
            const progressPercentage = getProgressPercentage(application);
            
            return (
              <Card key={application.id}>
                <CardBody className="p-6">
                  <div className="flex flex-col space-y-4">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center">
                            <img 
                              src={getCountryFlag(application.countryCode)} 
                              alt={application.country} 
                              className="w-5 h-5 rounded-sm mr-2"
                            />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {application.visaType} - {application.country}
                            </h3>
                          </div>
                          {getStatusBadge(application.status)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          Application ID: {application.applicationId}
                        </p>
                        <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-2">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            <span>Created: {new Date(application.createdAt).toLocaleDateString()}</span>
                          </div>
                          {application.submissionDeadline && (
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              <span className={getDeadlineStatus(application.submissionDeadline).color}>
                                Deadline: {new Date(application.submissionDeadline).toLocaleDateString()} 
                                ({getDeadlineStatus(application.submissionDeadline).text})
                              </span>
                            </div>
                          )}
                          {application.appointmentDate && (
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              <span>Appointment: {new Date(application.appointmentDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRequirements(application)}
                          leftIcon={<FileText size={14} />}
                        >
                          Requirements
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleExpand(application.id)}
                          rightIcon={expandedApplication === application.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        >
                          {expandedApplication === application.id ? 'Hide Details' : 'View Details'}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Application Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            application.status === 'rejected' 
                              ? 'bg-red-600' 
                              : application.status === 'approved'
                                ? 'bg-green-600'
                                : 'bg-blue-600'
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    {expandedApplication === application.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {/* Quick Actions */}
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Button
                            onClick={() => handleUploadDocument(application)}
                            leftIcon={<Upload size={16} />}
                            className="w-full"
                          >
                            Upload Document
                          </Button>
                          <Button
                            onClick={() => handleManageAppointment(application)}
                            leftIcon={<Calendar size={16} />}
                            className="w-full"
                            variant="outline"
                          >
                            Manage Appointment
                          </Button>
                          <Button
                            onClick={() => window.open(application.trackingUrl, '_blank')}
                            leftIcon={<ExternalLink size={16} />}
                            className="w-full"
                            variant="outline"
                          >
                            Official Tracking
                          </Button>
                        </div>
                        
                        {/* Document Status */}
                        <div className="mb-6">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                            Document Status
                          </h4>
                          <div className="space-y-3">
                            {application.documents.map((doc: any) => (
                              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                                  <div>
                                    <span className="text-gray-900 dark:text-white">{doc.name}</span>
                                    {doc.required && (
                                      <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                                        (Required)
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  {getDocumentStatusBadge(doc.status)}
                                  {doc.uploadedAt && (
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </span>
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
                              {/* This would be populated with actual timeline data */}
                              <div className="flex items-start">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 z-10 mr-3">
                                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <div className="flex items-center">
                                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                      Application Created
                                    </h5>
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(application.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Visa application process initiated
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 z-10 mr-3">
                                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <div className="flex items-center">
                                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                      Documents Collection Started
                                    </h5>
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(application.updatedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Started gathering required documents for visa application
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Next Steps */}
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="text-base font-medium text-blue-900 dark:text-blue-300 mb-3">
                            Next Steps
                          </h4>
                          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                            {application.status === 'documents_collection' && (
                              <>
                                <li className="flex items-start">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                  <span>Continue uploading required documents</span>
                                </li>
                                <li className="flex items-start">
                                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                                  <span>Complete the DS-160 form online</span>
                                </li>
                                <li className="flex items-start">
                                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                                  <span>Pay the SEVIS fee</span>
                                </li>
                              </>
                            )}
                            
                            {application.status === 'appointment_scheduled' && (
                              <>
                                <li className="flex items-start">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                  <span>Prepare for your visa interview on {new Date(application.appointmentDate).toLocaleDateString()}</span>
                                </li>
                                <li className="flex items-start">
                                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                                  <span>Gather all required documents for your appointment</span>
                                </li>
                                <li className="flex items-start">
                                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                                  <span>Review common interview questions</span>
                                </li>
                              </>
                            )}
                            
                            {application.status === 'approved' && (
                              <>
                                <li className="flex items-start">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                  <span>Your visa has been approved! Check your passport for the visa sticker</span>
                                </li>
                                <li className="flex items-start">
                                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                                  <span>Prepare for travel and arrival in {application.country}</span>
                                </li>
                                <li className="flex items-start">
                                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                                  <span>Review entry requirements and customs regulations</span>
                                </li>
                              </>
                            )}
                          </ul>
                        </div>
                        
                        {/* Visa Fees */}
                        <div className="mb-6">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">
                            Visa Fees
                          </h4>
                          <div className="space-y-3">
                            {application.country === 'United States' && (
                              <>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex items-center">
                                    <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                                    <span className="text-gray-900 dark:text-white">SEVIS I-901 Fee</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-900 dark:text-white mr-3">$350.00</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      leftIcon={<ExternalLink size={14} />}
                                      onClick={() => window.open('https://www.fmjfee.com/', '_blank')}
                                    >
                                      Pay
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex items-center">
                                    <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                                    <span className="text-gray-900 dark:text-white">Visa Application Fee (MRV)</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-900 dark:text-white mr-3">$185.00</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      leftIcon={<ExternalLink size={14} />}
                                      onClick={() => window.open('https://ais.usvisa-info.com/', '_blank')}
                                    >
                                      Pay
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {application.country === 'United Kingdom' && (
                              <>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex items-center">
                                    <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                                    <span className="text-gray-900 dark:text-white">Visa Application Fee</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-900 dark:text-white mr-3">£348.00</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      leftIcon={<ExternalLink size={14} />}
                                      onClick={() => window.open('https://www.gov.uk/apply-uk-visa', '_blank')}
                                    >
                                      Pay
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex items-center">
                                    <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                                    <span className="text-gray-900 dark:text-white">Immigration Health Surcharge</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-900 dark:text-white mr-3">£470.00 per year</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      leftIcon={<ExternalLink size={14} />}
                                      onClick={() => window.open('https://www.gov.uk/healthcare-immigration-application', '_blank')}
                                    >
                                      Pay
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {application.country === 'Canada' && (
                              <>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex items-center">
                                    <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                                    <span className="text-gray-900 dark:text-white">Study Permit Fee</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-900 dark:text-white mr-3">CAD $150.00</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      leftIcon={<ExternalLink size={14} />}
                                      onClick={() => window.open('https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html', '_blank')}
                                    >
                                      Pay
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex items-center">
                                    <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                                    <span className="text-gray-900 dark:text-white">Biometrics Fee</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="font-medium text-gray-900 dark:text-white mr-3">CAD $85.00</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      leftIcon={<ExternalLink size={14} />}
                                      onClick={() => window.open('https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html', '_blank')}
                                    >
                                      Pay
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardBody className="p-12 text-center">
            <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Visa Applications Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || statusFilter || countryFilter 
                ? "No applications match your current filters. Try adjusting your search criteria."
                : "You haven't created any visa applications yet."}
            </p>
            {searchQuery || statusFilter || countryFilter ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setCountryFilter('');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                onClick={handleCreateApplication}
                leftIcon={<Plus size={16} />}
              >
                Create Your First Application
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      {/* Document Upload Modal */}
      <VisaDocumentUploadModal
        isOpen={showDocumentUploadModal}
        onClose={() => setShowDocumentUploadModal(false)}
        onUpload={handleDocumentUploaded}
        application={selectedApplication}
      />

      {/* Requirements Modal */}
      <VisaRequirementsModal
        isOpen={showRequirementsModal}
        onClose={() => setShowRequirementsModal(false)}
        application={selectedApplication}
      />

      {/* Appointment Modal */}
      <VisaAppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        application={selectedApplication}
      />

      {/* Notification Settings Modal */}
      <VisaNotificationSettingsModal
        isOpen={showNotificationSettingsModal}
        onClose={() => setShowNotificationSettingsModal(false)}
      />
    </div>
  );
};

export default VisaApplicationTracker;