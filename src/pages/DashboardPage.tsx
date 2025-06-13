import React, { useState, useEffect } from 'react';
import { 
  User, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  Download,
  Eye,
  Plus,
  BarChart3
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

interface Document {
  id: string;
  name: string;
  type: 'transcript' | 'cv' | 'statement' | 'recommendation' | 'certificate' | 'other';
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  uploadDate: Date;
  size: number;
  url?: string;
}

interface Application {
  id: string;
  universityName: string;
  program: string;
  status: 'draft' | 'submitted' | 'under-review' | 'accepted' | 'rejected';
  submissionDate?: Date;
  deadline: Date;
  progress: number;
}

interface ProfileCompletion {
  personalInfo: boolean;
  academicBackground: boolean;
  documents: boolean;
  preferences: boolean;
  overall: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'applications' | 'profile'>('overview');
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Academic_Transcript_2024.pdf',
      type: 'transcript',
      status: 'verified',
      uploadDate: new Date('2024-01-15'),
      size: 2048000,
      url: '#'
    },
    {
      id: '2',
      name: 'CV_John_Doe.pdf',
      type: 'cv',
      status: 'uploaded',
      uploadDate: new Date('2024-01-20'),
      size: 1024000,
      url: '#'
    },
    {
      id: '3',
      name: 'Personal_Statement.pdf',
      type: 'statement',
      status: 'pending',
      uploadDate: new Date('2024-01-22'),
      size: 512000,
      url: '#'
    }
  ]);

  const [applications, setApplications] = useState<Application[]>([
    {
      id: '1',
      universityName: 'University of Toronto',
      program: 'Computer Science',
      status: 'submitted',
      submissionDate: new Date('2024-01-10'),
      deadline: new Date('2024-03-15'),
      progress: 100
    },
    {
      id: '2',
      universityName: 'MIT',
      program: 'Artificial Intelligence',
      status: 'under-review',
      submissionDate: new Date('2024-01-15'),
      deadline: new Date('2024-02-28'),
      progress: 100
    },
    {
      id: '3',
      universityName: 'Stanford University',
      program: 'Data Science',
      status: 'draft',
      deadline: new Date('2024-04-01'),
      progress: 65
    }
  ]);

  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion>({
    personalInfo: true,
    academicBackground: true,
    documents: false,
    preferences: true,
    overall: 75
  });

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'uploaded':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Upload className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'submitted':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'under-review':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.name || 'Student'}!
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Track your applications and manage your documents
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Bell size={16} />}
                  className="relative"
                >
                  Notifications
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Settings size={16} />}
                >
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Completion Banner */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardBody className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Complete Your Profile
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {profileCompletion.overall}% complete - Add missing information to improve your application success rate
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${profileCompletion.overall}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!profileCompletion.documents && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">
                        Upload Documents
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6">
                  <Button
                    onClick={() => setActiveTab('profile')}
                    leftIcon={<User size={16} />}
                  >
                    Complete Profile
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'documents', label: 'Documents', icon: FileText },
                  { id: 'applications', label: 'Applications', icon: GraduationCap },
                  { id: 'profile', label: 'Profile', icon: User }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardBody className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{applications.length}</p>
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
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {applications.filter(app => app.status === 'submitted' || app.status === 'under-review').length}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Documents</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{profileCompletion.overall}%</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Recent Activity & Upcoming Deadlines */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Applications */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applications</h3>
                  </CardHeader>
                  <CardBody className="p-0">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {applications.slice(0, 3).map((application) => (
                        <div key={application.id} className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {application.universityName}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {application.program}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {application.status.replace('-', ' ')}
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                              <span>Progress</span>
                              <span>{application.progress}%</span>
                            </div>
                            <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${application.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* Upcoming Deadlines */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
                  </CardHeader>
                  <CardBody className="p-0">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {applications
                        .filter(app => app.status === 'draft' || app.status === 'submitted')
                        .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
                        .slice(0, 3)
                        .map((application) => {
                          const daysLeft = getDaysUntilDeadline(application.deadline);
                          return (
                            <div key={application.id} className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {application.universityName}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {application.program}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-medium ${
                                    daysLeft <= 7 ? 'text-red-600 dark:text-red-400' : 
                                    daysLeft <= 30 ? 'text-yellow-600 dark:text-yellow-400' : 
                                    'text-green-600 dark:text-green-400'
                                  }`}>
                                    {daysLeft} days left
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(application.deadline)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Document Upload Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Document Management</h3>
                    <Button
                      leftIcon={<Plus size={16} />}
                      onClick={() => window.location.href = '/profile/documents'}
                    >
                      Upload Documents
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { type: 'transcript', label: 'Academic Transcripts', required: true },
                      { type: 'cv', label: 'CV/Resume', required: true },
                      { type: 'statement', label: 'Personal Statement', required: true },
                      { type: 'recommendation', label: 'Recommendation Letters', required: false },
                      { type: 'certificate', label: 'Certificates', required: false },
                      { type: 'other', label: 'Other Documents', required: false }
                    ].map((docType) => {
                      const typeDocuments = documents.filter(doc => doc.type === docType.type);
                      const hasVerified = typeDocuments.some(doc => doc.status === 'verified');
                      
                      return (
                        <div key={docType.type} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">{docType.label}</h4>
                            {docType.required && (
                              <span className="text-xs text-red-600 dark:text-red-400">Required</span>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            {typeDocuments.length > 0 ? (
                              typeDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                  <div className="flex items-center space-x-2">
                                    {getStatusIcon(doc.status)}
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                      {doc.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Button variant="ghost" size="sm" leftIcon={<Eye size={12} />}>
                                      View
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded</p>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3"
                            leftIcon={<Upload size={14} />}
                          >
                            Upload {docType.label}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>

              {/* Recent Documents */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Documents</h3>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Document
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Upload Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {documents.map((document) => (
                          <tr key={document.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {document.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                {document.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(document.status)}
                                <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                                  {document.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(document.uploadDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatFileSize(document.size)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" leftIcon={<Eye size={14} />}>
                                  View
                                </Button>
                                <Button variant="ghost" size="sm" leftIcon={<Download size={14} />}>
                                  Download
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              {/* Applications Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardBody className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Applications</h3>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{applications.length}</p>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Submitted</h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {applications.filter(app => app.status === 'submitted' || app.status === 'under-review').length}
                    </p>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="p-6 text-center">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">In Progress</h3>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {applications.filter(app => app.status === 'draft').length}
                    </p>
                  </CardBody>
                </Card>
              </div>

              {/* Applications List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Applications</h3>
                    <Button leftIcon={<Plus size={16} />}>
                      New Application
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="space-y-4 p-6">
                    {applications.map((application) => (
                      <div key={application.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                {application.universityName}
                              </h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                {application.status.replace('-', ' ')}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-3">{application.program}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Deadline</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {formatDate(application.deadline)}
                                </p>
                              </div>
                              {application.submissionDate && (
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">Submitted</p>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {formatDate(application.submissionDate)}
                                  </p>
                                </div>
                              )}
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Progress</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {application.progress}%
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {application.status === 'draft' && (
                              <Button size="sm">
                                Continue Application
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span>Application Progress</span>
                            <span>{application.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${application.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Completion</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-6">
                    {[
                      { key: 'personalInfo', label: 'Personal Information', completed: profileCompletion.personalInfo },
                      { key: 'academicBackground', label: 'Academic Background', completed: profileCompletion.academicBackground },
                      { key: 'documents', label: 'Document Upload', completed: profileCompletion.documents },
                      { key: 'preferences', label: 'Study Preferences', completed: profileCompletion.preferences }
                    ].map((section) => (
                      <div key={section.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {section.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                          )}
                          <span className="font-medium text-gray-900 dark:text-white">{section.label}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          {section.completed ? 'Edit' : 'Complete'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardBody className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Upload Documents</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Upload your academic transcripts, CV, and other required documents.
                    </p>
                    <Button className="w-full" leftIcon={<Upload size={16} />}>
                      Go to Documents
                    </Button>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Explore Universities</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Browse and discover universities that match your preferences.
                    </p>
                    <Button variant="outline" className="w-full" leftIcon={<GraduationCap size={16} />}>
                      Browse Universities
                    </Button>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;