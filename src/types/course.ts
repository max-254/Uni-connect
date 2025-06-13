export interface Course {
  id: string;
  title: string;
  description: string;
  university: string;
  level: string;
  duration: string;
  durationMonths: number;
  startDate: string;
  startDateRaw: string;
  fees: string;
  feesAmount: number;
  classSize: string;
  isPopular: boolean;
  isOnline: boolean;
  requiresTestScores: boolean;
  highlights: string[];
  eligibility: string[];
  applicationDeadline: string;
  curriculum?: {
    modules: {
      title: string;
      description: string;
      topics: string[];
    }[];
  };
  faculty?: {
    name: string;
    title: string;
    bio: string;
    image?: string;
  }[];
  careerOutcomes?: string[];
}