import { supabase } from '../lib/supabase';

export interface AdminStats {
  totalStudents: number;
  totalApplications: number;
  totalUniversities: number;
  pendingReviews: number;
  recentActivity: Array<{
    id: string;
    title: string;
    time: string;
    icon: any;
  }>;
  topUniversities: Array<{
    id: string;
    name: string;
    country: string;
    applications: number;
  }>;
  applicationTrends: Array<{
    date: string;
    applications: number;
    acceptances: number;
  }>;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  aiScore: number;
  applicationCount: number;
  acceptedCount: number;
  status: string;
  profileData: any;
  documents: any[];
  applications: any[];
}

export interface UniversityData {
  id: string;
  name: string;
  country: string;
  applicationCount: number;
  acceptanceRate: string;
  programs: string[];
  requirements: any;
  fees: any;
}

class AdminService {
  private static instance: AdminService;

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  // Dashboard Statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      // In a real implementation, these would be actual database queries
      // For now, we'll return mock data that represents what the queries would return

      const mockStats: AdminStats = {
        totalStudents: 15420,
        totalApplications: 8750,
        totalUniversities: 1250,
        pendingReviews: 342,
        recentActivity: [
          {
            id: '1',
            title: 'New student registration: Sarah Johnson',
            time: '2 minutes ago',
            icon: 'UserPlus'
          },
          {
            id: '2',
            title: 'Application submitted to MIT',
            time: '15 minutes ago',
            icon: 'FileText'
          },
          {
            id: '3',
            title: 'University partnership added: Oxford',
            time: '1 hour ago',
            icon: 'GraduationCap'
          },
          {
            id: '4',
            title: 'AI match override: Stanford application',
            time: '2 hours ago',
            icon: 'Brain'
          },
          {
            id: '5',
            title: 'Bulk message sent to 150 students',
            time: '3 hours ago',
            icon: 'MessageSquare'
          }
        ],
        topUniversities: [
          { id: '1', name: 'Harvard University', country: 'United States', applications: 1250 },
          { id: '2', name: 'Stanford University', country: 'United States', applications: 1180 },
          { id: '3', name: 'MIT', country: 'United States', applications: 1050 },
          { id: '4', name: 'University of Oxford', country: 'United Kingdom', applications: 980 },
          { id: '5', name: 'University of Cambridge', country: 'United Kingdom', applications: 920 }
        ],
        applicationTrends: [
          { date: '2024-01-01', applications: 120, acceptances: 45 },
          { date: '2024-01-02', applications: 135, acceptances: 52 },
          { date: '2024-01-03', applications: 98, acceptances: 38 },
          { date: '2024-01-04', applications: 156, acceptances: 61 },
          { date: '2024-01-05', applications: 142, acceptances: 55 }
        ]
      };

