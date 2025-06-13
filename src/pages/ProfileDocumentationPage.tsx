import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Award, 
  DollarSign, 
  User, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Download,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'uploaded' | 'processing' | 'verified' | 'rejected';
  url?: string;
}

interface DocumentSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  maxFiles: number;
  acceptedTypes: string[];
  files: UploadedFile[];
  guidelines: string[];
}

const ProfileDocumentationPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('cv');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [documentSections, setDocumentSections] = useState<DocumentSection[]>([
    {
      id: 'cv',
      title: 'Curriculum Vitae (CV)',
      description: 'Upload your most recent CV or resume highlighting your academic and professional experience.',
      icon: <User className="h-6 w-6" />,
      required: true,
      maxFiles: 1,
      acceptedTypes: ['.pdf', '.doc', '.docx'],
      files: [],
      guidelines: [
        'Include your contact information, education, work experience, and skills',
        'Keep it concise and relevant to your field of study',
        'Use a professional format and clear headings',
        'Maximum file size: 5MB',
        'Accepted formats: PDF, DOC, DOCX'
      ]
    },
    {
      id: 'academic-recommendations',
      title: 'Academic Recommendations',
      description: 'Letters of recommendation from professors, academic advisors, or educational institutions.',
      icon: <Award className="h-6 w-6" />,
      required: true,
      maxFiles: 3,
      acceptedTypes: ['.pdf', '.doc', '.docx'],
      files: [],
      guidelines: [
        'Obtain letters from professors who know your academic work well',
        'Include at least 2 academic references',
        'Letters should be on official letterhead when possible',
        'Ensure letters are recent (within the last 2 years)',
        'Each letter should be signed and dated'
      ]
    },
    {
      id: 'professional-recommendations',
      title: 'Professional Recommendations',
      description: 'Letters of recommendation from employers, supervisors, or professional colleagues.',
      icon: <FileText className="h-6 w-6" />,
      required: false,
      maxFiles: 2,
      acceptedTypes: ['.pdf', '.doc', '.docx'],
      files: [],
      guidelines: [
        'Include letters from direct supervisors or managers',
        'Focus on work performance and professional skills',
        'Letters should highlight relevant experience to your field of study',
        'Include contact information of the recommender',
        'Professional letterhead preferred'
      ]
    },
    {
      id: 'academic-certificates',
      title: 'Academic Certificates & Diplomas',
      description: 'Official certificates, diplomas, and degree documents from educational institutions.',
      icon: <Award className="h-6 w-6" />,
      required: true,
      maxFiles: 5,
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      files: [],
      guidelines: [
        'Include all relevant academic qualifications',
        'Documents must be official or certified copies',
        'Include degree certificates, diplomas, and completion certificates',
        'Ensure documents are clear and legible',
        'Translate non-English documents with certified translations'
      ]
    },
    {
      id: 'transcripts',
      title: 'Academic Transcripts',
      description: 'Official transcripts showing grades, courses, and academic performance.',
      icon: <FileText className="h-6 w-6" />,
      required: true,
      maxFiles: 3,
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      files: [],
      guidelines: [
        'Submit official transcripts from all attended institutions',
        'Include course names, grades, and credit hours',
        'Transcripts should be sealed or officially stamped',
        'Calculate and include GPA if not shown',
        'Provide certified translations for non-English transcripts'
      ]
    },
    {
      id: 'proof-of-funds',
      title: 'Proof of Financial Support',
      description: 'Documentation proving your ability to finance your education and living expenses.',
      icon: <DollarSign className="h-6 w-6" />,
      required: true,
      maxFiles: 3,
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      files: [],
      guidelines: [
        'Bank statements from the last 3-6 months',
        'Scholarship award letters or financial aid documents',
        'Sponsor affidavit of support with financial documentation',
        'Investment statements or property valuations',
        'All documents should be recent and show sufficient funds'
      ]
    }
  ]);

  const handleFileUpload = async (sectionId: string, files: FileList) => {
    const section = documentSections.find(s => s.id === sectionId);
    if (!section) return;

    const validFiles = Array.from(files).filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return section.acceptedTypes.includes(extension) && file.size <= 5 * 1024 * 1024; // 5MB limit
    });

    if (validFiles.length === 0) {
      alert('Please select valid files according to the guidelines.');
      return;
    }

    // Check if adding these files would exceed the limit
    if (section.files.length + validFiles.length > section.maxFiles) {
      alert(`You can only upload up to ${section.maxFiles} file(s) for this section.`);
      return;
    }

    // Simulate file upload with progress
    for (const file of validFiles) {
      const fileId = `${sectionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Add file to the section immediately with 'processing' status
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        status: 'processing',
        url: URL.createObjectURL(file)
      };

      setDocumentSections(prev => 
        prev.map(s => 
          s.id === sectionId 
            ? { ...s, files: [...s.files, newFile] }
            : s
        )
      );

      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }

      // Mark as uploaded
      setDocumentSections(prev => 
        prev.map(s => 
          s.id === sectionId 
            ? {
                ...s, 
                files: s.files.map(f => 
                  f.id === fileId 
                    ? { ...f, status: 'uploaded' }
                    : f
                )
              }
            : s
        )
      );

      setUploadProgress(prev => {
        const { [fileId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const removeFile = (sectionId: string, fileId: string) => {
    setDocumentSections(prev => 
      prev.map(s => 
        s.id === sectionId 
          ? { ...s, files: s.files.filter(f => f.id !== fileId) }
          : s
      )
    );
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploaded':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploaded':
        return 'Uploaded';
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      case 'processing':
        return 'Processing';
      default:
        return '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompletionPercentage = () => {
    const requiredSections = documentSections.filter(s => s.required);
    const completedSections = requiredSections.filter(s => s.files.length > 0);
    return Math.round((completedSections.length / requiredSections.length) * 100);
  };

  const getTotalFiles = () => {
    return documentSections.reduce((total, section) => total + section.files.length, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Profile Documentation
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload and manage your academic and professional documents for university applications.
            </p>
            
            {/* Progress Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Documentation Progress
                </h3>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {getCompletionPercentage()}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getCompletionPercentage()}%` }}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400">Total Files</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{getTotalFiles()}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400">Required Sections</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {documentSections.filter(s => s.required && s.files.length > 0).length} / {documentSections.filter(s => s.required).length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                    {getCompletionPercentage() === 100 ? 'Complete' : 'In Progress'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Document Sections
                </h3>
                <nav className="space-y-2">
                  {documentSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="mr-3 text-gray-500">
                          {section.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{section.title}</p>
                          {section.required && (
                            <p className="text-xs text-red-500">Required</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {section.files.length > 0 && (
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full mr-2">
                            {section.files.length}
                          </span>
                        )}
                        {section.required && section.files.length > 0 && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {documentSections.map((section) => (
                <div
                  key={section.id}
                  className={`${activeSection === section.id ? 'block' : 'hidden'}`}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-3 text-blue-600 dark:text-blue-400">
                            {section.icon}
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {section.title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {section.description}
                            </p>
                          </div>
                        </div>
                        {section.required && (
                          <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                    </CardHeader>

                    <CardBody className="space-y-6">
                      {/* Guidelines */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                          Upload Guidelines
                        </h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          {section.guidelines.map((guideline, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{guideline}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Upload Area */}
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                        <input
                          ref={(el) => fileInputRefs.current[section.id] = el}
                          type="file"
                          multiple={section.maxFiles > 1}
                          accept={section.acceptedTypes.join(',')}
                          onChange={(e) => e.target.files && handleFileUpload(section.id, e.target.files)}
                          className="hidden"
                        />
                        
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Upload {section.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Drag and drop files here, or click to browse
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Maximum {section.maxFiles} file(s) • {section.acceptedTypes.join(', ')} • Max 5MB each
                        </p>
                        
                        <Button
                          onClick={() => fileInputRefs.current[section.id]?.click()}
                          leftIcon={<Plus size={16} />}
                          disabled={section.files.length >= section.maxFiles}
                        >
                          {section.files.length >= section.maxFiles 
                            ? 'Maximum files reached' 
                            : 'Choose Files'
                          }
                        </Button>
                      </div>

                      {/* Uploaded Files */}
                      {section.files.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                            Uploaded Files ({section.files.length}/{section.maxFiles})
                          </h4>
                          <div className="space-y-3">
                            {section.files.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              >
                                <div className="flex items-center flex-1">
                                  <FileText className="h-8 w-8 text-blue-500 mr-3" />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {file.name}
                                    </p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                      <span>{formatFileSize(file.size)}</span>
                                      <span>•</span>
                                      <span>{file.uploadDate.toLocaleDateString()}</span>
                                      <span>•</span>
                                      <div className="flex items-center">
                                        {getStatusIcon(file.status)}
                                        <span className="ml-1">{getStatusText(file.status)}</span>
                                      </div>
                                    </div>
                                    
                                    {/* Upload Progress */}
                                    {uploadProgress[file.id] !== undefined && (
                                      <div className="mt-2">
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                          <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress[file.id]}%` }}
                                          />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          Uploading... {uploadProgress[file.id]}%
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 ml-4">
                                  {file.url && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(file.url, '_blank')}
                                      leftIcon={<Eye size={14} />}
                                    >
                                      Preview
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(section.id, file.id)}
                                    leftIcon={<Trash2 size={14} />}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between">
            <Button variant="outline">
              Save as Draft
            </Button>
            <div className="space-x-4">
              <Button variant="outline">
                Preview Application
              </Button>
              <Button 
                variant="primary"
                disabled={getCompletionPercentage() < 100}
              >
                Submit Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfileDocumentationPage;