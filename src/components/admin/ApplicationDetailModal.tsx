import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  GraduationCap, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  ExternalLink, 
  MapPin, 
  Mail, 
  Phone, 
  Flag, 
  Tag, 
  Plus,
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Paperclip
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { adminService } from '../../services/adminService';

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onStatusChange: (applicationId: string, newStatus: string) => void;
}

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  isOpen,
  onClose,
  application,
  onStatusChange
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'timeline' | 'notes'>('overview');
  const [documents, setDocuments] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'personal': true,
    'academic': true,
    'documents': true,
    'timeline': true
  });

  useEffect(() => {
    if (isOpen && application) {
      loadApplicationDetails();
    }
  }, [isOpen, application]);

  const loadApplicationDetails = async () => {
    try {
      setLoading(true);
      
      // Load application details, documents, timeline, and notes
      const [docsData, timelineData, notesData, studentData] = await Promise.all([
        adminService.getApplicationDocuments(application.id),
        adminService.getApplicationTimeline(application.id),
        adminService.getApplicationNotes(application.id),
        adminService.getStudentDetails(application.studentId)
      ]);
      
      setDocuments(docsData);
      setTimeline(timelineData);
      setNotes(notesData);
      setStudentDetails(studentData);
    } catch (error) {
      console.error('Error loading application details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (note: string) => {
    try {
      if (!note.trim() || !application) return;
      
      const newNote = await adminService.addApplicationNote(application.id, note);
      setNotes(prev => [newNote, ...prev]);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleAddTag = async () => {
    try {
      if (!newTag.trim() || !application) return;
      
      await adminService.addApplicationTag(application.id, newTag);
      
      // Update application tags locally
      const updatedTags = [...(application.tags || []), newTag];
      application.tags = updatedTags;
      
      setNewTag('');
      setShowAddTag(false);
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      if (!application) return;
      
      await adminService.removeApplicationTag(application.id, tag);
      
      // Update application tags locally
      const updatedTags = (application.tags || []).filter((t: string) => t !== tag);
      application.tags = updatedTags;
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  const handleDownloadDocument = async (documentId: string) => {
    try {
      // In a real app, this would download the document
      alert(`Downloading document ${documentId}`);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleToggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusBadge = (status: string) => {
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

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Application #{application.id}
                </h2>
                {getStatusBadge(application.status)}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {application.universityName} - {application.programName}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            leftIcon={<X size={16} />}
          >
            Close
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'timeline', label: 'Timeline', icon: Clock },
              { id: 'notes', label: 'Notes', icon: MessageSquare }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Application Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Application Details</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleSection('personal')}
                            leftIcon={expandedSections.personal ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          />
                        </div>
                      </CardHeader>
                      {expandedSections.personal && (
                        <CardBody>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                              <div className="mt-1">
                                <select
                                  value={application.status}
                                  onChange={(e) => onStatusChange(application.id, e.target.value)}
                                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Application ID</p>
                              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{application.id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Submitted Date</p>
                              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(application.submittedAt).toLocaleDateString()} at {new Date(application.submittedAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(application.updatedAt).toLocaleDateString()} at {new Date(application.updatedAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Deadline</p>
                              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(application.deadline).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Completion</p>
                              <div className="mt-1">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-gray-700 dark:text-gray-300">{application.completionPercentage}% Complete</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${application.completionPercentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      )}
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Information</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleSection('academic')}
                            leftIcon={expandedSections.academic ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          />
                        </div>
                      </CardHeader>
                      {expandedSections.academic && (
                        <CardBody>
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                  {application.studentName.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{application.studentName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{application.studentEmail}</p>
                              </div>
                            </div>
                            
                            {studentDetails && (
                              <>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {studentDetails.phone || 'Not provided'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Country of Origin</p>
                                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {studentDetails.country || 'Not provided'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Academic Background</p>
                                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                    {studentDetails.academicBackground?.highestEducation || 'Not provided'} - GPA: {studentDetails.academicBackground?.gpa || 'N/A'}
                                  </p>
                                </div>
                                <div className="flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    leftIcon={<User size={14} />}
                                  >
                                    View Full Profile
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </CardBody>
                      )}
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">University & Program</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleSection('university')}
                            leftIcon={expandedSections.university ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          />
                        </div>
                      </CardHeader>
                      {expandedSections.university && (
                        <CardBody>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">University</p>
                              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{application.universityName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Program</p>
                              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{application.programName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                              <div className="mt-1 flex items-center">
                                <Flag className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{application.country}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
                              <p className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  application.priority === 'high' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                                    : application.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                }`}>
                                  {application.priority.charAt(0).toUpperCase() + application.priority.slice(1)} Priority
                                </span>
                              </p>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<ExternalLink size={14} />}
                              >
                                University Details
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      )}
                    </Card>
                  </div>

                  {/* Tags */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddTag(!showAddTag)}
                          leftIcon={<Plus size={16} />}
                        >
                          Add Tag
                        </Button>
                      </div>
                    </CardHeader>
                    <CardBody>
                      {showAddTag ? (
                        <div className="flex items-center space-x-2 mb-4">
                          <Input
                            placeholder="Enter tag name"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={handleAddTag}
                            disabled={!newTag.trim()}
                          >
                            Add
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setShowAddTag(false);
                              setNewTag('');
                            }}
                            leftIcon={<X size={16} />}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : null}
                      
                      <div className="flex flex-wrap gap-2">
                        {application.tags && application.tags.length > 0 ? (
                          application.tags.map((tag: string, index: number) => (
                            <div 
                              key={index} 
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              <Tag size={14} className="mr-1" />
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-sm">No tags added yet</p>
                        )}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <Button
                          variant="outline"
                          className="w-full"
                          leftIcon={<MessageSquare size={16} />}
                          onClick={() => {
                            onClose();
                            // This would open the communication modal
                          }}
                        >
                          Send Message
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          leftIcon={<Download size={16} />}
                        >
                          Download Documents
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          leftIcon={<Upload size={16} />}
                        >
                          Request Documents
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          leftIcon={<Edit size={16} />}
                        >
                          Edit Application
                        </Button>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab('timeline')}
                        >
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardBody className="p-0">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {timeline.slice(0, 3).map((event, index) => (
                          <div key={index} className="p-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                  {event.type === 'status_change' ? (
                                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  ) : event.type === 'document_upload' ? (
                                    <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  ) : event.type === 'note_added' ? (
                                    <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  )}
                                </div>
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {event.description}
                                </p>
                                <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <span>{new Date(event.timestamp).toLocaleDateString()}</span>
                                  <span className="mx-1">•</span>
                                  <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                  <span className="mx-1">•</span>
                                  <span>By {event.user}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Application Documents</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Download size={16} />}
                        >
                          Download All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardBody className="p-0">
                      {documents.length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {documents.map((doc, index) => (
                            <div key={index} className="p-4 flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div className="ml-4">
                                  <div className="flex items-center">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</h4>
                                    {doc.required && (
                                      <span className="ml-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs px-2 py-0.5 rounded-full">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <span>{doc.fileType}</span>
                                    <span className="mx-1">•</span>
                                    <span>{doc.fileSize}</span>
                                    <span className="mx-1">•</span>
                                    <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getDocumentStatusBadge(doc.status)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadDocument(doc.id)}
                                  leftIcon={<Download size={14} />}
                                >
                                  Download
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  leftIcon={<Eye size={14} />}
                                >
                                  Preview
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Documents Found
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            This application doesn't have any documents uploaded yet.
                          </p>
                        </div>
                      )}
                    </CardBody>
                  </Card>

                  {/* Request Documents */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Additional Documents</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400">
                          Request additional documents from the student to complete their application.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="request-transcript"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="request-transcript" className="text-sm text-gray-700 dark:text-gray-300">
                              Official Transcript
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="request-recommendation"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="request-recommendation" className="text-sm text-gray-700 dark:text-gray-300">
                              Recommendation Letter
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="request-statement"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="request-statement" className="text-sm text-gray-700 dark:text-gray-300">
                              Personal Statement
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="request-financial"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="request-financial" className="text-sm text-gray-700 dark:text-gray-300">
                              Financial Documents
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="request-language"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="request-language" className="text-sm text-gray-700 dark:text-gray-300">
                              Language Test Scores
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="request-passport"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="request-passport" className="text-sm text-gray-700 dark:text-gray-300">
                              Passport Copy
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Additional Instructions
                          </label>
                          <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Provide any specific instructions or requirements for the requested documents..."
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            leftIcon={<Send size={16} />}
                          >
                            Send Request
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Application Timeline</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                        
                        {/* Timeline Events */}
                        <div className="space-y-8 relative">
                          {timeline.map((event, index) => (
                            <div key={index} className="flex items-start">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center z-10 mr-4">
                                {event.type === 'status_change' ? (
                                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                ) : event.type === 'document_upload' ? (
                                  <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                ) : event.type === 'note_added' ? (
                                  <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {event.description}
                                  </h4>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(event.timestamp).toLocaleDateString()} at {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                  {event.details}
                                </p>
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  By {event.user}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-6">
                  {/* Add Note */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Note</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        <textarea
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Add a note about this application..."
                          id="new-note"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              id="internal-only"
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              defaultChecked
                            />
                            <label htmlFor="internal-only" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              Internal note only (not visible to student)
                            </label>
                          </div>
                          <Button
                            onClick={() => {
                              const noteText = (document.getElementById('new-note') as HTMLTextAreaElement).value;
                              if (noteText.trim()) {
                                handleAddNote(noteText);
                                (document.getElementById('new-note') as HTMLTextAreaElement).value = '';
                              }
                            }}
                            leftIcon={<Plus size={16} />}
                          >
                            Add Note
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Notes List */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notes History</h3>
                    </CardHeader>
                    <CardBody className="p-0">
                      {notes.length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {notes.map((note, index) => (
                            <div key={index} className="p-4">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                      {note.addedBy.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-3 flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {note.addedBy}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(note.timestamp).toLocaleDateString()} at {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {note.content}
                                  </p>
                                  {note.internalOnly && (
                                    <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                                      Internal note (not visible to student)
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Notes Found
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            There are no notes for this application yet.
                          </p>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                leftIcon={<MessageSquare size={16} />}
                onClick={() => {
                  onClose();
                  // This would open the communication modal
                }}
              >
                Message Student
              </Button>
              <Button
                variant="outline"
                leftIcon={<Download size={16} />}
              >
                Export Details
              </Button>
            </div>
            <Button
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;