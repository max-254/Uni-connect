import { supabase } from '../lib/supabase';
import { University } from './universityService';

export interface Application {
  id: string;
  user_id: string;
  university_id: string;
  university_name: string;
  program_name: string;
  status: 'draft' | 'in-progress' | 'submitted' | 'under-review' | 'accepted' | 'rejected' | 'waitlisted';
  progress_percentage: number;
  application_data: {
    personal_info?: any;
    academic_info?: any;
    documents?: any;
    essays?: any;
    references?: any;
  };
  submitted_at?: string;
  deadline: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  university_id: string;
  university_name: string;
  university_country: string;
  program_name?: string;
  notes?: string;
  created_at: string;
}

export interface ApplicationStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
  order: number;
}

class ApplicationService {
  private static instance: ApplicationService;

  static getInstance(): ApplicationService {
    if (!ApplicationService.instance) {
      ApplicationService.instance = new ApplicationService();
    }
    return ApplicationService.instance;
  }

  // Favorites Management
  async addToFavorites(userId: string, university: University, programName?: string): Promise<Favorite> {
    const favorite: Omit<Favorite, 'id' | 'created_at'> = {
      user_id: userId,
      university_id: university.id,
      university_name: university.name,
      university_country: university.country,
      program_name: programName
    };

    const { data, error } = await supabase
      .from('favorites')
      .insert([favorite])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add to favorites: ${error.message}`);
    }

    return data;
  }

  async removeFromFavorites(userId: string, universityId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('university_id', universityId);

    if (error) {
      throw new Error(`Failed to remove from favorites: ${error.message}`);
    }
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch favorites: ${error.message}`);
    }

    return data || [];
  }

  async isFavorite(userId: string, universityId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('university_id', universityId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check favorite status: ${error.message}`);
    }

    return !!data;
  }

  // Application Management
  async startApplication(
    userId: string, 
    university: University, 
    programName: string
  ): Promise<Application> {
    const application: Omit<Application, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      university_id: university.id,
      university_name: university.name,
      program_name: programName,
      status: 'draft',
      progress_percentage: 0,
      application_data: {},
      deadline: university.applicationDeadline
    };

    const { data, error } = await supabase
      .from('applications')
      .insert([application])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to start application: ${error.message}`);
    }

    return data;
  }

  async updateApplication(
    applicationId: string, 
    updates: Partial<Application>
  ): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update application: ${error.message}`);
    }

    return data;
  }

  async submitApplication(applicationId: string): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .update({
        status: 'submitted',
        progress_percentage: 100,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit application: ${error.message}`);
    }

    return data;
  }

  async getApplications(userId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    return data || [];
  }

  async getApplication(applicationId: string): Promise<Application | null> {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch application: ${error.message}`);
    }

    return data;
  }

  async deleteApplication(applicationId: string): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (error) {
      throw new Error(`Failed to delete application: ${error.message}`);
    }
  }

  // Application Steps Management
  getApplicationSteps(programType: string = 'general'): ApplicationStep[] {
    const baseSteps: ApplicationStep[] = [
      {
        id: 'personal-info',
        name: 'Personal Information',
        description: 'Complete your personal details and contact information',
        required: true,
        completed: false,
        order: 1
      },
      {
        id: 'academic-background',
        name: 'Academic Background',
        description: 'Add your educational history and qualifications',
        required: true,
        completed: false,
        order: 2
      },
      {
        id: 'documents',
        name: 'Document Upload',
        description: 'Upload required documents (transcripts, CV, etc.)',
        required: true,
        completed: false,
        order: 3
      },
      {
        id: 'personal-statement',
        name: 'Personal Statement',
        description: 'Write your statement of purpose',
        required: true,
        completed: false,
        order: 4
      },
      {
        id: 'references',
        name: 'References',
        description: 'Provide academic and professional references',
        required: true,
        completed: false,
        order: 5
      },
      {
        id: 'additional-info',
        name: 'Additional Information',
        description: 'Any additional requirements or information',
        required: false,
        completed: false,
        order: 6
      },
      {
        id: 'review-submit',
        name: 'Review & Submit',
        description: 'Review your application and submit',
        required: true,
        completed: false,
        order: 7
      }
    ];

    // Add program-specific steps
    if (programType.toLowerCase().includes('mba') || programType.toLowerCase().includes('business')) {
      baseSteps.splice(4, 0, {
        id: 'work-experience',
        name: 'Work Experience',
        description: 'Detail your professional experience',
        required: true,
        completed: false,
        order: 4
      });
    }

    if (programType.toLowerCase().includes('art') || programType.toLowerCase().includes('design')) {
      baseSteps.splice(3, 0, {
        id: 'portfolio',
        name: 'Portfolio',
        description: 'Upload your creative portfolio',
        required: true,
        completed: false,
        order: 3
      });
    }

    return baseSteps.map((step, index) => ({ ...step, order: index + 1 }));
  }

  calculateProgress(applicationData: any, steps: ApplicationStep[]): number {
    const completedSteps = steps.filter(step => {
      switch (step.id) {
        case 'personal-info':
          return applicationData.personal_info && Object.keys(applicationData.personal_info).length > 0;
        case 'academic-background':
          return applicationData.academic_info && Object.keys(applicationData.academic_info).length > 0;
        case 'documents':
          return applicationData.documents && Object.keys(applicationData.documents).length > 0;
        case 'personal-statement':
          return applicationData.essays && applicationData.essays.personal_statement;
        case 'references':
          return applicationData.references && applicationData.references.length > 0;
        case 'work-experience':
          return applicationData.work_experience && applicationData.work_experience.length > 0;
        case 'portfolio':
          return applicationData.portfolio && Object.keys(applicationData.portfolio).length > 0;
        case 'additional-info':
          return true; // Optional step
        case 'review-submit':
          return false; // Only completed when submitted
        default:
          return false;
      }
    });

    const requiredSteps = steps.filter(step => step.required);
    return Math.round((completedSteps.length / requiredSteps.length) * 100);
  }

  // Status Management
  getStatusColor(status: Application['status']): string {
    switch (status) {
      case 'draft':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
      case 'in-progress':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'submitted':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'under-review':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'accepted':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'rejected':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'waitlisted':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  }

  getStatusText(status: Application['status']): string {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'in-progress':
        return 'In Progress';
      case 'submitted':
        return 'Submitted';
      case 'under-review':
        return 'Under Review';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'waitlisted':
        return 'Waitlisted';
      default:
        return 'Unknown';
    }
  }

  getDaysUntilDeadline(deadline: string): number {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDeadlineStatus(deadline: string): { color: string; text: string; urgent: boolean } {
    const daysLeft = this.getDaysUntilDeadline(deadline);
    
    if (daysLeft < 0) {
      return { color: 'text-red-600 dark:text-red-400', text: 'Deadline passed', urgent: true };
    } else if (daysLeft <= 7) {
      return { color: 'text-red-600 dark:text-red-400', text: `${daysLeft} days left`, urgent: true };
    } else if (daysLeft <= 30) {
      return { color: 'text-yellow-600 dark:text-yellow-400', text: `${daysLeft} days left`, urgent: false };
    } else {
      return { color: 'text-green-600 dark:text-green-400', text: `${daysLeft} days left`, urgent: false };
    }
  }

  // Analytics
  async getApplicationStats(userId: string): Promise<{
    total: number;
    byStatus: Record<Application['status'], number>;
    upcomingDeadlines: Application[];
    recentActivity: Application[];
  }> {
    const applications = await this.getApplications(userId);
    
    const byStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<Application['status'], number>);

    const upcomingDeadlines = applications
      .filter(app => app.status === 'draft' || app.status === 'in-progress')
      .filter(app => this.getDaysUntilDeadline(app.deadline) > 0)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);

    const recentActivity = applications
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);

    return {
      total: applications.length,
      byStatus,
      upcomingDeadlines,
      recentActivity
    };
  }
}

export const applicationService = ApplicationService.getInstance();