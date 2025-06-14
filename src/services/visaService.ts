import { supabase } from '../lib/supabase';

export interface VisaApplication {
  id: string;
  userId: string;
  country: string;
  countryCode: string;
  visaType: string;
  status: 'not_started' | 'documents_collection' | 'forms_completion' | 'payment_pending' | 'appointment_scheduled' | 'biometrics_completed' | 'interview_completed' | 'under_review' | 'approved' | 'rejected';
  applicationId: string;
  createdAt: string;
  updatedAt: string;
  submissionDeadline?: string;
  appointmentDate?: string;
  totalRequirements: number;
  completedRequirements: number;
  trackingUrl?: string;
  documents: VisaDocument[];
}

export interface VisaDocument {
  id: string;
  visaApplicationId: string;
  name: string;
  type: 'form' | 'identity' | 'financial' | 'educational' | 'travel' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt?: string;
  notes?: string;
  version: number;
  required: boolean;
}

export interface VisaRequirement {
  id: string;
  country: string;
  visaType: string;
  name: string;
  description: string;
  documentType: string;
  required: boolean;
  instructions: string;
  externalLink?: string;
  deadline?: string;
  fee?: {
    amount: number;
    currency: string;
    paymentInstructions: string;
  };
}

class VisaService {
  private static instance: VisaService;

  static getInstance(): VisaService {
    if (!VisaService.instance) {
      VisaService.instance = new VisaService();
    }
    return VisaService.instance;
  }

