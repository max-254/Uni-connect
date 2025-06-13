import React, { useState } from 'react';
import { X, FileText, Users, CheckCircle, AlertTriangle, Upload, FileCheck, Filter } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { DocumentType } from '../../services/documentService';
import { documentService } from '../../services/documentService';

interface BatchProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[];
}

interface BatchProcessingResult {
  success: number;
  failed: number;
  inProgress: boolean;
  results: {
    studentId: string;
    studentName: string;
    status: 'success' | 'failed';
    message?: string;
  }[];
}

const BatchProcessingModal: React.FC<BatchProcessingModalProps> = ({
  isOpen,
  onClose,
  students
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'generate'>('generate');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState<BatchProcessingResult | null>(null);
  const [formData, setFormData] = useState({
    documentType: '' as DocumentType,
    templateId: '',
    studentFilter: '',
    selectedStudents: [] as string[],
    selectAll: false,
    expiryDate: '',
    sendNotification: true
  });

  const filteredStudents = students.filter(student => 
    !formData.studentFilter || 
    student.name.toLowerCase().includes(formData.studentFilter.toLowerCase()) ||
    student.email.toLowerCase().includes(formData.studentFilter.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      if (name === 'selectAll') {
        setFormData(prev => ({
          ...prev,
          selectAll: checked,
          selectedStudents: checked ? filteredStudents.map(s => s.id) : []
        }));
      } else if (name.startsWith('student-')) {
        const studentId = name.replace('student-', '');
        setFormData(prev => {
          const newSelectedStudents = checked
            ? [...prev.selectedStudents, studentId]
            : prev.selectedStudents.filter(id => id !== studentId);
          
          return {
            ...prev,
            selectedStudents: newSelectedStudents,
            selectAll: newSelectedStudents.length === filteredStudents.length
          };
        });
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleBatchUpload = async () => {
    if (!selectedFile || formData.selectedStudents.length === 0 || !formData.documentType) {
      alert('Please select a file, at least one student, and a document type');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingResults({
        success: 0,
        failed: 0,
        inProgress: true,
        results: []
      });

      // Simulate batch processing
      for (const studentId of formData.selectedStudents) {
        const student = students.find(s => s.id === studentId);
        
        try {
          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Simulate success/failure (80% success rate)
          const isSuccess = Math.random() > 0.2;
          
          setProcessingResults(prev => {
            if (!prev) return null;
            
            return {
              ...prev,
              success: isSuccess ? prev.success + 1 : prev.success,
              failed: isSuccess ? prev.failed : prev.failed + 1,
              results: [
                ...prev.results,
                {
                  studentId,
                  studentName: student?.name || 'Unknown Student',
                  status: isSuccess ? 'success' : 'failed',
                  message: isSuccess 
                    ? 'Document processed successfully' 
                    : 'Failed to process document'
                }
              ]
            };
          });
        } catch (error) {
          console.error(`Error processing document for student ${studentId}:`, error);
          
          setProcessingResults(prev => {
            if (!prev) return null;
            
            return {
              ...prev,
              failed: prev.failed + 1,
              results: [
                ...prev.results,
                {
                  studentId,
                  studentName: student?.name || 'Unknown Student',
                  status: 'failed',
                  message: 'An error occurred during processing'
                }
              ]
            };
          });
        }
      }

      // Complete processing
      setProcessingResults(prev => prev ? { ...prev, inProgress: false } : null);
    } catch (error) {
      console.error('Error in batch processing:', error);
      setProcessingResults(prev => prev ? { ...prev, inProgress: false } : null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchGenerate = async () => {
    if (formData.selectedStudents.length === 0 || !formData.documentType || !formData.templateId) {
      alert('Please select at least one student, a document type, and a template');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingResults({
        success: 0,
        failed: 0,
        inProgress: true,
        results: []
      });

      // Simulate batch processing
      for (const studentId of formData.selectedStudents) {
        const student = students.find(s => s.id === studentId);
        
        try {
          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Simulate success/failure (90% success rate)
          const isSuccess = Math.random() > 0.1;
          
          setProcessingResults(prev => {
            if (!prev) return null;
            
            return {
              ...prev,
              success: isSuccess ? prev.success + 1 : prev.success,
              failed: isSuccess ? prev.failed : prev.failed + 1,
              results: [
                ...prev.results,
                {
                  studentId,
                  studentName: student?.name || 'Unknown Student',
                  status: isSuccess ? 'success' : 'failed',
                  message: isSuccess 
                    ? 'Document generated successfully' 
                    : 'Failed to generate document'
                }
              ]
            };
          });
        } catch (error) {
          console.error(`Error generating document for student ${studentId}:`, error);
          
          setProcessingResults(prev => {
            if (!prev) return null;
            
            return {
              ...prev,
              failed: prev.failed + 1,
              results: [
                ...prev.results,
                {
                  studentId,
                  studentName: student?.name || 'Unknown Student',
                  status: 'failed',
                  message: 'An error occurred during generation'
                }
              ]
            };
          });
        }
      }

      // Complete processing
      setProcessingResults(prev => prev ? { ...prev, inProgress: false } : null);
    } catch (error) {
      console.error('Error in batch generation:', error);
      setProcessingResults(prev => prev ? { ...prev, inProgress: false } : null);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      documentType: '' as DocumentType,
      templateId: '',
      studentFilter: '',
      selectedStudents: [],
      selectAll: false,
      expiryDate: '',
      sendNotification: true
    });
    setSelectedFile(null);
    setProcessingResults(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Batch Document Processing
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
            onClick={() => {
              setActiveTab('upload');
              resetForm();
            }}
          >
            <Upload size={16} className="inline mr-2" />
            Batch Upload
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium text-sm ${
              activeTab === 'generate'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => {
              setActiveTab('generate');
              resetForm();
            }}
          >
            <FileCheck size={16} className="inline mr-2" />
            Batch Generate
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {processingResults ? (
            <div className="space-y-6">
              {/* Processing Results */}
              <div className="text-center mb-6">
                {processingResults.inProgress ? (
                  <div className="animate-pulse">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Processing Documents...
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Please wait while we process your documents
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Processing Complete
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {processingResults.success} successful, {processingResults.failed} failed
                    </p>
                  </div>
                )}
              </div>

              {/* Results Table */}
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                        Student
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {processingResults.results.map((result, index) => (
                      <tr key={index} className={result.status === 'success' ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="font-medium text-gray-900 dark:text-white">{result.studentName}</div>
                          <div className="text-gray-500 dark:text-gray-400">{result.studentId}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {result.status === 'success' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              <CheckCircle size={12} className="mr-1" />
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              <AlertTriangle size={12} className="mr-1" />
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                          {result.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={resetForm}
                >
                  Process More Documents
                </Button>
                <Button
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Common Fields */}
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

              {/* Template Selection (for Generate tab) */}
              {activeTab === 'generate' && (
                <div>
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
              )}

              {/* File Upload (for Upload tab) */}
              {activeTab === 'upload' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document File (ZIP archive containing individual files)
                  </label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center ${
                      selectedFile 
                        ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    onClick={() => document.getElementById('batch-file-input')?.click()}
                  >
                    <input
                      id="batch-file-input"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".zip,.rar,.7zip"
                    />
                    
                    {selectedFile ? (
                      <div>
                        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                        <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
                          File Selected
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          ZIP file containing documents (max. 50MB)
                        </p>
                        <Button size="sm">
                          Select File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Common Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                
                <div className="flex items-center h-full">
                  <input
                    id="sendNotification"
                    name="sendNotification"
                    type="checkbox"
                    checked={formData.sendNotification}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sendNotification" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Send notification to students when documents are available
                  </label>
                </div>
              </div>

              {/* Student Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Select Students
                  </h3>
                  <div className="flex items-center">
                    <input
                      id="selectAll"
                      name="selectAll"
                      type="checkbox"
                      checked={formData.selectAll}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="selectAll" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Select All
                    </label>
                  </div>
                </div>
                
                <div className="mb-4 relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Filter students..."
                    value={formData.studentFilter}
                    onChange={(e) => setFormData(prev => ({ ...prev, studentFilter: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {filteredStudents.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredStudents.map(student => (
                        <div key={student.id} className="p-3 flex items-center">
                          <input
                            id={`student-${student.id}`}
                            name={`student-${student.id}`}
                            type="checkbox"
                            checked={formData.selectedStudents.includes(student.id)}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`student-${student.id}`} className="ml-3 flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{student.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No students found matching your filter
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {formData.selectedStudents.length} of {students.length} students selected
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!processingResults && (
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
                  onClick={handleBatchUpload}
                  isLoading={isProcessing}
                  disabled={!selectedFile || formData.selectedStudents.length === 0 || !formData.documentType}
                  leftIcon={<Upload size={16} />}
                >
                  Process Batch Upload
                </Button>
              ) : (
                <Button
                  onClick={handleBatchGenerate}
                  isLoading={isProcessing}
                  disabled={formData.selectedStudents.length === 0 || !formData.documentType || !formData.templateId}
                  leftIcon={<FileCheck size={16} />}
                >
                  Generate Documents
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchProcessingModal;