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
  File,
  Brain,
  Zap,
  TrendingUp
} from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import { documentParsingService } from '../../services/documentParsingService';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded' | 'processing' | 'parsing' | 'verified' | 'rejected';
  progress: number;
  uploadDate: Date;
  url?: string;
  error?: string;
  parsedData?: any;
  confidenceScore?: number;
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
  const [showParsedData, setShowParsedData] = useState<string | null>(null);
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

  const simulateUploadAndParse = async (file: UploadedFile): Promise<void> => {
    try {
      // Phase 1: Upload simulation
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, progress, status: progress === 100 ? 'uploaded' : 'uploading' }
              : f
          )
        );
      }

      // Phase 2: Processing
      setFiles(prev => 
        prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'processing' }
            : f
        )
      );
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Phase 3: AI Parsing
      setFiles(prev => 
        prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'parsing' }
            : f
        )
      );

      // Call AI parsing service
      const parsedResult = await documentParsingService.parseDocument({
        id: file.id,
        name: file.name,
        type: file.type,
        url: file.url
      }, getDocumentTypeFromName(documentType));

      // Phase 4: Verification
      const isVerified = parsedResult.confidence_score > 70;
      
      setFiles(prev => 
        prev.map(f => 
          f.id === file.id 
            ? { 
                ...f, 
                status: isVerified ? 'verified' : 'rejected',
                error: isVerified ? undefined : 'Low confidence in document parsing. Please check the document quality.',
                parsedData: parsedResult.parsed_data,
                confidenceScore: parsedResult.confidence_score
              }
            : f
        )
      );

    } catch (error) {
      console.error('Upload and parsing failed:', error);
      setFiles(prev => 
        prev.map(f => 
          f.id === file.id 
            ? { 
                ...f, 
                status: 'rejected',
                error: 'Failed to process document. Please try again.'
              }
            : f
        )
      );
    }
  };

  const getDocumentTypeFromName = (docType: string): string => {
    const type = docType.toLowerCase();
    if (type.includes('cv') || type.includes('resume')) return 'cv';
    if (type.includes('transcript')) return 'transcript';
    if (type.includes('statement')) return 'statement';
    if (type.includes('recommendation')) return 'recommendation';
    if (type.includes('certificate')) return 'certificate';
    return 'other';
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
      
      // Start upload and parsing for each file
      validFiles.forEach(file => {
        simulateUploadAndParse(file);
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
            ? { ...f, status: 'uploading', progress: 0, error: undefined, parsedData: undefined, confidenceScore: undefined }
            : f
        )
      );
      simulateUploadAndParse(file);
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
      case 'parsing':
        return <Brain className="w-4 h-4 text-purple-500 animate-pulse" />;
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
      case 'parsing':
        return 'AI Analyzing...';
      case 'verified':
        return 'Verified & Parsed';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const renderParsedDataSummary = (parsedData: any) => {
    const summary = [];
    
    if (parsedData.education?.institutions?.length) {
      summary.push(`${parsedData.education.institutions.length} institution(s)`);
    }
    if (parsedData.experience?.positions?.length) {
      summary.push(`${parsedData.experience.positions.length} position(s)`);
    }
    if (parsedData.skills?.technical?.length) {
      summary.push(`${parsedData.skills.technical.length} technical skills`);
    }
    if (parsedData.academic_performance?.overall_gpa) {
      summary.push(`GPA: ${parsedData.academic_performance.overall_gpa}`);
    }
    if (parsedData.preferences?.study_fields?.length) {
      summary.push(`${parsedData.preferences.study_fields.length} study field(s)`);
    }

    return summary.length > 0 ? summary.join(', ') : 'Basic information extracted';
  };

  const canUploadMore = files.length < maxFiles;

  return (
    <div className="space-y-6">
      {/* AI Processing Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-purple-900 dark:text-purple-300">AI-Powered Document Analysis</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              Our AI automatically extracts academic background, skills, and preferences from your documents
            </p>
          </div>
          <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
      </div>

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
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <FileText className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
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
                          {file.confidenceScore && (
                            <>
                              <span>•</span>
                              <div className={`flex items-center space-x-1 ${getConfidenceColor(file.confidenceScore)}`}>
                                <TrendingUp size={12} />
                                <span className="font-medium">{file.confidenceScore}% confidence</span>
                              </div>
                            </>
                          )}
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

                        {/* AI Processing Indicator */}
                        {file.status === 'parsing' && (
                          <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-sm">
                            <div className="flex items-center space-x-2">
                              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                              <span className="text-purple-700 dark:text-purple-300">
                                AI is analyzing your document and extracting key information...
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Parsed Data Summary */}
                        {file.status === 'verified' && file.parsedData && (
                          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                  Successfully Parsed
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowParsedData(showParsedData === file.id ? null : file.id)}
                                className="text-green-700 dark:text-green-300"
                              >
                                {showParsedData === file.id ? 'Hide Details' : 'View Details'}
                              </Button>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Extracted: {renderParsedDataSummary(file.parsedData)}
                            </p>
                            
                            {/* Detailed Parsed Data */}
                            {showParsedData === file.id && (
                              <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-800">
                                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Extracted Information:</h5>
                                <div className="space-y-2 text-sm">
                                  {file.parsedData.education?.institutions && (
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Education: </span>
                                      {file.parsedData.education.institutions.map((inst: any, idx: number) => (
                                        <span key={idx} className="text-gray-600 dark:text-gray-400">
                                          {inst.degree} in {inst.field} from {inst.name}
                                          {idx < file.parsedData.education.institutions.length - 1 ? ', ' : ''}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {file.parsedData.skills?.technical && (
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Technical Skills: </span>
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {file.parsedData.skills.technical.slice(0, 5).join(', ')}
                                        {file.parsedData.skills.technical.length > 5 && ` +${file.parsedData.skills.technical.length - 5} more`}
                                      </span>
                                    </div>
                                  )}
                                  {file.parsedData.experience?.positions && (
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Experience: </span>
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {file.parsedData.experience.positions.length} position(s) found
                                      </span>
                                    </div>
                                  )}
                                  {file.parsedData.academic_performance?.overall_gpa && (
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">GPA: </span>
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {file.parsedData.academic_performance.overall_gpa}/4.0
                                      </span>
                                    </div>
                                  )}
                                  {file.parsedData.preferences?.study_fields && (
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Study Interests: </span>
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {file.parsedData.preferences.study_fields.join(', ')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
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
                {files.filter(f => f.status === 'uploading' || f.status === 'processing' || f.status === 'parsing').length} processing
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;