  async getUserVisaApplications(userId: string): Promise<VisaApplication[]> {
    // In a real app, this would fetch from your API
    // For demo purposes, we'll return mock data
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 'visa-001',
        userId,
        country: 'United States',
        countryCode: 'us',
        visaType: 'F-1 Student Visa',
        status: 'documents_collection',
        applicationId: 'US-F1-2024-12345',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        submissionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalRequirements: 12,
        completedRequirements: 5,
        trackingUrl: 'https://ceac.state.gov/CEACStatTracker/Status.aspx',
        documents: [
          {
            id: 'doc-001',
            visaApplicationId: 'visa-001',
            name: 'DS-160 Confirmation',
            type: 'form',
            status: 'approved',
            uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            version: 1,
            required: true
          },
          {
            id: 'doc-002',
            visaApplicationId: 'visa-001',
            name: 'I-20 Form',
            type: 'educational',
            status: 'approved',
            uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            version: 1,
            required: true
          },
          {
            id: 'doc-003',
            visaApplicationId: 'visa-001',
            name: 'SEVIS Fee Receipt',
            type: 'financial',
            status: 'pending',
            version: 1,
            required: true
          },
          {
            id: 'doc-004',
            visaApplicationId: 'visa-001',
            name: 'Passport',
            type: 'identity',
            status: 'approved',
            uploadedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            version: 1,
            required: true
          },
          {
            id: 'doc-005',
            visaApplicationId: 'visa-001',
            name: 'Financial Documents',
            type: 'financial',
            status: 'approved',
            uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            version: 2,
            required: true,
            notes: 'Please provide additional bank statements covering the last 6 months'
          }
        ]
      },
      {
        id: 'visa-002',
        userId,
        country: 'United Kingdom',
        countryCode: 'gb',
        visaType: 'Student Visa (Tier 4)',
        status: 'appointment_scheduled',
        applicationId: 'UK-T4-2024-67890',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        submissionDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalRequirements: 10,
        completedRequirements: 8,
        trackingUrl: 'https://www.gov.uk/track-your-visa-application',
        documents: [
          {
            id: 'doc-006',
            visaApplicationId: 'visa-002',
            name: 'CAS Statement',
            type: 'educational',
            status: 'approved',
            uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            version: 1,
            required: true
          },
          {
            id: 'doc-007',
            visaApplicationId: 'visa-002',
            name: 'Tuberculosis Test Results',
            type: 'other',
            status: 'approved',
            uploadedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            version: 1,
            required: true
          },
          {
            id: 'doc-008',
            visaApplicationId: 'visa-002',
            name: 'Passport',
            type: 'identity',
            status: 'approved',
            uploadedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
            version: 1,
            required: true
          }
        ]
      },
      {
        id: 'visa-003',
        userId,
        country: 'Canada',
        countryCode: 'ca',
        visaType: 'Study Permit',
        status: 'approved',
        applicationId: 'CA-SP-2023-54321',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalRequirements: 9,
        completedRequirements: 9,
        trackingUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-status.html',
        documents: [
          {
            id: 'doc-009',
            visaApplicationId: 'visa-003',
            name: 'Letter of Acceptance',
            type: 'educational',
            status: 'approved',
            uploadedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
            version: 1,
            required: true
          },
          {
            id: 'doc-010',
            visaApplicationId: 'visa-003',
            name: 'Proof of Financial Support',
            type: 'financial',
            status: 'approved',
            uploadedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
            version: 1,
            required: true
          }
        ]
      }
    ];
  }

  async createVisaApplication(userId: string): Promise<VisaApplication> {
    // In a real app, this would create a new application in your database
    // For demo purposes, we'll return a mock application
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `visa-${Date.now().toString(36)}`,
      userId,
      country: '',
      countryCode: '',
      visaType: '',
      status: 'not_started',
      applicationId: `DRAFT-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalRequirements: 0,
      completedRequirements: 0,
      documents: []
    };
  }

  async updateVisaApplication(applicationId: string, updates: Partial<VisaApplication>): Promise<VisaApplication> {
    // In a real app, this would update the application in your database
    // For demo purposes, we'll simulate an update
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // This would be the updated application from the database
    return {
      id: applicationId,
      userId: updates.userId || '',
      country: updates.country || '',
      countryCode: updates.countryCode || '',
      visaType: updates.visaType || '',
      status: updates.status || 'not_started',
      applicationId: updates.applicationId || `DRAFT-${Date.now().toString(36).toUpperCase()}`,
      createdAt: updates.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submissionDeadline: updates.submissionDeadline,
      appointmentDate: updates.appointmentDate,
      totalRequirements: updates.totalRequirements || 0,
      completedRequirements: updates.completedRequirements || 0,
      trackingUrl: updates.trackingUrl,
      documents: updates.documents || []
    };
  }

  async getVisaRequirements(country: string, visaType: string): Promise<VisaRequirement[]> {
    // In a real app, this would fetch from your API
    // For demo purposes, we'll return mock data based on country and visa type
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // US F-1 Student Visa requirements
    if (country === 'United States' && visaType === 'F-1 Student Visa') {
      return [
        {
          id: 'req-us-f1-001',
          country: 'United States',
          visaType: 'F-1 Student Visa',
          name: 'Form DS-160',
          description: 'Online Nonimmigrant Visa Application',
          documentType: 'form',
          required: true,
          instructions: 'Complete the DS-160 form online. Print and save the confirmation page with barcode.',
          externalLink: 'https://ceac.state.gov/genniv/'
        },
        {
          id: 'req-us-f1-002',
          country: 'United States',
          visaType: 'F-1 Student Visa',
          name: 'SEVIS Fee Payment',
          description: 'Student and Exchange Visitor Information System Fee',
          documentType: 'financial',
          required: true,
          instructions: 'Pay the SEVIS I-901 fee online and print the receipt.',
          externalLink: 'https://www.fmjfee.com/',
          fee: {
            amount: 350,
            currency: 'USD',
            paymentInstructions: 'Payment must be made by credit card online.'
          }
        },
        {
          id: 'req-us-f1-003',
          country: 'United States',
          visaType: 'F-1 Student Visa',
          name: 'Visa Application Fee',
          description: 'MRV Fee Payment',
          documentType: 'financial',
          required: true,
          instructions: 'Pay the visa application fee and keep the receipt.',
          fee: {
            amount: 185,
            currency: 'USD',
            paymentInstructions: 'Payment can be made online or at designated banks depending on your country.'
          }
        },
        {
          id: 'req-us-f1-004',
          country: 'United States',
          visaType: 'F-1 Student Visa',
          name: 'Form I-20',
          description: 'Certificate of Eligibility for Nonimmigrant Student Status',
          documentType: 'educational',
          required: true,
          instructions: 'Obtain from your U.S. school. Must be signed by you and a school official.'
        },
        {
          id: 'req-us-f1-005',
          country: 'United States',
          visaType: 'F-1 Student Visa',
          name: 'Valid Passport',
          description: 'Passport valid for at least six months beyond your period of stay',
          documentType: 'identity',
          required: true,
          instructions: 'Ensure your passport is valid for at least six months beyond your intended period of stay in the U.S.'
        },
        {
          id: 'req-us-f1-006',
          country: 'United States',
          visaType: 'F-1 Student Visa',
          name: 'Passport-sized Photos',
          description: 'Recent photographs meeting visa requirements',
          documentType: 'identity',
          required: true,
          instructions: '2 photos, 2x2 inches (51x51 mm) on white background, taken within the last 6 months.'
        },
        {
          id: 'req-us-f1-007',
          country: 'United States',
          visaType: 'F-1 Student Visa',
          name: 'Financial Evidence',
          description: 'Proof of sufficient funds to cover expenses',
          documentType: 'financial',
          required: true,
          instructions: 'Bank statements, scholarship letters, or affidavits of support showing sufficient funds to cover tuition and living expenses.'
        },
        {
          id: 'req-us-f1-008',
          country: 'United States',
          visaType: 'F-1 Student Visa',
          name: 'Academic Transcripts',
          description: 'Previous academic records',
          documentType: 'educational',
          required: false,
          instructions: 'Transcripts from previous educational institutions attended.'
        },
        {
          id: 'req-us-f1-009',
          country: 'United States',
          visaType: 'F-1 Student Visa',
          name: 'Standardized Test Scores',
          description: 'TOEFL, IELTS, GRE, GMAT, etc.',
          documentType: 'educational',
          required: false,
          instructions: 'Test score reports that were required for admission to your program.'
        },
        {
          id: 'req-us-f1-010',
          country: 'United States',
          visaType: 'F-1 Student Visa',
          name: 'Visa Interview Appointment',
          description: 'Schedule an interview at the U.S. Embassy or Consulate',
          documentType: 'other',
          required: true,
          instructions: 'Schedule your visa interview appointment after paying the visa application fee.',
          externalLink: 'https://ais.usvisa-info.com/'
        },
        {
          id: 'req-us-f1-011',
          country: 'United States',
          visaType: 'F-1 Student Visa',
          name: 'Proof of Ties to Home Country',
          description: 'Evidence of binding ties to your home country',
          documentType: 'other',
          required: false,
          instructions: 'Documents showing your intention to return to your home country after completing your studies (property ownership, job offer letter, etc.).'
        },
        {
          id: 'req-us-f1-012',
          country: 'United States',
          visaType: 'F-1 Student Visa',
          name: 'Resume/CV',
          description: 'Current resume or curriculum vitae',
          documentType: 'other',
          required: false,
          instructions: 'A current resume showing your educational and professional background.'
        }
      ];
    }
    
    // UK Student Visa requirements
    if (country === 'United Kingdom' && visaType === 'Student Visa (Tier 4)') {
      return [
        {
          id: 'req-uk-t4-001',
          country: 'United Kingdom',
          visaType: 'Student Visa (Tier 4)',
          name: 'CAS (Confirmation of Acceptance for Studies)',
          description: 'Unique reference number from your UK educational institution',
          documentType: 'educational',
          required: true,
          instructions: 'Obtain from your UK university or college. Contains a unique reference number and details about your course.'
        },
        {
          id: 'req-uk-t4-002',
          country: 'United Kingdom',
          visaType: 'Student Visa (Tier 4)',
          name: 'Visa Application Form',
          description: 'Online application form',
          documentType: 'form',
          required: true,
          instructions: 'Complete the online application form on the UK government website.',
          externalLink: 'https://www.gov.uk/apply-to-come-to-the-uk'
        },
        {
          id: 'req-uk-t4-003',
          country: 'United Kingdom',
          visaType: 'Student Visa (Tier 4)',
          name: 'Application Fee',
          description: 'Payment for visa application',
          documentType: 'financial',
          required: true,
          instructions: 'Pay the application fee online during the application process.',
          fee: {
            amount: 348,
            currency: 'GBP',
            paymentInstructions: 'Payment must be made online by credit or debit card.'
          }
        },
        {
          id: 'req-uk-t4-004',
          country: 'United Kingdom',
          visaType: 'Student Visa (Tier 4)',
          name: 'Immigration Health Surcharge',
          description: 'Payment for healthcare access in the UK',
          documentType: 'financial',
          required: true,
          instructions: 'Pay the Immigration Health Surcharge online during the application process.',
          fee: {
            amount: 470,
            currency: 'GBP',
            paymentInstructions: 'Payment is per year of your visa and must be paid online.'
          }
        },
        {
          id: 'req-uk-t4-005',
          country: 'United Kingdom',
          visaType: 'Student Visa (Tier 4)',
          name: 'Valid Passport',
          description: 'Passport valid for the duration of your stay',
          documentType: 'identity',
          required: true,
          instructions: 'Your passport must be valid for the entire duration of your stay in the UK.'
        },
        {
          id: 'req-uk-t4-006',
          country: 'United Kingdom',
          visaType: 'Student Visa (Tier 4)',
          name: 'Passport-sized Photos',
          description: 'Recent color photographs meeting UK visa requirements',
          documentType: 'identity',
          required: true,
          instructions: 'Provide a recent color photograph with a light background. Check the UK visa photo requirements.'
        },
        {
          id: 'req-uk-t4-007',
          country: 'United Kingdom',
          visaType: 'Student Visa (Tier 4)',
          name: 'Financial Evidence',
          description: 'Proof of sufficient funds for tuition and living expenses',
          documentType: 'financial',
          required: true,
          instructions: 'Bank statements showing you have enough money to pay your course fees and living costs. Must be held for at least 28 consecutive days.'
        },
        {
          id: 'req-uk-t4-008',
          country: 'United Kingdom',
          visaType: 'Student Visa (Tier 4)',
          name: 'English Language Proficiency',
          description: 'IELTS, TOEFL, or other approved test results',
          documentType: 'educational',
          required: true,
          instructions: 'Provide evidence of your English language ability, usually through an approved test like IELTS or TOEFL.'
        },
        {
          id: 'req-uk-t4-009',
          country: 'United Kingdom',
          visaType: 'Student Visa (Tier 4)',
          name: 'Tuberculosis Test Results',
          description: 'TB test certificate if from certain countries',
          documentType: 'other',
          required: false,
          instructions: 'If you are from a country where tuberculosis (TB) screening is required, you will need to provide a TB test certificate.',
          externalLink: 'https://www.gov.uk/tb-test-visa'
        },
        {
          id: 'req-uk-t4-010',
          country: 'United Kingdom',
          visaType: 'Student Visa (Tier 4)',
          name: 'Biometric Information',
          description: 'Fingerprints and photograph',
          documentType: 'other',
          required: true,
          instructions: 'You will need to provide your biometric information (fingerprints and a photograph) at a visa application center.'
        }
      ];
    }
    
    // Canada Study Permit requirements
    if (country === 'Canada' && visaType === 'Study Permit') {
      return [
        {
          id: 'req-ca-sp-001',
          country: 'Canada',
          visaType: 'Study Permit',
          name: 'Application Form',
          description: 'IMM 1294 Study Permit Application Form',
          documentType: 'form',
          required: true,
          instructions: 'Complete the IMM 1294 form online through the IRCC portal.',
          externalLink: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html'
        },
        {
          id: 'req-ca-sp-002',
          country: 'Canada',
          visaType: 'Study Permit',
          name: 'Letter of Acceptance',
          description: 'Acceptance letter from a Designated Learning Institution (DLI)',
          documentType: 'educational',
          required: true,
          instructions: 'Provide the original acceptance letter from your Canadian educational institution. Must include your name, program details, and tuition information.'
        },
        {
          id: 'req-ca-sp-003',
          country: 'Canada',
          visaType: 'Study Permit',
          name: 'Proof of Financial Support',
          description: 'Evidence of funds to cover tuition and living expenses',
          documentType: 'financial',
          required: true,
          instructions: 'Bank statements, scholarship letters, or proof of a Canadian bank account with sufficient funds. Must show you can cover tuition fees and living expenses (approximately CAD $10,000 per year plus tuition).'
        },
        {
          id: 'req-ca-sp-004',
          country: 'Canada',
          visaType: 'Study Permit',
          name: 'Valid Passport',
          description: 'Passport valid for the duration of your studies',
          documentType: 'identity',
          required: true,
          instructions: 'Your passport should be valid for the entire duration of your intended stay in Canada.'
        },
        {
          id: 'req-ca-sp-005',
          country: 'Canada',
          visaType: 'Study Permit',
          name: 'Passport-sized Photos',
          description: 'Recent photographs meeting Canadian specifications',
          documentType: 'identity',
          required: true,
          instructions: 'Two identical photos meeting the specifications for Canadian visa applications.'
        },
        {
          id: 'req-ca-sp-006',
          country: 'Canada',
          visaType: 'Study Permit',
          name: 'Application Fee',
          description: 'Payment for study permit application',
          documentType: 'financial',
          required: true,
          instructions: 'Pay the application fee online during the application process.',
          fee: {
            amount: 150,
            currency: 'CAD',
            paymentInstructions: 'Payment must be made online by credit or debit card.'
          }
        },
        {
          id: 'req-ca-sp-007',
          country: 'Canada',
          visaType: 'Study Permit',
          name: 'Biometrics Fee',
          description: 'Payment for biometric collection',
          documentType: 'financial',
          required: true,
          instructions: 'Pay the biometrics fee online during the application process.',
          fee: {
            amount: 85,
            currency: 'CAD',
            paymentInstructions: 'Payment must be made online by credit or debit card.'
          }
        },
        {
          id: 'req-ca-sp-008',
          country: 'Canada',
          visaType: 'Study Permit',
          name: 'Statement of Purpose',
          description: 'Letter explaining your study plans',
          documentType: 'other',
          required: true,
          instructions: 'Write a letter explaining why you want to study in Canada, your chosen program, and your plans after graduation.'
        },
        {
          id: 'req-ca-sp-009',
          country: 'Canada',
          visaType: 'Study Permit',
          name: 'Medical Examination',
          description: 'Medical exam from an approved physician',
          documentType: 'other',
          required: true,
          instructions: 'Complete a medical examination with a doctor approved by Immigration, Refugees and Citizenship Canada (IRCC).',
          externalLink: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/medical-police/medical-exams/requirements-permanent-residents.html'
        }
      ];
    }
    
    // Default requirements if country/visa type not specifically handled
    return [
      {
        id: `req-default-001`,
        country,
        visaType,
        name: 'Visa Application Form',
        description: 'Official application form for your visa type',
        documentType: 'form',
        required: true,
        instructions: 'Complete the official visa application form for your destination country.'
      },
      {
        id: `req-default-002`,
        country,
        visaType,
        name: 'Valid Passport',
        description: 'Passport valid for at least 6 months beyond intended stay',
        documentType: 'identity',
        required: true,
        instructions: 'Ensure your passport is valid for at least 6 months beyond your intended stay.'
      },
      {
        id: `req-default-003`,
        country,
        visaType,
        name: 'Passport-sized Photos',
        description: 'Recent photographs meeting visa requirements',
        documentType: 'identity',
        required: true,
        instructions: 'Provide recent passport-sized photographs meeting the specific requirements of the embassy or consulate.'
      },
      {
        id: `req-default-004`,
        country,
        visaType,
        name: 'Proof of Financial Support',
        description: 'Evidence of sufficient funds for your stay',
        documentType: 'financial',
        required: true,
        instructions: 'Provide bank statements, scholarship letters, or other financial documents showing you can support yourself during your stay.'
      },
      {
        id: `req-default-005`,
        country,
        visaType,
        name: 'Acceptance Letter',
        description: 'Official acceptance from educational institution',
        documentType: 'educational',
        required: true,
        instructions: 'Provide the official acceptance letter from your educational institution.'
      },
      {
        id: `req-default-006`,
        country,
        visaType,
        name: 'Application Fee',
        description: 'Payment for visa application processing',
        documentType: 'financial',
        required: true,
        instructions: 'Pay the required visa application fee.',
        fee: {
          amount: 100,
          currency: 'USD',
          paymentInstructions: 'Payment methods vary by country. Check the embassy website for details.'
        }
      }
    ];
  }

  async uploadVisaDocument(userId: string, applicationId: string, documentData: any, file: File): Promise<VisaDocument> {
    // In a real app, this would upload the file to storage and create a database record
    // For demo purposes, we'll return a mock document
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      id: `doc-${Date.now().toString(36)}`,
      visaApplicationId: applicationId,
      name: documentData.name || file.name,
      type: documentData.type || 'other',
      status: 'pending',
      uploadedAt: new Date().toISOString(),
      notes: documentData.notes,
      version: 1,
      required: documentData.required || false
    };
  }

  async getVisaApplicationTimeline(applicationId: string): Promise<any[]> {
    // In a real app, this would fetch the timeline from your database
    // For demo purposes, we'll return mock data
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Application Created',
        description: 'Visa application process initiated'
      },
      {
        date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Documents Collection Started',
        description: 'Started gathering required documents for visa application'
      },
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Document Uploaded',
        description: 'I-20 Form uploaded and submitted'
      },
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Document Uploaded',
        description: 'DS-160 Confirmation uploaded and submitted'
      },
      {
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Document Uploaded',
        description: 'Financial Documents uploaded and submitted'
      },
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Document Verification',
        description: 'Documents under review by visa advisor'
      }
    ];
  }

  async scheduleVisaAppointment(applicationId: string, appointmentData: any): Promise<any> {
    // In a real app, this would schedule an appointment and update the database
    // For demo purposes, we'll return mock data
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      id: `appt-${Date.now().toString(36)}`,
      visaApplicationId: applicationId,
      date: appointmentData.date,
      time: appointmentData.time,
      location: appointmentData.location,
      type: appointmentData.type,
      confirmationNumber: `CNF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };
  }

  async updateNotificationSettings(userId: string, settings: any): Promise<void> {
    // In a real app, this would update notification settings in the database
    // For demo purposes, we'll just simulate an API call
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  async getCountryVisaTypes(countryCode: string): Promise<any[]> {
    // In a real app, this would fetch visa types for a specific country
    // For demo purposes, we'll return mock data
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const visaTypes: Record<string, any[]> = {
      'us': [
        { id: 'f1', name: 'F-1 Student Visa', description: 'For academic students' },
        { id: 'j1', name: 'J-1 Exchange Visitor Visa', description: 'For exchange programs' },
        { id: 'm1', name: 'M-1 Student Visa', description: 'For vocational students' }
      ],
      'gb': [
        { id: 'tier4', name: 'Student Visa (Tier 4)', description: 'For students over 16 years' },
        { id: 'shortterm', name: 'Short-term Study Visa', description: 'For courses up to 6 months' }
      ],
      'ca': [
        { id: 'studypermit', name: 'Study Permit', description: 'For courses over 6 months' },
        { id: 'workpermit', name: 'Post-Graduation Work Permit', description: 'For after graduation' }
      ],
      'au': [
        { id: 'subclass500', name: 'Student Visa (Subclass 500)', description: 'For international students' },
        { id: 'subclass485', name: 'Temporary Graduate Visa', description: 'For after graduation' }
      ],
      'de': [
        { id: 'nationald', name: 'National Visa (Type D)', description: 'For long-term study' },
        { id: 'languagecourse', name: 'Language Course Visa', description: 'For language studies' }
      ],
      'fr': [
        { id: 'vlsts', name: 'Long-Stay Student Visa', description: 'For courses over 3 months' },
        { id: 'talentpassport', name: 'Talent Passport', description: 'For researchers and academics' }
      ],
      'jp': [
        { id: 'collegestudent', name: 'College Student Visa', description: 'For university students' },
        { id: 'culturalactivities', name: 'Cultural Activities Visa', description: 'For cultural studies' }
      ]
    };
    
    return visaTypes[countryCode.toLowerCase()] || [];
  }

  async getCountries(): Promise<any[]> {
    // In a real app, this would fetch countries from your database
    // For demo purposes, we'll return mock data
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      { code: 'us', name: 'United States', flag: 'us' },
      { code: 'gb', name: 'United Kingdom', flag: 'gb' },
      { code: 'ca', name: 'Canada', flag: 'ca' },
      { code: 'au', name: 'Australia', flag: 'au' },
      { code: 'de', name: 'Germany', flag: 'de' },
      { code: 'fr', name: 'France', flag: 'fr' },
      { code: 'jp', name: 'Japan', flag: 'jp' },
      { code: 'cn', name: 'China', flag: 'cn' },
      { code: 'sg', name: 'Singapore', flag: 'sg' },
      { code: 'nz', name: 'New Zealand', flag: 'nz' }
    ];
  }
}

export const visaService = VisaService.getInstance();