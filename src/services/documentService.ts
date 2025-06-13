import { supabase } from '../lib/supabase';

export type DocumentType = 
  | 'offer_letter'
  | 'coe'
  | 'i20'
  | 'cas'
  | 'admission_letter'
  | 'visa_support'
  | 'financial_document';

export interface EnrollmentDocument {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  studentId: string;
  studentName: string;
  type: DocumentType;
  status: 'draft' | 'pending' | 'available' | 'expired';
  createdAt: string;
  updatedAt: string;
  expiryDate?: string;
  isEncrypted: boolean;
  description?: string;
  createdBy: string;
  versionNumber: number;
}

class DocumentService {
  private static instance: DocumentService;

  static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  // Admin Methods
  async getAllDocuments(): Promise<EnrollmentDocument[]> {
    // In a real app, this would fetch from your API
    // For demo purposes, we'll return mock data
    return [
      {
        id: 'doc-001',
        fileName: 'Offer_Letter_John_Smith.pdf',
        fileSize: '1.2 MB',
        fileType: 'application/pdf',
        studentId: 'student-001',
        studentName: 'John Smith',
        type: 'offer_letter',
        status: 'available',
        createdAt: '2024-06-10T14:30:00Z',
        updatedAt: '2024-06-10T14:30:00Z',
        isEncrypted: false,
        createdBy: 'Admin User',
        versionNumber: 1
      },
      {
        id: 'doc-002',
        fileName: 'COE_Maria_Garcia.pdf',
        fileSize: '850 KB',
        fileType: 'application/pdf',
        studentId: 'student-002',
        studentName: 'Maria Garcia',
        type: 'coe',
        status: 'pending',
        createdAt: '2024-06-12T09:15:00Z',
        updatedAt: '2024-06-12T09:15:00Z',
        isEncrypted: true,
        createdBy: 'Admin User',
        versionNumber: 1
      },
      {
        id: 'doc-003',
        fileName: 'I-20_Ahmed_Hassan.pdf',
        fileSize: '1.5 MB',
        fileType: 'application/pdf',
        studentId: 'student-003',
        studentName: 'Ahmed Hassan',
        type: 'i20',
        status: 'available',
        createdAt: '2024-06-05T11:45:00Z',
        updatedAt: '2024-06-05T11:45:00Z',
        expiryDate: '2025-06-05T11:45:00Z',
        isEncrypted: true,
        description: 'I-20 form for F-1 visa application',
        createdBy: 'Admin User',
        versionNumber: 2
      },
      {
        id: 'doc-004',
        fileName: 'CAS_Li_Wei.pdf',
        fileSize: '980 KB',
        fileType: 'application/pdf',
        studentId: 'student-004',
        studentName: 'Li Wei',
        type: 'cas',
        status: 'available',
        createdAt: '2024-06-08T16:20:00Z',
        updatedAt: '2024-06-08T16:20:00Z',
        expiryDate: '2024-12-08T16:20:00Z',
        isEncrypted: false,
        createdBy: 'Admin User',
        versionNumber: 1
      },
      {
        id: 'doc-005',
        fileName: 'Admission_Letter_Sofia_Rodriguez.pdf',
        fileSize: '750 KB',
        fileType: 'application/pdf',
        studentId: 'student-005',
        studentName: 'Sofia Rodriguez',
        type: 'admission_letter',
        status: 'expired',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        expiryDate: '2024-05-15T10:30:00Z',
        isEncrypted: false,
        createdBy: 'Admin User',
        versionNumber: 1
      }
    ];
  }

  async getStudents(): Promise<any[]> {
    // In a real app, this would fetch from your API
    // For demo purposes, we'll return mock data
    return [
      { id: 'student-001', name: 'John Smith', email: 'john.smith@example.com' },
      { id: 'student-002', name: 'Maria Garcia', email: 'maria.garcia@example.com' },
      { id: 'student-003', name: 'Ahmed Hassan', email: 'ahmed.hassan@example.com' },
      { id: 'student-004', name: 'Li Wei', email: 'li.wei@example.com' },
      { id: 'student-005', name: 'Sofia Rodriguez', email: 'sofia.rodriguez@example.com' },
      { id: 'student-006', name: 'James Wilson', email: 'james.wilson@example.com' },
      { id: 'student-007', name: 'Aisha Patel', email: 'aisha.patel@example.com' },
      { id: 'student-008', name: 'Hiroshi Tanaka', email: 'hiroshi.tanaka@example.com' }
    ];
  }

