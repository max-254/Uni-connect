import React, { useState } from 'react';
import { X, Download, Lock, Calendar, Clock, FileText, User, Mail, Phone, Info, Copy, Share2 } from 'lucide-react';
import Button from '../ui/Button';
import { EnrollmentDocument } from '../../services/documentService';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: EnrollmentDocument | null;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!document) return;
    
    try {
      setIsDownloading(true);
      // In a real app, this would trigger a file download
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Document download started');
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    if (!document) return;
    
    // In a real app, this would copy a secure link to the clipboard
    navigator.clipboard.writeText(`https://example.com/secure-documents/${document.id}`);
    alert('Secure link copied to clipboard');
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {document.fileName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {document.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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

        {/* Document Preview */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Document Viewer */}
            <div className="flex-1">
              <div className="aspect-[8.5/11] bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-md overflow-hidden">
                {document.isEncrypted ? (
                  <div className="h-full flex flex-col items-center justify-center p-6">
                    <Lock className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Encrypted Document
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                      This document is encrypted for security. You'll need to download and open it with the password provided to you.
                    </p>
                    <Button
                      onClick={handleDownload}
                      isLoading={isDownloading}
                      leftIcon={<Download size={16} />}
                    >
                      Download Encrypted Document
                    </Button>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      Document preview would be displayed here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Details */}
            <div className="lg:w-80 space-y-6">
              {/* Document Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Document Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{document.studentName}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(document.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {document.expiryDate && (
                    <div className="flex items-start">
                      <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Expires</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(document.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start">
                    <Info className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {document.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              {document.isEncrypted && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center mb-2">
                    <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <h3 className="font-medium text-blue-900 dark:text-blue-300">Security Information</h3>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                    This document is encrypted for security. The password has been sent to the student's email address.
                  </p>
                </div>
              )}

              {/* Description */}
              {document.description && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {document.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={handleDownload}
                  isLoading={isDownloading}
                  leftIcon={<Download size={16} />}
                >
                  Download Document
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCopyLink}
                  leftIcon={<Copy size={16} />}
                >
                  Copy Secure Link
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  leftIcon={<Share2 size={16} />}
                >
                  Share Document
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;