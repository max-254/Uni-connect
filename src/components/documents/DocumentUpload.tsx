import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Eye,
  Download,
  Trash2,
  Plus,
  File
} from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardBody } from '../ui/Card';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded' | 'processing' | 'verified' | 'rejected';
  progress: number;
  uploadDate: Date;
  url?: string;
  error?: string;
}

interface DocumentUploadProps {
  documentType: string;
  acceptedTypes: string[];
  maxFiles: number;
  maxFileSize: number; // in bytes
  onFilesUploaded: (files: UploadedFile[]) => void;
  existingFiles?: UploadedFile[];
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documentType,
  acceptedTypes,
  maxFiles,
  maxFileSize,
  onFilesUploaded,
  existingFiles = []
}) => {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const simulateUpload = async (file: UploadedFile): Promise<void> => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setFiles(prev => 
        prev.map(f => 
          f.id === file.id 
            ? { ...f, progress, status: progress === 100 ? 'uploaded' : 'uploading' }
            : f
        )
      );
    }

    // Simulate processing
    setFiles(prev => 
      prev.map(f => 
        f.id === file.id 
          ? { ...f, status: 'processing' }
          : f
      )
    );

    // Simulate verification (random result for demo)
    await new Promise(resolve => setTimeout(resolve, 2000));
    const isVerified = Math.random() > 0.2; // 80% success rate
    
    setFiles(prev => 
      prev.map(f => 
        f.id === file.id 
          ? { 
              ...f, 
              status: isVerified ? 'verified' : 'rejected',
              error: isVerified ? undefined : 'Document quality is insufficient. Please upload a clearer version.'
            }
          : f
      )
    );
  };

  const handleFileSelect = useCallback(async (selectedFiles: FileList) => {
    const fileArray = Array.from(selectedFiles);
    
    // Check if adding these files would exceed the limit
    if (files.length + fileArray.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} file(s) for ${documentType}`);
      return;
    }

    const validFiles: UploadedFile[] = [];
    const invalidFiles: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        invalidFiles.push(`${file.name}: ${error}`);
      } else {
        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploading',
          progress: 0,
          uploadDate: new Date(),
          url: URL.createObjectURL(file)
        };
        validFiles.push(uploadedFile);
      }
    });

    if (invalidFiles.length > 0) {
      alert(`Some files were not uploaded:\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      
      // Start upload simulation for each file
      validFiles.forEach(file => {
        simulateUpload(file);
      });

      onFilesUploaded(validFiles);
    }
  }, [files.length, maxFiles, documentType, maxFileSize, acceptedTypes, onFilesUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryUpload = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'uploading', progress: 0, error: undefined }
            : f
        )
      );
      simulateUpload(file);
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'uploaded':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />;
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'uploaded':
        return 'Uploaded';
      case 'processing':
        return 'Processing...';
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const canUploadMore = files.length < maxFiles;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {canUploadMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={maxFiles > 1}
            accept={acceptedTypes.join(',')}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Upload {documentType}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Maximum {maxFiles} file(s) • {acceptedTypes.join(', ')} • Max {formatFileSize(maxFileSize)} each
          </p>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Plus size={16} />}
          >
            Choose Files
          </Button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {files.map((file) => (
                <div key={file.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.uploadDate.toLocaleDateString()}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(file.status)}
                            <span>{getStatusText(file.status)}</span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        {file.status === 'uploading' && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {file.progress}% uploaded
                            </p>
                          </div>
                        )}
                        
                        {/* Error Message */}
                        {file.status === 'rejected' && file.error && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                            {file.error}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {file.url && file.status !== 'uploading' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                          leftIcon={<Eye size={14} />}
                        >
                          Preview
                        </Button>
                      )}
                      
                      {file.status === 'verified' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Download size={14} />}
                        >
                          Download
                        </Button>
                      )}
                      
                      {file.status === 'rejected' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryUpload(file.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Retry
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        leftIcon={<Trash2 size={14} />}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Upload Summary */}
      {files.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {files.length} of {maxFiles} files uploaded
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-green-600 dark:text-green-400">
                {files.filter(f => f.status === 'verified').length} verified
              </span>
              <span className="text-red-600 dark:text-red-400">
                {files.filter(f => f.status === 'rejected').length} rejected
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                {files.filter(f => f.status === 'uploading' || f.status === 'processing').length} processing
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;