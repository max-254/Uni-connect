import React, { useState } from 'react';
import { 
  FileText, 
  Award, 
  User, 
  DollarSign, 
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Clock,
  Upload,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import DocumentUpload from './DocumentUpload';

interface DocumentCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  maxFiles: number;
  acceptedTypes: string[];
  maxFileSize: number;
  guidelines: string[];
  files: any[];
}

const DocumentManager: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('academic');
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);

  const documentCategories: DocumentCategory[] = [
    {
      id: 'academic',
      title: 'Academic Documents',
      description: 'Transcripts, diplomas, and academic certificates',
      icon: <Award className="h-6 w-6" />,
      required: true,
      maxFiles: 5,
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      guidelines: [
        'Upload official transcripts from all attended institutions',
        'Include degree certificates and diplomas',
        'Documents must be clear and legible',
        'Provide certified translations for non-English documents',
        'Ensure all pages are included for multi-page documents'
      ],
      files: []
    },
    {
      id: 'personal',
      title: 'Personal Documents',
      description: 'CV, personal statement, and identification',
      icon: <User className="h-6 w-6" />,
      required: true,
      maxFiles: 3,
      acceptedTypes: ['.pdf', '.doc', '.docx'],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      guidelines: [
        'Upload your most recent CV or resume',
        'Include a compelling personal statement',
        'Ensure documents are professionally formatted',
        'Highlight relevant experience and achievements',
        'Keep personal statement within word limits'
      ],
      files: []
    },
    {
      id: 'recommendations',
      title: 'Recommendation Letters',
      description: 'Letters from professors, employers, or mentors',
      icon: <FileText className="h-6 w-6" />,
      required: true,
      maxFiles: 3,
      acceptedTypes: ['.pdf', '.doc', '.docx'],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      guidelines: [
        'Obtain letters from professors or supervisors who know you well',
        'Include at least 2-3 recommendation letters',
        'Letters should be on official letterhead when possible',
        'Ensure letters are recent (within the last 2 years)',
        'Each letter should be signed and dated'
      ],
      files: []
    },
    {
      id: 'financial',
      title: 'Financial Documents',
      description: 'Bank statements and proof of financial support',
      icon: <DollarSign className="h-6 w-6" />,
      required: true,
      maxFiles: 5,
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      guidelines: [
        'Provide bank statements from the last 3-6 months',
        'Include scholarship award letters if applicable',
        'Submit sponsor affidavit of support with financial documentation',
        'All documents should show sufficient funds for tuition and living expenses',
        'Ensure all financial documents are recent and official'
      ],
      files: []
    },
    {
      id: 'language',
      title: 'Language Proficiency',
      description: 'IELTS, TOEFL, and other language test scores',
      icon: <BookOpen className="h-6 w-6" />,
      required: false,
      maxFiles: 3,
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      guidelines: [
        'Upload official test score reports',
        'Include IELTS, TOEFL, or other accepted language tests',
        'Ensure test scores meet university requirements',
        'Test scores should be recent (within 2 years)',
        'Include all pages of the score report'
      ],
      files: []
    }
  ];

  const [categories, setCategories] = useState(documentCategories);

  const getCompletionStatus = (category: DocumentCategory) => {
    if (category.files.length === 0) {
      return { status: 'empty', color: 'text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-700' };
    }
    
    const verifiedFiles = category.files.filter(f => f.status === 'verified').length;
    const totalFiles = category.files.length;
    
    if (verifiedFiles === totalFiles) {
      return { status: 'complete', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' };
    } else if (verifiedFiles > 0) {
      return { status: 'partial', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' };
    } else {
      return { status: 'pending', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20' };
    }
  };

  const getOverallProgress = () => {
    const requiredCategories = categories.filter(cat => cat.required);
    const completedCategories = requiredCategories.filter(cat => {
      const verifiedFiles = cat.files.filter(f => f.status === 'verified').length;
      return verifiedFiles > 0;
    });
    
    return Math.round((completedCategories.length / requiredCategories.length) * 100);
  };

  const handleFilesUploaded = (categoryId: string, files: any[]) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, files: [...cat.files, ...files] }
          : cat
      )
    );
  };

  const activeCategory_data = categories.find(cat => cat.id === activeCategory);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Document Upload Progress
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {getOverallProgress()}% of required documents completed
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getOverallProgress()}%` }}
                />
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getOverallProgress()}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Complete
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Category Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((category) => {
          const status = getCompletionStatus(category);
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                activeCategory === category.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${status.bgColor}`}>
                  <div className={status.color}>
                    {category.icon}
                  </div>
                </div>
                {category.required && (
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                    Required
                  </span>
                )}
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                {category.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {category.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {category.files.length}/{category.maxFiles} files
                </span>
                {status.status === 'complete' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {status.status === 'partial' && (
                  <Clock className="w-4 h-4 text-yellow-500" />
                )}
                {status.status === 'pending' && category.files.length > 0 && (
                  <AlertTriangle className="w-4 h-4 text-blue-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Category Content */}
      {activeCategory_data && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400">
                    {activeCategory_data.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {activeCategory_data.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {activeCategory_data.description}
                  </p>
                </div>
              </div>
              {activeCategory_data.required && (
                <span className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                  Required
                </span>
              )}
            </div>
          </CardHeader>
          <CardBody>
            {/* Guidelines */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                Upload Guidelines
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                {activeCategory_data.guidelines.map((guideline, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 mt-1">•</span>
                    <span>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Document Upload Component */}
            <DocumentUpload
              documentType={activeCategory_data.title}
              acceptedTypes={activeCategory_data.acceptedTypes}
              maxFiles={activeCategory_data.maxFiles}
              maxFileSize={activeCategory_data.maxFileSize}
              onFilesUploaded={(files) => handleFilesUploaded(activeCategory_data.id, files)}
              existingFiles={activeCategory_data.files}
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default DocumentManager;