      return mockStats;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw new Error('Failed to fetch admin statistics');
    }
  }

  // Student Management
  async getStudents(filters?: any): Promise<StudentProfile[]> {
    try {
      // Mock student data - in real implementation, this would query the database
      const mockStudents: StudentProfile[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          aiScore: 92,
          applicationCount: 5,
          acceptedCount: 3,
          status: 'Active',
          profileData: {
            gpa: 3.8,
            testScores: { sat: 1450, ielts: 7.5 },
            major: 'Computer Science',
            experience: '2 years'
          },
          documents: [],
          applications: []
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael.chen@email.com',
          aiScore: 88,
          applicationCount: 7,
          acceptedCount: 4,
          status: 'Active',
          profileData: {
            gpa: 3.9,
            testScores: { gre: 325, toefl: 108 },
            major: 'Data Science',
            experience: '3 years'
          },
          documents: [],
          applications: []
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@email.com',
          aiScore: 85,
          applicationCount: 4,
          acceptedCount: 2,
          status: 'Active',
          profileData: {
            gpa: 3.7,
            testScores: { sat: 1380, ielts: 7.0 },
            major: 'Business Administration',
            experience: '1 year'
          },
          documents: [],
          applications: []
        },
        {
          id: '4',
          name: 'David Kim',
          email: 'david.kim@email.com',
          aiScore: 78,
          applicationCount: 6,
          acceptedCount: 1,
          status: 'Under Review',
          profileData: {
            gpa: 3.5,
            testScores: { gmat: 680, toefl: 95 },
            major: 'Engineering',
            experience: '2 years'
          },
          documents: [],
          applications: []
        },
        {
          id: '5',
          name: 'Aisha Patel',
          email: 'aisha.patel@email.com',
          aiScore: 94,
          applicationCount: 8,
          acceptedCount: 6,
          status: 'Active',
          profileData: {
            gpa: 4.0,
            testScores: { gre: 335, ielts: 8.5 },
            major: 'Medicine',
            experience: '4 years'
          },
          documents: [],
          applications: []
        }
      ];

      return mockStudents;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw new Error('Failed to fetch students');
    }
  }

  async getStudentDetails(studentId: string): Promise<StudentProfile | null> {
    try {
      const students = await this.getStudents();
      return students.find(s => s.id === studentId) || null;
    } catch (error) {
      console.error('Error fetching student details:', error);
      throw new Error('Failed to fetch student details');
    }
  }

  // Application Management
  async getApplications(filters?: any): Promise<any[]> {
    try {
      const mockApplications = [
        {
          id: '1',
          student_id: '1',
          student_name: 'Sarah Johnson',
          university_id: 'harvard',
          university_name: 'Harvard University',
          program_name: 'Computer Science',
          status: 'under-review',
          aiMatchScore: 92,
          aiRecommendation: 'approve',
          submittedAt: '2024-01-15T10:00:00Z',
          deadline: '2024-03-15T23:59:59Z',
          student: { id: '1', name: 'Sarah Johnson', email: 'sarah.johnson@email.com' }
        },
        {
          id: '2',
          student_id: '2',
          student_name: 'Michael Chen',
          university_id: 'mit',
          university_name: 'MIT',
          program_name: 'Data Science',
          status: 'pending',
          aiMatchScore: 88,
          aiRecommendation: 'approve',
          submittedAt: '2024-01-20T14:30:00Z',
          deadline: '2024-02-28T23:59:59Z',
          student: { id: '2', name: 'Michael Chen', email: 'michael.chen@email.com' }
        },
        {
          id: '3',
          student_id: '3',
          student_name: 'Emily Rodriguez',
          university_id: 'stanford',
          university_name: 'Stanford University',
          program_name: 'Business Administration',
          status: 'accepted',
          aiMatchScore: 85,
          aiRecommendation: 'approve',
          submittedAt: '2024-01-10T09:15:00Z',
          deadline: '2024-04-01T23:59:59Z',
          student: { id: '3', name: 'Emily Rodriguez', email: 'emily.rodriguez@email.com' }
        },
        {
          id: '4',
          student_id: '4',
          student_name: 'David Kim',
          university_id: 'oxford',
          university_name: 'University of Oxford',
          program_name: 'Engineering',
          status: 'rejected',
          aiMatchScore: 65,
          aiRecommendation: 'reject',
          submittedAt: '2024-01-25T16:45:00Z',
          deadline: '2024-03-30T23:59:59Z',
          student: { id: '4', name: 'David Kim', email: 'david.kim@email.com' }
        },
        {
          id: '5',
          student_id: '5',
          student_name: 'Aisha Patel',
          university_id: 'cambridge',
          university_name: 'University of Cambridge',
          program_name: 'Medicine',
          status: 'under-review',
          aiMatchScore: 96,
          aiRecommendation: 'approve',
          submittedAt: '2024-01-12T11:20:00Z',
          deadline: '2024-02-15T23:59:59Z',
          student: { id: '5', name: 'Aisha Patel', email: 'aisha.patel@email.com' }
        }
      ];

      return mockApplications;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw new Error('Failed to fetch applications');
    }
  }

  async updateApplicationStatus(applicationId: string, status: string): Promise<void> {
    try {
      // In real implementation, this would update the database
      console.log(`Updating application ${applicationId} status to ${status}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error updating application status:', error);
      throw new Error('Failed to update application status');
    }
  }

  // University Management
  async getUniversities(filters?: any): Promise<UniversityData[]> {
    try {
      const mockUniversities: UniversityData[] = [
        {
          id: 'harvard',
          name: 'Harvard University',
          country: 'United States',
          applicationCount: 1250,
          acceptanceRate: '5%',
          programs: ['Computer Science', 'Business', 'Medicine', 'Law'],
          requirements: { gpa: 3.8, testScore: 'SAT 1500+' },
          fees: { tuition: '$50,000', total: '$75,000' }
        },
        {
          id: 'mit',
          name: 'MIT',
          country: 'United States',
          applicationCount: 1050,
          acceptanceRate: '7%',
          programs: ['Engineering', 'Computer Science', 'Physics', 'Mathematics'],
          requirements: { gpa: 3.9, testScore: 'SAT 1550+' },
          fees: { tuition: '$53,000', total: '$78,000' }
        },
        {
          id: 'stanford',
          name: 'Stanford University',
          country: 'United States',
          applicationCount: 1180,
          acceptanceRate: '4%',
          programs: ['Computer Science', 'Business', 'Engineering', 'Medicine'],
          requirements: { gpa: 3.8, testScore: 'SAT 1520+' },
          fees: { tuition: '$52,000', total: '$77,000' }
        },
        {
          id: 'oxford',
          name: 'University of Oxford',
          country: 'United Kingdom',
          applicationCount: 980,
          acceptanceRate: '18%',
          programs: ['Philosophy', 'Medicine', 'Law', 'Engineering'],
          requirements: { gpa: 3.7, testScore: 'A*A*A' },
          fees: { tuition: '£28,000', total: '£45,000' }
        },
        {
          id: 'cambridge',
          name: 'University of Cambridge',
          country: 'United Kingdom',
          applicationCount: 920,
          acceptanceRate: '21%',
          programs: ['Mathematics', 'Natural Sciences', 'Medicine', 'Engineering'],
          requirements: { gpa: 3.7, testScore: 'A*A*A' },
          fees: { tuition: '£28,000', total: '£45,000' }
        }
      ];

      return mockUniversities;
    } catch (error) {
      console.error('Error fetching universities:', error);
      throw new Error('Failed to fetch universities');
    }
  }

  async createUniversity(universityData: Partial<UniversityData>): Promise<UniversityData> {
    try {
      // In real implementation, this would create in database
      const newUniversity: UniversityData = {
        id: Date.now().toString(),
        name: universityData.name || '',
        country: universityData.country || '',
        applicationCount: 0,
        acceptanceRate: universityData.acceptanceRate || '0%',
        programs: universityData.programs || [],
        requirements: universityData.requirements || {},
        fees: universityData.fees || {}
      };

      console.log('Creating university:', newUniversity);
      return newUniversity;
    } catch (error) {
      console.error('Error creating university:', error);
      throw new Error('Failed to create university');
    }
  }

  async updateUniversity(universityId: string, updates: Partial<UniversityData>): Promise<void> {
    try {
      // In real implementation, this would update the database
      console.log(`Updating university ${universityId}:`, updates);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error updating university:', error);
      throw new Error('Failed to update university');
    }
  }

  async deleteUniversity(universityId: string): Promise<void> {
    try {
      // In real implementation, this would delete from database
      console.log(`Deleting university ${universityId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error deleting university:', error);
      throw new Error('Failed to delete university');
    }
  }

  // AI Override Functions
  async overrideMatch(studentId: string, universityId: string, action: 'approve' | 'reject'): Promise<void> {
    try {
      // In real implementation, this would update the AI recommendation override
      console.log(`AI Override: ${action} match between student ${studentId} and university ${universityId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error overriding match:', error);
      throw new Error('Failed to override AI match');
    }
  }

  // Messaging
  async sendMessage(recipientId: string, message: string, subject?: string): Promise<void> {
    try {
      // In real implementation, this would send via email/notification system
      console.log(`Sending message to ${recipientId}:`, { subject, message });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  async sendBulkMessage(recipientIds: string[], message: string, subject?: string): Promise<void> {
    try {
      // In real implementation, this would send bulk messages
      console.log(`Sending bulk message to ${recipientIds.length} recipients:`, { subject, message });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error sending bulk message:', error);
      throw new Error('Failed to send bulk message');
    }
  }

  // Analytics
  async getAnalytics(dateRange?: { start: string; end: string }): Promise<any> {
    try {
      // Mock analytics data
      const mockAnalytics = {
        applicationTrends: [
          { date: '2024-01-01', applications: 120, acceptances: 45 },
          { date: '2024-01-02', applications: 135, acceptances: 52 },
          { date: '2024-01-03', applications: 98, acceptances: 38 },
          { date: '2024-01-04', applications: 156, acceptances: 61 },
          { date: '2024-01-05', applications: 142, acceptances: 55 }
        ],
        topCountries: [
          { country: 'United States', applications: 3500 },
          { country: 'United Kingdom', applications: 2800 },
          { country: 'Canada', applications: 1900 },
          { country: 'Australia', applications: 1200 },
          { country: 'Germany', applications: 800 }
        ],
        aiAccuracy: {
          overall: 87,
          byCategory: {
            'Computer Science': 92,
            'Business': 85,
            'Engineering': 89,
            'Medicine': 94,
            'Arts': 78
          }
        }
      };

      return mockAnalytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw new Error('Failed to fetch analytics');
    }
  }
}

export const adminService = AdminService.getInstance();