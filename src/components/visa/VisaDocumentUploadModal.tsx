import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { visaService } from '../../services/visaService';

interface VisaDocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (documentData: any, file: File) => Promise<void>;
  application: any;
}

const VisaDocumentUploadModal: React.FC<VisaDocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  application
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    notes: '',
    required: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const loadRequirements = async () => {
      if (!application) return;
      
      try {
        setLoading(true);
        const reqs = await visaService.getVisaRequirements(application.country, application.visaType);
        setRequirements(reqs);
        
        // Reset form when application changes
        setFormData({
          name: '',
          type: '',
          notes: '',
          required: true
        });
        setSelectedFile(null);
      } catch (error) {
        console.error('Error loading visa requirements:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && application) {
      loadRequirements();
    }
  }, [isOpen, application]);

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
      
      // If selecting a requirement, auto-fill the name
      if (name === 'type' && value) {
        const selectedRequirement = requirements.find(req => req.id === value);
        if (selectedRequirement) {
          setFormData(prev => ({ 
            ...prev, 
            name: selectedRequirement.name,
            required: selectedRequirement.required
          }));
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.name || !formData.type) {
      alert('Please select a file, enter a name, and select a document type');
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

      await onUpload({
        name: formData.name,
        type: formData.type,
        notes: formData.notes,
        required: formData.required
      }, selectedFile);

      setUploadProgress(100);
      setTimeout(() => {
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
        setFormData({
          name: '',
          type: '',
          notes: '',
          required: true
        });
      }, 500);
    } catch (error) {
      console.error('Error uploading document:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Upload Visa Document
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Document Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Document Type</option>
                {loading ? (
                  <option value="" disabled>Loading requirements...</option>
                ) : (
                  requirements.map(req => (
                    <option key={req.id} value={req.id}>
                      {req.name} {req.required ? '(Required)' : '(Optional)'}
                    </option>
                  ))
                )}
                <option value="other">Other Document</option>
              </select>
            </div>

            {/* Document Name */}
            <Input
              label="Document Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., DS-160 Confirmation Page"
              required
            />

            {/* Document Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any notes about this document"
              />
            </div>

            {/* Required Checkbox */}
            <div className="flex items-center">
              <input
                id="required"
                name="required"
                type="checkbox"
                checked={formData.required}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="required" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                This is a required document
              </label>
            </div>

            {/* Selected Requirement Info */}
            {formData.type && formData.type !== 'other' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                      Requirement Information
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                      {requirements.find(req => req.id === formData.type)?.description || 'No description available'}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      {requirements.find(req => req.id === formData.type)?.instructions || 'No instructions available'}
                    </p>
                    
                    {requirements.find(req => req.id === formData.type)?.externalLink && (
                      <a 
                        href={requirements.find(req => req.id === formData.type)?.externalLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <ExternalLink size={14} className="mr-1" />
                        Official Link
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document File
              </label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
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
                  accept=".pdf,.jpg,.jpeg,.png"
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
                      PDF, JPG, or PNG (max. 10MB)
                    </p>
                    <Button size="sm">
                      Select File
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div>
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

            {/* Document Format Guidelines */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Document Guidelines
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Files must be in PDF, JPG, or PNG format</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Maximum file size is 10MB</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Documents must be clear and legible</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>All pages of multi-page documents should be in a single file</span>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Do not upload password-protected or encrypted files</span>
                </li>
              </ul>
            </div>
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
            <Button
              onClick={handleUpload}
              isLoading={isUploading}
              disabled={!selectedFile || !formData.name || !formData.type}
              leftIcon={<Upload size={16} />}
            >
              Upload Document
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaDocumentUploadModal;