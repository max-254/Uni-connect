import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Download, 
  Trash2, 
  Edit, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  History,
  Lock,
  FileCheck,
  Copy,
  Mail,
  MessageSquare,
  Bell
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { documentService, EnrollmentDocument, DocumentType } from '../../services/documentService';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentPreviewModal from './DocumentPreviewModal';
import DocumentVersionHistory from './DocumentVersionHistory';
import BatchProcessingModal from './BatchProcessingModal';
import NotificationSettingsModal from './NotificationSettingsModal';

const AdminDocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<EnrollmentDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<EnrollmentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<DocumentType | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState(false);
  const [showBatchProcessingModal, setShowBatchProcessingModal] = useState(false);
  const [showNotificationSettingsModal, setShowNotificationSettingsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<EnrollmentDocument | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [docsData, studentsData] = await Promise.all([
          documentService.getAllDocuments(),
          documentService.getStudents()
        ]);
        setDocuments(docsData);
        setFilteredDocuments(docsData);
        setStudents(studentsData);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, documentTypeFilter, statusFilter, selectedStudentId, documents]);

  const applyFilters = () => {
    let filtered = [...documents];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.fileName.toLowerCase().includes(query) || 
        doc.studentName.toLowerCase().includes(query) ||
        doc.studentId.toLowerCase().includes(query)
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

    // Apply student filter
    if (selectedStudentId) {
      filtered = filtered.filter(doc => doc.studentId === selectedStudentId);
    }

    setFilteredDocuments(filtered);
  };

  const handleUploadDocument = async (documentData: Partial<EnrollmentDocument>, file: File) => {
    try {
      const newDocument = await documentService.uploadDocument(documentData, file);
      setDocuments(prev => [...prev, newDocument]);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    }
  };

  const handleGenerateDocument = async (documentData: Partial<EnrollmentDocument>) => {
    try {
      const newDocument = await documentService.generateDocument(documentData);
      setDocuments(prev => [...prev, newDocument]);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Failed to generate document. Please try again.');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await documentService.deleteDocument(documentId);
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document. Please try again.');
      }
    }
  };

  const handlePreviewDocument = (document: EnrollmentDocument) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const handleViewVersionHistory = (document: EnrollmentDocument) => {
    setSelectedDocument(document);
    setShowVersionHistoryModal(true);
  };

  const handleSendNotification = async (documentId: string) => {
    try {
      await documentService.sendDocumentNotification(documentId);
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, icon: React.ReactNode }> = {
      'pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <Clock size={14} className="mr-1" /> },
      'available': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle size={14} className="mr-1" /> },
      'expired': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: <AlertTriangle size={14} className="mr-1" /> },
      'draft': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: <Edit size={14} className="mr-1" /> }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Document Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage enrollment documents for students
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setShowUploadModal(true)}
            leftIcon={<Upload size={16} />}
          >
            Upload Document
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBatchProcessingModal(true)}
            leftIcon={<FileCheck size={16} />}
          >
            Batch Processing
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              onChange={(e) => setDocumentTypeFilter(e.target.value as DocumentType | '')}
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
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="available">Available</option>
              <option value="expired">Expired</option>
            </select>
            
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Documents List */}
      {filteredDocuments.length > 0 ? (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                  Document
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Student
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Type
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Date
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {filteredDocuments.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900 dark:text-white">{document.fileName}</div>
                        <div className="text-gray-500 dark:text-gray-400">{document.fileSize}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                          {document.studentName.charAt(0)}
                        </span>
                      </div>
                      <span>{document.studentName}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                    {document.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {getStatusBadge(document.status)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewDocument(document)}
                        leftIcon={<Eye size={14} />}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewVersionHistory(document)}
                        leftIcon={<History size={14} />}
                      >
                        History
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSendNotification(document.id)}
                        leftIcon={<Send size={14} />}
                      >
                        Notify
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(document.id)}
                        leftIcon={<Trash2 size={14} />}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card>
          <CardBody className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Documents Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || documentTypeFilter || statusFilter || selectedStudentId
                ? "No documents match your current filters. Try adjusting your search criteria."
                : "You haven't uploaded any documents yet."}
            </p>
            {searchQuery || documentTypeFilter || statusFilter || selectedStudentId ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setDocumentTypeFilter('');
                  setStatusFilter('');
                  setSelectedStudentId('');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                onClick={() => setShowUploadModal(true)}
                leftIcon={<Upload size={16} />}
              >
                Upload First Document
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadDocument}
        onGenerate={handleGenerateDocument}
        students={students}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        document={selectedDocument}
      />

      {/* Version History Modal */}
      <DocumentVersionHistory
        isOpen={showVersionHistoryModal}
        onClose={() => setShowVersionHistoryModal(false)}
        document={selectedDocument}
      />

      {/* Batch Processing Modal */}
      <BatchProcessingModal
        isOpen={showBatchProcessingModal}
        onClose={() => setShowBatchProcessingModal(false)}
        students={students}
      />

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={showNotificationSettingsModal}
        onClose={() => setShowNotificationSettingsModal(false)}
      />
    </div>
  );
};

export default AdminDocumentManager;