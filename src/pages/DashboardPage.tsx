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
  BarChart3,
  Brain,
  Zap,
  Target,
  Heart,
  Star
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProfileInsights from '../components/profile/ProfileInsights';
import UniversityRecommendations from '../components/matching/UniversityRecommendations';
import FavoritesManager from '../components/applications/FavoritesManager';
import ApplicationTracker from '../components/applications/ApplicationTracker';
import DocumentManager from '../components/dashboard/DocumentManager';
import { useAuth } from '../context/AuthContext';
import { documentParsingService } from '../services/documentParsingService';
import { applicationService } from '../services/applicationService';

interface ProfileCompletion {
  personalInfo: boolean;
  academicBackground: boolean;
  documents: boolean;
  preferences: boolean;
  overall: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'applications' | 'profile' | 'insights' | 'recommendations' | 'favorites'>('overview');

  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion>({
    personalInfo: true,
    academicBackground: true,
    documents: true,
    preferences: true,
    overall: 95
  });

  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [parsedDocuments, setParsedDocuments] = useState<any[]>([]);
  const [applicationStats, setApplicationStats] = useState<any>(null);
  const [favoriteStats, setFavoriteStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadStudentData();
      loadApplicationStats();
      loadFavoriteStats();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      // Load student profile and parsed documents
      const [profile, parsed] = await Promise.all([
        documentParsingService.getStudentProfile(user!.id),
        documentParsingService.getParsedDocuments(user!.id)
      ]);

      setStudentProfile(profile);
      setParsedDocuments(parsed);

      // Update profile completion based on actual data
      if (profile) {
        setProfileCompletion(prev => ({
          ...prev,
          overall: profile.profile_completion || 0
        }));
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  };

  const loadApplicationStats = async () => {
    try {
      const stats = await applicationService.getApplicationStats(user!.id);
      setApplicationStats(stats);
    } catch (error) {
      console.error('Error loading application stats:', error);
    }
  };

  const loadFavoriteStats = async () => {
    try {
      const favorites = await applicationService.getFavorites(user!.id);
      setFavoriteStats({
        total: favorites.length,
        countries: [...new Set(favorites.map(f => f.university_country))].length
      });
    } catch (error) {
      console.error('Error loading favorite stats:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                  Track your applications and manage your documents with AI-powered insights
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
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-800">
            <CardBody className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Profile Status: {profileCompletion.overall >= 90 ? 'Excellent' : profileCompletion.overall >= 70 ? 'Good' : 'Needs Improvement'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {profileCompletion.overall}% complete - {profileCompletion.overall >= 90 ? 'Your profile is ready for applications!' : 'Complete missing sections to improve matching accuracy'}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-green-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${profileCompletion.overall}%` }}
                    />
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6">
                  <Button
                    onClick={() => setActiveTab('profile')}
                    leftIcon={<User size={16} />}
                  >
                    {profileCompletion.overall >= 90 ? 'View Profile' : 'Complete Profile'}
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
                  { id: 'recommendations', label: 'AI Matches', icon: Target },
                  { id: 'applications', label: 'Applications', icon: GraduationCap },
                  { id: 'favorites', label: 'Favorites', icon: Heart },
                  { id: 'insights', label: 'AI Insights', icon: Brain },
                  { id: 'documents', label: 'Documents', icon: FileText },
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
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {applicationStats?.total || 0}
                        </p>
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
                          {applicationStats ? (applicationStats.byStatus.submitted || 0) + (applicationStats.byStatus['under-review'] || 0) : 0}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                        <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favorites</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {favoriteStats?.total || 0}
                        </p>
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
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applications</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('applications')}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody className="p-0">
                    {applicationStats?.recentActivity?.length > 0 ? (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {applicationStats.recentActivity.slice(0, 3).map((application: any) => (
                          <div key={application.id} className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {application.university_name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {application.program_name}
                                </p>
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${applicationService.getStatusColor(application.status)}`}>
                                {applicationService.getStatusText(application.status)}
                              </span>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Progress</span>
                                <span>{application.progress_percentage}%</span>
                              </div>
                              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${application.progress_percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No applications yet</p>
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => window.location.href = '/universities'}
                        >
                          Start First Application
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Upcoming Deadlines */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('applications')}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody className="p-0">
                    {applicationStats?.upcomingDeadlines?.length > 0 ? (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {applicationStats.upcomingDeadlines.slice(0, 3).map((application: any) => {
                          const deadlineStatus = applicationService.getDeadlineStatus(application.deadline);
                          return (
                            <div key={application.id} className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {application.university_name}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {application.program_name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-medium ${deadlineStatus.color}`}>
                                    {deadlineStatus.text}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(new Date(application.deadline))}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No upcoming deadlines</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card hoverable={true}>
                  <CardBody className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Get AI Recommendations
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Discover universities that match your profile and preferences.
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => setActiveTab('recommendations')}
                    >
                      View Matches
                    </Button>
                  </CardBody>
                </Card>

                <Card hoverable={true}>
                  <CardBody className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Start New Application
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Browse universities and start your application process.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = '/universities'}
                    >
                      Explore Universities
                    </Button>
                  </CardBody>
                </Card>

                <Card hoverable={true}>
                  <CardBody className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Upload Documents
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Upload and manage your academic documents with AI analysis.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab('documents')}
                    >
                      Manage Documents
                    </Button>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <UniversityRecommendations />
          )}

          {activeTab === 'applications' && (
            <ApplicationTracker />
          )}

          {activeTab === 'favorites' && (
            <FavoritesManager />
          )}

          {activeTab === 'insights' && (
            <ProfileInsights />
          )}

          {activeTab === 'documents' && (
            <DocumentManager />
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => section.key === 'documents' ? setActiveTab('documents') : null}
                        >
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
                      Upload your academic transcripts, CV, and other required documents for AI analysis.
                    </p>
                    <Button 
                      className="w-full" 
                      leftIcon={<Upload size={16} />}
                      onClick={() => setActiveTab('documents')}
                    >
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
                      Browse and discover universities that match your AI-analyzed profile and preferences.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      leftIcon={<GraduationCap size={16} />}
                      onClick={() => window.location.href = '/universities'}
                    >
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