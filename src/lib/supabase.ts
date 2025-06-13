import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface ParsedDocumentData {
  id?: string;
  user_id: string;
  document_id: string;
  document_type: 'cv' | 'transcript' | 'statement' | 'recommendation' | 'certificate' | 'other';
  parsed_data: {
    // Academic Background
    education?: {
      institutions: Array<{
        name: string;
        degree: string;
        field: string;
        gpa?: number;
        startDate?: string;
        endDate?: string;
        location?: string;
      }>;
      certifications?: Array<{
        name: string;
        issuer: string;
        date?: string;
      }>;
    };
    
    // Professional Experience
    experience?: {
      positions: Array<{
        title: string;
        company: string;
        duration?: string;
        description?: string;
        location?: string;
      }>;
    };
    
    // Skills and Competencies
    skills?: {
      technical: string[];
      languages: Array<{
        language: string;
        proficiency: string;
      }>;
      soft_skills: string[];
    };
    
    // Academic Performance
    academic_performance?: {
      overall_gpa?: number;
      test_scores?: Array<{
        test_name: string;
        score: string;
        date?: string;
      }>;
      achievements?: string[];
    };
    
    // Preferences and Interests
    preferences?: {
      study_fields: string[];
      career_goals: string[];
      research_interests: string[];
      preferred_countries?: string[];
    };
    
    // Contact Information
    contact?: {
      email?: string;
      phone?: string;
      address?: string;
      linkedin?: string;
    };
    
    // Raw extracted text
    raw_text?: string;
  };
  confidence_score: number;
  processing_status: 'pending' | 'completed' | 'failed';
  created_at?: string;
  updated_at?: string;
}

export interface StudentProfile {
  id?: string;
  user_id: string;
  academic_background: {
    highest_education: string;
    gpa: number;
    institutions: Array<{
      name: string;
      degree: string;
      field: string;
      gpa?: number;
      graduation_year?: number;
    }>;
    test_scores: Array<{
      test_name: string;
      score: string;
      date?: string;
    }>;
  };
  skills: {
    technical: string[];
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
    soft_skills: string[];
  };
  preferences: {
    study_fields: string[];
    preferred_countries: string[];
    career_goals: string[];
    budget_range?: string;
    scholarship_required: boolean;
  };
  experience: Array<{
    title: string;
    company: string;
    duration?: string;
    description?: string;
  }>;
  contact_info: {
    email?: string;
    phone?: string;
    address?: string;
    linkedin?: string;
  };
  profile_completion: number;
  created_at?: string;
  updated_at?: string;
}