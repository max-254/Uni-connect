import { supabase } from '../lib/supabase';

// Update the AdminService class with new methods for application management
class AdminService {
  private static instance: AdminService;

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  // Application Management
  async getApplications(filters?: any): Promise<any[]> {
    try {
      // In a real implementation, this would query the database with filters
      // For demo purposes, we'll return mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return [
        {
          id: 'APP-2024-001',
          studentId: 'STU-001',
          studentName: 'Sarah Johnson',
          studentEmail: 'sarah.johnson@example.com',
          universityId: 'UNI-001',
          universityName: 'Harvard University',
          programName: 'Master of Computer Science',
          country: 'United States',
          status: 'under-review',
          submittedAt: '2024-06-15T10:30:00Z',
          updatedAt: '2024-06-18T14:45:00Z',
          deadline: '2024-07-30T23:59:59Z',
          completionPercentage: 85,
          priority: 'high',
          assignedTo: 'Admin User',
          lastCommunication: '2024-06-18T14:45:00Z',
          tags: ['Scholarship', 'International']
        },
        {
          id: 'APP-2024-002',
          studentId: 'STU-002',
          studentName: 'Michael Chen',
          studentEmail: 'michael.chen@example.com',
          universityId: 'UNI-002',
          universityName: 'Stanford University',
          programName: 'PhD in Physics',
          country: 'United States',
          status: 'pending',
          submittedAt: '2024-06-10T09:15:00Z',
          updatedAt: '2024-06-10T09:15:00Z',
          deadline: '2024-08-15T23:59:59Z',
          completionPercentage: 60,
          priority: 'medium',
          tags: ['Research', 'STEM']
        },
        {
          id: 'APP-2024-003',
          studentId: 'STU-003',
          studentName: 'Emma Rodriguez',
          studentEmail: 'emma.rodriguez@example.com',
          universityId: 'UNI-003',
          universityName: 'University of Oxford',
          programName: 'Master of Business Administration',
          country: 'United Kingdom',
          status: 'additional-docs',
          submittedAt: '2024-06-05T11:20:00Z',
          updatedAt: '2024-06-17T16:30:00Z',
          deadline: '2024-07-15T23:59:59Z',
          completionPercentage: 75,
          priority: 'high',
          assignedTo: 'Admin User',
          lastCommunication: '2024-06-17T16:30:00Z',
          tags: ['Business', 'International']
        },
        {
          id: 'APP-2024-004',
          studentId: 'STU-004',
          studentName: 'James Wilson',
          studentEmail: 'james.wilson@example.com',
          universityId: 'UNI-004',
          universityName: 'University of Toronto',
          programName: 'Bachelor of Engineering',
          country: 'Canada',
          status: 'accepted',
          submittedAt: '2024-05-20T14:45:00Z',
          updatedAt: '2024-06-20T10:15:00Z',
          deadline: '2024-06-30T23:59:59Z',
          completionPercentage: 100,
          priority: 'medium',
          assignedTo: 'Admin User',
          lastCommunication: '2024-06-20T10:15:00Z',
          tags: ['Engineering', 'Scholarship']
        },
        {
          id: 'APP-2024-005',
          studentId: 'STU-005',
          studentName: 'Aisha Patel',
          studentEmail: 'aisha.patel@example.com',
          universityId: 'UNI-005',
          universityName: 'University of Melbourne',
          programName: 'Master of Public Health',
          country: 'Australia',
          status: 'interview',
          submittedAt: '2024-06-01T08:30:00Z',
          updatedAt: '2024-06-19T11:45:00Z',
          deadline: '2024-07-20T23:59:59Z',
          completionPercentage: 90,
          priority: 'high',
          assignedTo: 'Admin User',
          lastCommunication: '2024-06-19T11:45:00Z',
          tags: ['Health Sciences']
        },
        {
          id: 'APP-2024-006',
          studentId: 'STU-006',
          studentName: 'David Kim',
          studentEmail: 'david.kim@example.com',
          universityId: 'UNI-006',
          universityName: 'Technical University of Munich',
          programName: 'Master of Science in Robotics',
          country: 'Germany',
          status: 'rejected',
          submittedAt: '2024-05-15T13:20:00Z',
          updatedAt: '2024-06-10T15:30:00Z',
          deadline: '2024-06-15T23:59:59Z',
          completionPercentage: 100,
          priority: 'low',
          assignedTo: 'Admin User',
          lastCommunication: '2024-06-10T15:30:00Z',
          tags: ['Engineering', 'STEM']
        },
        {
          id: 'APP-2024-007',
          studentId: 'STU-007',
          studentName: 'Olivia Brown',
          studentEmail: 'olivia.brown@example.com',
          universityId: 'UNI-007',
          universityName: 'University of British Columbia',
          programName: 'Bachelor of Arts in Psychology',
          country: 'Canada',
          status: 'waitlisted',
          submittedAt: '2024-05-25T09:45:00Z',
          updatedAt: '2024-06-15T14:20:00Z',
          deadline: '2024-06-25T23:59:59Z',
          completionPercentage: 100,
          priority: 'medium',
          assignedTo: 'Admin User',
          lastCommunication: '2024-06-15T14:20:00Z',
          tags: ['Arts', 'Psychology']
        },
        {
          id: 'APP-2024-008',
          studentId: 'STU-008',
          studentName: 'Carlos Mendez',
          studentEmail: 'carlos.mendez@example.com',
          universityId: 'UNI-008',
          universityName: 'ETH Zurich',
          programName: 'PhD in Computer Science',
          country: 'Switzerland',
          status: 'deferred',
          submittedAt: '2024-05-10T11:30:00Z',
          updatedAt: '2024-06-12T16:45:00Z',
          deadline: '2024-06-20T23:59:59Z',
          completionPercentage: 100,
          priority: 'high',
          assignedTo: 'Admin User',
          lastCommunication: '2024-06-12T16:45:00Z',
          tags: ['Research', 'STEM', 'International']
        },
        {
          id: 'APP-2024-009',
          studentId: 'STU-009',
          studentName: 'Sophie Martin',
          studentEmail: 'sophie.martin@example.com',
          universityId: 'UNI-009',
          universityName: 'Sorbonne University',
          programName: 'Master of Arts in French Literature',
          country: 'France',
          status: 'pending',
          submittedAt: '2024-06-18T10:15:00Z',
          updatedAt: '2024-06-18T10:15:00Z',
          deadline: '2024-08-01T23:59:59Z',
          completionPercentage: 50,
          priority: 'low',
          tags: ['Arts', 'Literature']
        },
        {
          id: 'APP-2024-010',
          studentId: 'STU-010',
          studentName: 'Ahmed Hassan',
          studentEmail: 'ahmed.hassan@example.com',
          universityId: 'UNI-010',
          universityName: 'University of Tokyo',
          programName: 'Master of Engineering in Electrical Engineering',
          country: 'Japan',
          status: 'under-review',
          submittedAt: '2024-06-08T13:45:00Z',
          updatedAt: '2024-06-16T09:30:00Z',
          deadline: '2024-07-25T23:59:59Z',
          completionPercentage: 80,
          priority: 'medium',
          assignedTo: 'Admin User',
          lastCommunication: '2024-06-16T09:30:00Z',
          tags: ['Engineering', 'International']
        }
      ];
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw new Error('Failed to fetch applications');
    }
  }

  async updateApplicationStatus(applicationId: string, status: string): Promise<void> {
    try {
      // In a real implementation, this would update the database
      console.log(`Updating application ${applicationId} status to ${status}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error updating application status:', error);
      throw new Error('Failed to update application status');
    }
  }

  async deleteApplication(applicationId: string): Promise<void> {
    try {
      // In a real implementation, this would delete from the database
      console.log(`Deleting application ${applicationId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error deleting application:', error);
      throw new Error('Failed to delete application');
    }
  }

  async getApplicationDocuments(applicationId: string): Promise<any[]> {
    try {
      // In a real implementation, this would fetch from the database
      // For demo purposes, we'll return mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return [
        {
          id: 'doc-001',
          name: 'Passport',
          fileType: 'PDF',
          fileSize: '2.3 MB',
          uploadedAt: '2024-06-15T10:30:00Z',
          status: 'approved',
          required: true
        },
        {
          id: 'doc-002',
          name: 'Academic Transcript',
          fileType: 'PDF',
          fileSize: '1.8 MB',
          uploadedAt: '2024-06-15T10:35:00Z',
          status: 'approved',
          required: true
        },
        {
          id: 'doc-003',
          name: 'Statement of Purpose',
          fileType: 'PDF',
          fileSize: '520 KB',
          uploadedAt: '2024-06-15T10:40:00Z',
          status: 'pending',
          required: true
        },
        {
          id: 'doc-004',
          name: 'Recommendation Letter 1',
          fileType: 'PDF',
          fileSize: '750 KB',
          uploadedAt: '2024-06-15T10:45:00Z',
          status: 'approved',
          required: true
        },
        {
          id: 'doc-005',
          name: 'Recommendation Letter 2',
          fileType: 'PDF',
          fileSize: '680 KB',
          uploadedAt: '2024-06-15T10:50:00Z',
          status: 'rejected',
          required: true
        },
        {
          id: 'doc-006',
          name: 'CV/Resume',
          fileType: 'PDF',
          fileSize: '450 KB',
          uploadedAt: '2024-06-15T10:55:00Z',
          status: 'approved',
          required: true
        },
        {
          id: 'doc-007',
          name: 'Financial Documents',
          fileType: 'PDF',
          fileSize: '1.2 MB',
          uploadedAt: '2024-06-15T11:00:00Z',
          status: 'pending',
          required: false
        }
      ];
    } catch (error) {
      console.error('Error fetching application documents:', error);
      throw new Error('Failed to fetch application documents');
    }
  }

  async getApplicationTimeline(applicationId: string): Promise<any[]> {
    try {
      // In a real implementation, this would fetch from the database
      // For demo purposes, we'll return mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return [
        {
          type: 'status_change',
          description: 'Application Submitted',
          details: 'Application was submitted by the student',
          timestamp: '2024-06-15T10:30:00Z',
          user: 'System'
        },
        {
          type: 'document_upload',
          description: 'Documents Uploaded',
          details: 'Student uploaded required documents',
          timestamp: '2024-06-15T10:55:00Z',
          user: 'Sarah Johnson'
        },
        {
          type: 'status_change',
          description: 'Status Changed to Under Review',
          details: 'Application status was updated from Pending to Under Review',
          timestamp: '2024-06-16T09:15:00Z',
          user: 'Admin User'
        },
        {
          type: 'note_added',
          description: 'Internal Note Added',
          details: 'An internal note was added to the application',
          timestamp: '2024-06-17T14:20:00Z',
          user: 'Admin User'
        },
        {
          type: 'document_upload',
          description: 'Additional Document Requested',
          details: 'Request sent for additional financial documents',
          timestamp: '2024-06-18T11:30:00Z',
          user: 'Admin User'
        },
        {
          type: 'status_change',
          description: 'Status Changed to Additional Docs',
          details: 'Application status was updated from Under Review to Additional Docs',
          timestamp: '2024-06-18T11:35:00Z',
          user: 'Admin User'
        }
      ];
    } catch (error) {
      console.error('Error fetching application timeline:', error);
      throw new Error('Failed to fetch application timeline');
    }
  }

  async getApplicationNotes(applicationId: string): Promise<any[]> {
    try {
      // In a real implementation, this would fetch from the database
      // For demo purposes, we'll return mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return [
        {
          id: 'note-001',
          content: 'Student has excellent academic credentials. GPA is well above our requirements.',
          timestamp: '2024-06-16T09:20:00Z',
          addedBy: 'Admin User',
          internalOnly: true
        },
        {
          id: 'note-002',
          content: 'Recommendation letters are very strong, especially from Professor Smith at MIT.',
          timestamp: '2024-06-17T14:20:00Z',
          addedBy: 'Admin User',
          internalOnly: true
        },
        {
          id: 'note-003',
          content: 'Financial documents need verification. Requested additional bank statements.',
          timestamp: '2024-06-18T11:30:00Z',
          addedBy: 'Admin User',
          internalOnly: false
        },
        {
          id: 'note-004',
          content: 'Student has research experience that aligns well with our program.',
          timestamp: '2024-06-19T10:15:00Z',
          addedBy: 'Admin User',
          internalOnly: true
        }
      ];
    } catch (error) {
      console.error('Error fetching application notes:', error);
      throw new Error('Failed to fetch application notes');
    }
  }

  async addApplicationNote(applicationId: string, content: string, internalOnly: boolean = true): Promise<any> {
    try {
      // In a real implementation, this would add to the database
      // For demo purposes, we'll return mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        id: `note-${Date.now()}`,
        content,
        timestamp: new Date().toISOString(),
        addedBy: 'Admin User',
        internalOnly
      };
    } catch (error) {
      console.error('Error adding application note:', error);
      throw new Error('Failed to add application note');
    }
  }

  async updateApplicationNote(noteId: string, content: string): Promise<void> {
    try {
      // In a real implementation, this would update the database
      console.log(`Updating note ${noteId} with content: ${content}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error updating application note:', error);
      throw new Error('Failed to update application note');
    }
  }

  async deleteApplicationNote(noteId: string): Promise<void> {
    try {
      // In a real implementation, this would delete from the database
      console.log(`Deleting note ${noteId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error deleting application note:', error);
      throw new Error('Failed to delete application note');
    }
  }

  async addApplicationTag(applicationId: string, tag: string): Promise<void> {
    try {
      // In a real implementation, this would add to the database
      console.log(`Adding tag ${tag} to application ${applicationId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error adding application tag:', error);
      throw new Error('Failed to add application tag');
    }
  }

  async removeApplicationTag(applicationId: string, tag: string): Promise<void> {
    try {
      // In a real implementation, this would remove from the database
      console.log(`Removing tag ${tag} from application ${applicationId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error removing application tag:', error);
      throw new Error('Failed to remove application tag');
    }
  }

  async getMessageTemplates(): Promise<any[]> {
    try {
      // In a real implementation, this would fetch from the database
      // For demo purposes, we'll return mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return [
        {
          id: 'template-001',
          name: 'Application Status Update',
          subject: 'Application Status Update - {{UNIVERSITY_NAME}}',
          body: 'Dear {{STUDENT_NAME}},\n\nWe wanted to update you on the status of your application to {{UNIVERSITY_NAME}} for the {{PROGRAM_NAME}} program.\n\nYour application is currently under review by our admissions committee. We will notify you of any updates or if additional information is required.\n\nBest regards,\nAdmissions Team'
        },
        {
          id: 'template-002',
          name: 'Additional Documents Request',
          subject: 'Additional Documents Required - {{UNIVERSITY_NAME}}',
          body: 'Dear {{STUDENT_NAME}},\n\nThank you for your application to {{UNIVERSITY_NAME}}.\n\nWe need additional documents to complete your application review. Please log in to your student portal to see the specific requirements and upload the necessary documents.\n\nPlease submit these documents by {{DEADLINE}}.\n\nBest regards,\nAdmissions Team'
        },
        {
          id: 'template-003',
          name: 'Interview Invitation',
          subject: 'Interview Invitation - {{UNIVERSITY_NAME}}',
          body: 'Dear {{STUDENT_NAME}},\n\nWe are pleased to invite you to an interview for your application to the {{PROGRAM_NAME}} program at {{UNIVERSITY_NAME}}.\n\nPlease log in to your student portal to schedule your interview at a time convenient for you.\n\nBest regards,\nAdmissions Team'
        },
        {
          id: 'template-004',
          name: 'Application Accepted',
          subject: 'Congratulations! Your Application Has Been Accepted - {{UNIVERSITY_NAME}}',
          body: 'Dear {{STUDENT_NAME}},\n\nCongratulations! We are pleased to inform you that your application to the {{PROGRAM_NAME}} program at {{UNIVERSITY_NAME}} has been accepted.\n\nPlease log in to your student portal to view your acceptance letter and next steps.\n\nWe look forward to welcoming you to our community.\n\nBest regards,\nAdmissions Team'
        },
        {
          id: 'template-005',
          name: 'Application Rejected',
          subject: 'Application Status Update - {{UNIVERSITY_NAME}}',
          body: 'Dear {{STUDENT_NAME}},\n\nThank you for your interest in the {{PROGRAM_NAME}} program at {{UNIVERSITY_NAME}}.\n\nAfter careful consideration, we regret to inform you that we are unable to offer you admission at this time. This year we received an exceptionally high number of qualified applicants, which made our selection process very competitive.\n\nWe wish you the best in your academic pursuits.\n\nBest regards,\nAdmissions Team'
        }
      ];
    } catch (error) {
      console.error('Error fetching message templates:', error);
      throw new Error('Failed to fetch message templates');
    }
  }

  async getCommunicationHistory(studentId: string): Promise<any[]> {
    try {
      // In a real implementation, this would fetch from the database
      // For demo purposes, we'll return mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return [
        {
          id: 'comm-001',
          type: 'email',
          subject: 'Application Received',
          message: 'Thank you for submitting your application. We will review it and get back to you soon.',
          sentAt: '2024-06-15T11:00:00Z',
          sentBy: 'System',
          read: true
        },
        {
          id: 'comm-002',
          type: 'email',
          subject: 'Application Status Update',
          message: 'Your application is now under review by our admissions committee.',
          sentAt: '2024-06-16T09:30:00Z',
          sentBy: 'Admin User',
          read: true
        },
        {
          id: 'comm-003',
          type: 'notification',
          subject: 'Document Verification',
          message: 'Your documents have been verified. We may contact you if we need additional information.',
          sentAt: '2024-06-17T14:45:00Z',
          sentBy: 'System',
          read: true
        },
        {
          id: 'comm-004',
          type: 'email',
          subject: 'Additional Documents Required',
          message: 'We need additional financial documents to complete your application review. Please log in to your student portal to upload the required documents.',
          sentAt: '2024-06-18T11:30:00Z',
          sentBy: 'Admin User',
          read: false
        }
      ];
    } catch (error) {
      console.error('Error fetching communication history:', error);
      throw new Error('Failed to fetch communication history');
    }
  }
}

export const adminService = AdminService.getInstance();