import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Bell, 
  Calendar, 
  Search,
  Filter,
  ExternalLink,
  Lock,
  Info,
  Mail
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { documentService, EnrollmentDocument } from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import DocumentPreviewModal from './DocumentPreviewModal';
import NotificationPreferencesModal from './NotificationPreferencesModal';

const StudentDocumentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<EnrollmentDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<EnrollmentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showNotificationPreferencesModal, setShowNotificationPreferencesModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<EnrollmentDocument | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        if (user) {
          const data = await documentService.getStudentDocuments(user.id);
          setDocuments(data);
          setFilteredDocuments(data);
          
          // Count new documents
          const newDocs = data.filter(doc => 
            new Date(doc.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
          );
          setNotificationCount(newDocs.length);
        }
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, documentTypeFilter, statusFilter, documents]);

  const applyFilters = () => {
    let filtered = [...documents];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.fileName.toLowerCase().includes(query) || 
        doc.type.toLowerCase().includes(query)
      );
    }

    // Apply document type filter
    if (documentTypeFilter) {
      filtered = filtered.filter(doc => doc.type === documentTypeFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    setFilteredDocuments(filtered);
  };

  const handleDownloadDocument = async (documentId: string) => {
    try {
      await documentService.downloadDocument(documentId);
      // In a real app, this would trigger a file download
      alert('Document download started');
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const handlePreviewDocument = (document: EnrollmentDocument) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: React.ReactNode }> = {
      'pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <Clock size={14} className="mr-1" /> },
      'available': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle size={14} className="mr-1" /> },
      'expired': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <AlertTriangle size={14} className="mr-1" /> }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const isDocumentNew = (createdAt: string): boolean => {
    return new Date(createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
  };

  const getExpiryInfo = (document: EnrollmentDocument) => {
    if (!document.expiryDate) return null;
    
    const expiryDate = new Date(document.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { text: 'Expired', color: 'text-red-600 dark:text-red-400' };
    } else if (daysUntilExpiry <= 30) {
      return { text: `Expires in ${daysUntilExpiry} days`, color: 'text-yellow-600 dark:text-yellow-400' };
    } else {
      return { text: `Expires on ${expiryDate.toLocaleDateString()}`, color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Documents</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Access and manage your enrollment documents
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowNotificationPreferencesModal(true)}
            leftIcon={<Bell size={16} />}
            className="relative"
          >
            Notification Preferences
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                {notificationCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documents.filter(doc => doc.status === 'available').length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documents.filter(doc => doc.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={documentTypeFilter}
              onChange={(e) => setDocumentTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Document Types</option>
              <option value="offer_letter">Offer Letter</option>
              <option value="coe">Confirmation of Enrollment</option>
              <option value="i20">I-20</option>
              <option value="cas">CAS</option>
              <option value="admission_letter">Admission Letter</option>
              <option value="visa_support">Visa Support Letter</option>
              <option value="financial_document">Financial Document</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="available">Available</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Documents List */}
      {filteredDocuments.length > 0 ? (
        <div className="space-y-4">
          {filteredDocuments.map((document) => {
            const expiryInfo = getExpiryInfo(document);
            
            return (
              <Card key={document.id} hoverable={true}>
                <CardBody className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {document.fileName}
                          </h3>
                          {isDocumentNew(document.createdAt) && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              New
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center">
                          {getStatusBadge(document.status)}
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            {document.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                          {document.isEncrypted && (
                            <span className="ml-2 inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Lock size={12} className="mr-1" />
                              Encrypted
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                          <Calendar size={14} className="mr-1 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">
                            Uploaded on {new Date(document.createdAt).toLocaleDateString()}
                          </span>
                          {expiryInfo && (
                            <span className={`ml-4 ${expiryInfo.color}`}>
                              <Clock size={14} className="inline mr-1" />
                              {expiryInfo.text}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewDocument(document)}
                        leftIcon={<Eye size={14} />}
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadDocument(document.id)}
                        leftIcon={<Download size={14} />}
                        disabled={document.status !== 'available'}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  {/* Document Notes or Description */}
                  {document.description && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-start">
                        <Info size={16} className="text-gray-500 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {document.description}
                        </p>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardBody className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Documents Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || documentTypeFilter || statusFilter
                ? "No documents match your current filters. Try adjusting your search criteria."
                : "You don't have any enrollment documents yet."}
            </p>
            {searchQuery || documentTypeFilter || statusFilter ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setDocumentTypeFilter('');
                  setStatusFilter('');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                variant="outline"
                leftIcon={<Mail size={16} />}
              >
                Contact Administration
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        document={selectedDocument}
      />

      {/* Notification Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={showNotificationPreferencesModal}
        onClose={() => setShowNotificationPreferencesModal(false)}
      />
    </div>
  );
};

export default StudentDocumentDashboard;