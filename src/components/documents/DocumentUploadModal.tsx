import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Lock, 
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { DocumentType } from '../../services/documentService';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (documentData: any, file: File) => Promise<void>;
  onGenerate: (documentData: any) => Promise<void>;
  students: any[];
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  onGenerate,
  students
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'generate'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    studentId: '',
    documentType: '' as DocumentType,
    expiryDate: '',
    isEncrypted: false,
    description: '',
    sendNotification: true,
    templateId: '',
    documentData: {}
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.studentId || !formData.documentType) {
      alert('Please select a file, student, and document type');
      return;
    }

    try {
      setIsUploading(true);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      // Get student name for the document data
      const student = students.find(s => s.id === formData.studentId);
      
      await onUpload({
        studentId: formData.studentId,
        studentName: student?.name || 'Unknown Student',
        type: formData.documentType,
        expiryDate: formData.expiryDate || undefined,
        isEncrypted: formData.isEncrypted,
        description: formData.description,
        sendNotification: formData.sendNotification
      }, selectedFile);

      setUploadProgress(100);
      setTimeout(() => {
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
        resetForm();
      }, 500);
    } catch (error) {
      console.error('Error uploading document:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleGenerate = async () => {
    if (!formData.studentId || !formData.documentType || !formData.templateId) {
      alert('Please select a student, document type, and template');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Get student name for the document data
      const student = students.find(s => s.id === formData.studentId);
      
      await onGenerate({
        studentId: formData.studentId,
        studentName: student?.name || 'Unknown Student',
        type: formData.documentType,
        expiryDate: formData.expiryDate || undefined,
        isEncrypted: formData.isEncrypted,
        description: formData.description,
        sendNotification: formData.sendNotification,
        templateId: formData.templateId,
        documentData: formData.documentData
      });

      setIsGenerating(false);
      resetForm();
    } catch (error) {
      console.error('Error generating document:', error);
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      documentType: '' as DocumentType,
      expiryDate: '',
      isEncrypted: false,
      description: '',
      sendNotification: true,
      templateId: '',
      documentData: {}
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeTab === 'upload' ? 'Upload Document' : 'Generate Document'}
          </h2>
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
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 py-4 text-center font-medium text-sm ${
              activeTab === 'upload'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={16} className="inline mr-2" />
            Upload Existing Document
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium text-sm ${
              activeTab === 'generate'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('generate')}
          >
            <FileCheck size={16} className="inline mr-2" />
            Generate New Document
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student
                </label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Type
                </label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Document Type</option>
                  <option value="offer_letter">Offer Letter</option>
                  <option value="coe">Confirmation of Enrollment (COE)</option>
                  <option value="i20">I-20</option>
                  <option value="cas">CAS</option>
                  <option value="admission_letter">Admission Letter</option>
                  <option value="visa_support">Visa Support Letter</option>
                  <option value="financial_document">Financial Document</option>
                </select>
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Date (Optional)
              </label>
              <Input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Security & Notification Options */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="isEncrypted"
                  name="isEncrypted"
                  type="checkbox"
                  checked={formData.isEncrypted}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isEncrypted" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Encrypt document (adds password protection)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="sendNotification"
                  name="sendNotification"
                  type="checkbox"
                  checked={formData.sendNotification}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="sendNotification" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Send notification to student when document is available
                </label>
              </div>
            </div>

            {/* Tab-specific content */}
            {activeTab === 'upload' ? (
              <div>
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center ${
                    selectedFile 
                      ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                  
                  {selectedFile ? (
                    <div>
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        File Selected
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Change file
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        PDF, DOC, or DOCX (max. 10MB)
                      </p>
                      <Button size="sm">
                        Select File
                      </Button>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Upload Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Document Template Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document Template
                  </label>
                  <select
                    name="templateId"
                    value={formData.templateId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Template</option>
                    <option value="standard_offer">Standard Offer Letter</option>
                    <option value="conditional_offer">Conditional Offer Letter</option>
                    <option value="standard_coe">Standard COE</option>
                    <option value="standard_i20">Standard I-20</option>
                    <option value="standard_cas">Standard CAS</option>
                    <option value="visa_support_letter">Visa Support Letter</option>
                    <option value="financial_guarantee">Financial Guarantee Letter</option>
                  </select>
                </div>

                {/* Template Preview */}
                {formData.templateId && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">Template Preview</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye size={14} />}
                      >
                        View Full Template
                      </Button>
                    </div>
                    <div className="aspect-[8.5/11] bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 p-4 flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400 text-center">
                        Template preview would be displayed here
                      </p>
                    </div>
                  </div>
                )}

                {/* Document Data Fields */}
                {formData.templateId && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Document Data</h4>
                    <div className="space-y-4">
                      {/* These fields would be dynamically generated based on the selected template */}
                      <Input
                        label="Program Name"
                        name="programName"
                        value={(formData.documentData as any).programName || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          documentData: {
                            ...prev.documentData,
                            programName: e.target.value
                          }
                        }))}
                      />
                      <Input
                        label="Start Date"
                        type="date"
                        name="startDate"
                        value={(formData.documentData as any).startDate || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          documentData: {
                            ...prev.documentData,
                            startDate: e.target.value
                          }
                        }))}
                      />
                      <Input
                        label="End Date"
                        type="date"
                        name="endDate"
                        value={(formData.documentData as any).endDate || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          documentData: {
                            ...prev.documentData,
                            endDate: e.target.value
                          }
                        }))}
                      />
                      <Input
                        label="Reference Number"
                        name="referenceNumber"
                        value={(formData.documentData as any).referenceNumber || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          documentData: {
                            ...prev.documentData,
                            referenceNumber: e.target.value
                          }
                        }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            {activeTab === 'upload' ? (
              <Button
                onClick={handleUpload}
                isLoading={isUploading}
                disabled={!selectedFile || !formData.studentId || !formData.documentType}
                leftIcon={<Upload size={16} />}
              >
                Upload Document
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                isLoading={isGenerating}
                disabled={!formData.studentId || !formData.documentType || !formData.templateId}
                leftIcon={<FileCheck size={16} />}
              >
                Generate Document
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;