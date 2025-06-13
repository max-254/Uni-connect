export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin' | 'university';
  profileComplete: boolean;
}

export interface University {
  id: string;
  name: string;
  country: string;
  logo: string;
  description: string;
  programs: string[];
  tuitionRange: string;
  internationalFees: {
    tuitionFee: string;
    applicationFee: string;
    livingCosts: string;
    totalEstimate: string;
    currency: string;
    scholarshipAvailable: boolean;
    financialAidPercentage?: string;
  };
  acceptanceRate: string;
  applicationDeadline: string;
  scholarshipsAvailable: boolean;
  requirements: {
    gpa: number;
    languageTest: string;
    otherTests?: string[];
  };
  category?: 'reach' | 'match' | 'safety';
}

export interface StudentProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
  };
  academicBackground: {
    highestEducation: string;
    gpa: number;
    university?: string;
    major?: string;
    graduationYear?: number;
  };
  preferences: {
    countries: string[];
    majors: string[];
    budget: string;
    scholarshipRequired: boolean;
  };
  testScores: {
    ielts?: number;
    toefl?: number;
    gre?: number;
    gmat?: number;
    other?: Record<string, number>;
  };
  documents: {
    transcripts: string[];
    cv: string[];
    sop: string[];
    lor: string[];
    testScores: string[];
    other: string[];
  };
  completionPercentage: number;
}

export interface ApplicationStatus {
  id: string;
  universityId: string;
  universityName: string;
  programName: string;
  status: 'pending' | 'in-review' | 'submitted' | 'accepted' | 'rejected';
  updatedAt: string;
  notes?: string;
}

export type ScreeningStatus = 'pending' | 'in-review' | 'complete';
export type MatchingStatus = 'pending' | 'complete';

export interface MatchingResult {
  screeningStatus: ScreeningStatus;
  matchingStatus: MatchingStatus;
  matchedUniversities: University[];
}