  async uploadDocument(documentData: Partial<EnrollmentDocument>, file: File): Promise<EnrollmentDocument> {
    // In a real app, this would upload to your storage and create a database record
    // For demo purposes, we'll return a mock document
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      id: `doc-${Date.now().toString(36)}`,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      fileType: file.type,
      studentId: documentData.studentId || '',
      studentName: documentData.studentName || '',
      type: documentData.type || 'offer_letter',
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiryDate: documentData.expiryDate,
      isEncrypted: documentData.isEncrypted || false,
      description: documentData.description,
      createdBy: 'Admin User',
      versionNumber: 1
    };
  }

  async generateDocument(documentData: Partial<EnrollmentDocument>): Promise<EnrollmentDocument> {
    // In a real app, this would generate a document using a template and create a database record
    // For demo purposes, we'll return a mock document
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const documentType = documentData.type || 'offer_letter';
    const studentName = documentData.studentName || '';
    
    return {
      id: `doc-${Date.now().toString(36)}`,
      fileName: `${documentType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('_')}_${studentName.replace(/\s+/g, '_')}.pdf`,
      fileSize: '1.1 MB',
      fileType: 'application/pdf',
      studentId: documentData.studentId || '',
      studentName: studentName,
      type: documentType,
      status: 'available',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiryDate: documentData.expiryDate,
      isEncrypted: documentData.isEncrypted || false,
      description: documentData.description,
      createdBy: 'Admin User',
      versionNumber: 1
    };
  }

  async deleteDocument(documentId: string): Promise<void> {
    // In a real app, this would delete from your storage and database
    // For demo purposes, we'll just simulate an API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async sendDocumentNotification(documentId: string): Promise<void> {
    // In a real app, this would send a notification to the student
    // For demo purposes, we'll just simulate an API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async getDocumentVersionHistory(documentId: string): Promise<any[]> {
    // In a real app, this would fetch version history from your database
    // For demo purposes, we'll return mock data
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: `${documentId}-v3`,
        versionNumber: 3,
        createdAt: new Date().toISOString(),
        createdBy: 'Admin User',
        changeDescription: 'Updated program details and corrected student information',
        fileSize: '1.2 MB'
      },
      {
        id: `${documentId}-v2`,
        versionNumber: 2,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'Admin User',
        changeDescription: 'Fixed typo in student name and updated university logo',
        fileSize: '1.1 MB'
      },
      {
        id: `${documentId}-v1`,
        versionNumber: 1,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'System',
        changeDescription: 'Initial document creation',
        fileSize: '1.0 MB'
      }
    ];
  }

  async downloadDocumentVersion(versionId: string): Promise<void> {
    // In a real app, this would download the specific version
    // For demo purposes, we'll just simulate an API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async restoreDocumentVersion(documentId: string, versionId: string): Promise<void> {
    // In a real app, this would restore a previous version
    // For demo purposes, we'll just simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async getNotificationTemplates(): Promise<any[]> {
    // In a real app, this would fetch templates from your database
    // For demo purposes, we'll return mock data
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'template-001',
        name: 'New Document Available',
        subject: 'Your {{document_type}} is now available',
        body: 'Dear {{student_name}},\n\nYour {{document_type}} is now available in your student portal. Please log in to view and download it.\n\nThis document will be available until {{expiry_date}}.\n\nRegards,\nThe Admissions Team',
        documentType: 'all'
      },
      {
        id: 'template-002',
        name: 'Offer Letter Notification',
        subject: 'Your Offer Letter from University',
        body: 'Dear {{student_name}},\n\nCongratulations! Your Offer Letter is now available in your student portal. Please log in to view and download it.\n\nYou will need to accept your offer by the date specified in the letter.\n\nRegards,\nThe Admissions Team',
        documentType: 'offer_letter'
      },
      {
        id: 'template-003',
        name: 'I-20 Document Ready',
        subject: 'Your I-20 Document is Ready',
        body: 'Dear {{student_name}},\n\nYour I-20 document is now available in your student portal. Please log in to view and download it.\n\nYou will need this document for your visa application. Please ensure all information is correct.\n\nRegards,\nThe International Student Office',
        documentType: 'i20'
      }
    ];
  }

  async createNotificationTemplate(templateData: any): Promise<any> {
    // In a real app, this would create a template in your database
    // For demo purposes, we'll just simulate an API call and return mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      id: `template-${Date.now().toString(36)}`,
      ...templateData,
      createdAt: new Date().toISOString()
    };
  }

  async updateNotificationTemplate(templateId: string, templateData: any): Promise<void> {
    // In a real app, this would update a template in your database
    // For demo purposes, we'll just simulate an API call
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  async getNotificationChannels(): Promise<any[]> {
    // In a real app, this would fetch channels from your database
    // For demo purposes, we'll return mock data
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'channel-001',
        name: 'Email Notifications',
        type: 'email',
        enabled: true,
        config: {
          senderEmail: 'notifications@university.edu',
          senderName: 'University Admissions'
        }
      },
      {
        id: 'channel-002',
        name: 'SMS Notifications',
        type: 'sms',
        enabled: false,
        config: {
          provider: 'Twilio',
          fromNumber: '+15551234567'
        }
      },
      {
        id: 'channel-003',
        name: 'In-App Notifications',
        type: 'in_app',
        enabled: true,
        config: {
          showBadge: true,
          showPopup: true
        }
      }
    ];
  }

  async updateNotificationChannel(channelId: string, channelData: any): Promise<void> {
    // In a real app, this would update a channel in your database
    // For demo purposes, we'll just simulate an API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Student Methods
  async getStudentDocuments(studentId: string): Promise<EnrollmentDocument[]> {
    // In a real app, this would fetch from your API
    // For demo purposes, we'll return mock data
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'doc-001',
        fileName: 'Offer_Letter.pdf',
        fileSize: '1.2 MB',
        fileType: 'application/pdf',
        studentId: studentId,
        studentName: 'Student Name',
        type: 'offer_letter',
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEncrypted: false,
        description: 'Your official offer letter for the Master of Computer Science program',
        createdBy: 'Admin User',
        versionNumber: 1
      },
      {
        id: 'doc-002',
        fileName: 'Confirmation_of_Enrollment.pdf',
        fileSize: '850 KB',
        fileType: 'application/pdf',
        studentId: studentId,
        studentName: 'Student Name',
        type: 'coe',
        status: 'available',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        isEncrypted: true,
        description: 'Confirmation of Enrollment (COE) for visa application purposes',
        createdBy: 'Admin User',
        versionNumber: 1
      },
      {
        id: 'doc-003',
        fileName: 'Financial_Support_Letter.pdf',
        fileSize: '750 KB',
        fileType: 'application/pdf',
        studentId: studentId,
        studentName: 'Student Name',
        type: 'financial_document',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isEncrypted: false,
        createdBy: 'Admin User',
        versionNumber: 1
      },
      {
        id: 'doc-004',
        fileName: 'Visa_Support_Letter.pdf',
        fileSize: '680 KB',
        fileType: 'application/pdf',
        studentId: studentId,
        studentName: 'Student Name',
        type: 'visa_support',
        status: 'expired',
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        isEncrypted: false,
        createdBy: 'Admin User',
        versionNumber: 1
      }
    ];
  }

  async downloadDocument(documentId: string): Promise<void> {
    // In a real app, this would download the document
    // For demo purposes, we'll just simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async getNotificationPreferences(): Promise<any[]> {
    // In a real app, this would fetch preferences from your database
    // For demo purposes, we'll return mock data
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'pref-001',
        type: 'email',
        enabled: true,
        documentTypes: ['all']
      },
      {
        id: 'pref-002',
        type: 'sms',
        enabled: false,
        documentTypes: ['offer_letter', 'i20', 'cas']
      },
      {
        id: 'pref-003',
        type: 'in_app',
        enabled: true,
        documentTypes: ['offer_letter', 'coe', 'i20', 'cas', 'admission_letter', 'visa_support', 'financial_document']
      }
    ];
  }

  async updateNotificationPreferences(preferences: any[]): Promise<void> {
    // In a real app, this would update preferences in your database
    // For demo purposes, we'll just simulate an API call
    await new Promise(resolve => setTimeout(resolve, 800));
  }
}

export const documentService = DocumentService.getInstance();