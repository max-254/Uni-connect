import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BarChart3, 
  Settings, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Brain, 
  Target, 
  Award, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Download, 
  Upload, 
  MoreHorizontal,
  Shield,
  Database,
  Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { adminService } from '../services/adminService';
import StudentProfileModal from '../components/admin/StudentProfileModal';
import UniversityManagementModal from '../components/admin/UniversityManagementModal';
import MessageModal from '../components/admin/MessageModal';
import { useAuth } from '../context/AuthContext';

interface AdminStats {
  totalStudents: number;
  totalApplications: number;
  totalUniversities: number;
  pendingReviews: number;
  recentActivity: any[];
  topUniversities: any[];
  applicationTrends: any[];
}

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'applications' | 'universities' | 'analytics'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showUniversityModal, setShowUniversityModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<any>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, studentsData, applicationsData, universitiesData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getStudents(),
        adminService.getApplications(),
        adminService.getUniversities()
      ]);

      setStats(statsData);
      setStudents(studentsData);
      setApplications(applicationsData);
      setUniversities(universitiesData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleEditUniversity = (university: any) => {
    setSelectedUniversity(university);
    setShowUniversityModal(true);
  };

  const handleSendMessage = (recipient: any) => {
    setMessageRecipient(recipient);
    setShowMessageModal(true);
  };

  const handleOverrideMatch = async (studentId: string, universityId: string, action: 'approve' | 'reject') => {
    try {
      await adminService.overrideMatch(studentId, universityId, action);
      // Refresh data
      loadAdminData();
    } catch (error) {
      console.error('Error overriding match:', error);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      await adminService.updateApplicationStatus(applicationId, status);
      // Refresh data
      loadAdminData();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 50) return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'rejected':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'pending':
      case 'under-review':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'submitted':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchQuery || 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchQuery || 
      app.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.university_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = !searchQuery || 
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage students, applications, and university partnerships
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  leftIcon={<Download size={16} />}
                >
                  Export Data
                </Button>
                <Button
                  leftIcon={<Plus size={16} />}
                >
                  Add University
                </Button>
              </div>
            </div>
          </div>

          {/* Admin Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStudents.toLocaleString()}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplications.toLocaleString()}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Universities</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUniversities.toLocaleString()}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Reviews</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingReviews}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'students', label: 'Students', icon: Users },
                  { id: 'applications', label: 'Applications', icon: FileText },
                  { id: 'universities', label: 'Universities', icon: GraduationCap },
                  { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                  </CardHeader>
                  <CardBody className="p-0">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {stats?.recentActivity.map((activity, index) => (
                        <div key={index} className="p-4 flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <activity.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Universities</h3>
                  </CardHeader>
                  <CardBody className="p-0">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {stats?.topUniversities.map((uni, index) => (
                        <div key={index} className="p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{uni.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{uni.country}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">{uni.applications}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">applications</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card hoverable={true}>
                  <CardBody className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Review Applications
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Review pending applications and update their status.
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => setActiveTab('applications')}
                    >
                      Review Now
                    </Button>
                  </CardBody>
                </Card>

                <Card hoverable={true}>
                  <CardBody className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Manage Universities
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Add, edit, or remove university partnerships.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab('universities')}
                    >
                      Manage
                    </Button>
                  </CardBody>
                </Card>

                <Card hoverable={true}>
                  <CardBody className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      AI Insights
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      View AI-powered analytics and insights.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab('analytics')}
                    >
                      View Analytics
                    </Button>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardBody className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      leftIcon={<Filter size={16} />}
                    >
                      Filters
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Students List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Students ({filteredStudents.length})
                    </h3>
                    <Button
                      variant="outline"
                      leftIcon={<Download size={16} />}
                    >
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            AI Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Applications
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {student.name.charAt(0)}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {student.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {student.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Brain className="w-4 h-4 text-purple-500 mr-2" />
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAIScoreColor(student.aiScore)}`}>
                                  {student.aiScore}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {student.applicationCount} applications
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {student.acceptedCount} accepted
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewStudent(student)}
                                  leftIcon={<Eye size={14} />}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSendMessage(student)}
                                  leftIcon={<MessageSquare size={14} />}
                                >
                                  Message
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
              {/* Search and Filters */}
              <Card>
                <CardBody className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="text"
                        placeholder="Search applications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="under-review">Under Review</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </CardBody>
              </Card>

              {/* Applications List */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Applications ({filteredApplications.length})
                  </h3>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="space-y-4 p-6">
                    {filteredApplications.map((application) => (
                      <div key={application.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                {application.student_name}
                              </h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                {application.status}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                              {application.university_name} - {application.program_name}
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">AI Match Score</p>
                                <div className="flex items-center">
                                  <Brain className="w-4 h-4 text-purple-500 mr-1" />
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {application.aiMatchScore}%
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Submitted</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {new Date(application.submittedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Deadline</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {new Date(application.deadline).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewStudent(application.student)}
                            >
                              View Student
                            </Button>
                            <select
                              value={application.status}
                              onChange={(e) => handleUpdateApplicationStatus(application.id, e.target.value)}
                              className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                            >
                              <option value="pending">Pending</option>
                              <option value="under-review">Under Review</option>
                              <option value="accepted">Accept</option>
                              <option value="rejected">Reject</option>
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendMessage(application.student)}
                              leftIcon={<MessageSquare size={14} />}
                            >
                              Message
                            </Button>
                          </div>
                        </div>
                        
                        {/* AI Override Actions */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Target className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">AI Recommendation:</span>
                              <span className={`text-sm font-medium ${application.aiRecommendation === 'approve' ? 'text-green-600' : 'text-red-600'}`}>
                                {application.aiRecommendation === 'approve' ? 'Approve' : 'Reject'}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOverrideMatch(application.student_id, application.university_id, 'approve')}
                                className="text-green-600 hover:text-green-700"
                              >
                                Override: Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOverrideMatch(application.student_id, application.university_id, 'reject')}
                                className="text-red-600 hover:text-red-700"
                              >
                                Override: Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'universities' && (
            <div className="space-y-6">
              {/* Search and Actions */}
              <Card>
                <CardBody className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="text"
                        placeholder="Search universities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        leftIcon={<Upload size={16} />}
                      >
                        Import
                      </Button>
                      <Button
                        onClick={() => setShowUniversityModal(true)}
                        leftIcon={<Plus size={16} />}
                      >
                        Add University
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Universities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUniversities.map((university) => (
                  <Card key={university.id} hoverable={true}>
                    <CardBody className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {university.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <MapPin size={14} className="mr-1" />
                            <span>{university.country}</span>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Applications</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{university.applicationCount}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Acceptance Rate</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{university.acceptanceRate}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditUniversity(university)}
                          leftIcon={<Edit size={14} />}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye size={14} />}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 size={14} />}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h3>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Analytics Coming Soon
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Advanced analytics and reporting features will be available here.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <StudentProfileModal
        student={selectedStudent}
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
      />

      <UniversityManagementModal
        university={selectedUniversity}
        isOpen={showUniversityModal}
        onClose={() => setShowUniversityModal(false)}
        onSave={loadAdminData}
      />

      <MessageModal
        recipient={messageRecipient}
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
      />

      <Footer />
    </div>
  );
};

export default AdminDashboardPage;