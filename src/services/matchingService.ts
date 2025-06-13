import { documentParsingService } from './documentParsingService';
import { universityService, University } from './universityService';
import { StudentProfile } from '../lib/supabase';

interface MatchingCriteria {
  academicFit: number;
  programFit: number;
  locationPreference: number;
  financialFit: number;
  requirementsFit: number;
}

interface UniversityMatch extends University {
  matchScore: number;
  matchCategory: 'reach' | 'match' | 'safety';
  matchingCriteria: MatchingCriteria;
  matchReasons: string[];
  concerns: string[];
}

interface MatchingRecommendations {
  totalMatches: number;
  reachSchools: UniversityMatch[];
  matchSchools: UniversityMatch[];
  safetySchools: UniversityMatch[];
  topRecommendations: UniversityMatch[];
  insights: {
    strongestAreas: string[];
    improvementAreas: string[];
    recommendations: string[];
  };
}

class MatchingService {
  private static instance: MatchingService;

  static getInstance(): MatchingService {
    if (!MatchingService.instance) {
      MatchingService.instance = new MatchingService();
    }
    return MatchingService.instance;
  }

  async generateUniversityRecommendations(userId: string): Promise<MatchingRecommendations> {
    try {
      // Get student profile and parsed documents
      const [studentProfile, parsedDocuments] = await Promise.all([
        documentParsingService.getStudentProfile(userId),
        documentParsingService.getParsedDocuments(userId)
      ]);

      if (!studentProfile) {
        throw new Error('Student profile not found');
      }

      // Get all universities
      const universitiesData = await universityService.fetchUniversities();
      
      // Transform and filter universities (limit for performance)
      const universities = universitiesData
        .slice(0, 500) // Limit for demo purposes
        .map(uni => universityService.transformToAppUniversity(uni));

      // Calculate matches for each university
      const matches = universities.map(university => 
        this.calculateUniversityMatch(studentProfile, university, parsedDocuments)
      );

      // Sort by match score
      const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore);

      // Categorize matches
      const reachSchools = sortedMatches.filter(match => match.matchCategory === 'reach').slice(0, 10);
      const matchSchools = sortedMatches.filter(match => match.matchCategory === 'match').slice(0, 15);
      const safetySchools = sortedMatches.filter(match => match.matchCategory === 'safety').slice(0, 10);

      // Get top recommendations across all categories
      const topRecommendations = sortedMatches.slice(0, 20);

      // Generate insights
      const insights = this.generateInsights(studentProfile, parsedDocuments, topRecommendations);

      return {
        totalMatches: sortedMatches.length,
        reachSchools,
        matchSchools,
        safetySchools,
        topRecommendations,
        insights
      };
    } catch (error) {
      console.error('Error generating university recommendations:', error);
      throw new Error('Failed to generate university recommendations');
    }
  }

  private calculateUniversityMatch(
    studentProfile: StudentProfile, 
    university: University,
    parsedDocuments: any[]
  ): UniversityMatch {
    const criteria: MatchingCriteria = {
      academicFit: this.calculateAcademicFit(studentProfile, university),
      programFit: this.calculateProgramFit(studentProfile, university),
      locationPreference: this.calculateLocationFit(studentProfile, university),
      financialFit: this.calculateFinancialFit(studentProfile, university),
      requirementsFit: this.calculateRequirementsFit(studentProfile, university)
    };

    // Calculate overall match score (weighted average)
    const weights = {
      academicFit: 0.25,
      programFit: 0.30,
      locationPreference: 0.15,
      financialFit: 0.15,
      requirementsFit: 0.15
    };

    const matchScore = Object.entries(criteria).reduce((total, [key, value]) => {
      return total + (value * weights[key as keyof MatchingCriteria]);
    }, 0);

    // Determine match category
    const matchCategory = this.determineMatchCategory(studentProfile, university, matchScore);

    // Generate match reasons and concerns
    const { matchReasons, concerns } = this.generateMatchAnalysis(studentProfile, university, criteria);

    return {
      ...university,
      matchScore: Math.round(matchScore),
      matchCategory,
      matchingCriteria: criteria,
      matchReasons,
      concerns
    };
  }

  private calculateAcademicFit(studentProfile: StudentProfile, university: University): number {
    let score = 50; // Base score

    // GPA comparison
    const studentGPA = studentProfile.academic_background?.gpa || 0;
    const requiredGPA = university.requirements?.gpa || 2.5;

    if (studentGPA >= requiredGPA + 0.5) {
      score += 30; // Exceeds requirements significantly
    } else if (studentGPA >= requiredGPA) {
      score += 20; // Meets requirements
    } else if (studentGPA >= requiredGPA - 0.3) {
      score += 10; // Close to requirements
    } else {
      score -= 20; // Below requirements
    }

    // Education level match
    const highestEducation = studentProfile.academic_background?.highest_education?.toLowerCase() || '';
    const universityLevels = university.studyLevels || [];

    if (highestEducation.includes('bachelor') && universityLevels.includes('master')) {
      score += 15; // Good progression
    } else if (highestEducation.includes('master') && universityLevels.includes('doctoral')) {
      score += 15; // Good progression
    }

    // Test scores (if available)
    const testScores = studentProfile.academic_background?.test_scores || [];
    if (testScores.length > 0) {
      score += 10; // Has standardized test scores
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateProgramFit(studentProfile: StudentProfile, university: University): number {
    let score = 30; // Base score

    const studentFields = studentProfile.preferences?.study_fields || [];
    const universityCourses = university.courses || [];
    const universityPrograms = university.programs || [];

    // Check for direct program matches
    const directMatches = studentFields.filter(field => 
      universityCourses.some(course => 
        course.toLowerCase().includes(field.toLowerCase()) ||
        field.toLowerCase().includes(course.toLowerCase())
      ) ||
      universityPrograms.some(program => 
        program.toLowerCase().includes(field.toLowerCase()) ||
        field.toLowerCase().includes(program.toLowerCase())
      )
    );

    if (directMatches.length > 0) {
      score += 40 * (directMatches.length / studentFields.length);
    }

    // Check for related field matches
    const relatedMatches = this.findRelatedFields(studentFields, universityCourses);
    if (relatedMatches.length > 0) {
      score += 20 * (relatedMatches.length / studentFields.length);
    }

    // Bonus for diverse program offerings
    if (universityCourses.length > 10) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateLocationFit(studentProfile: StudentProfile, university: University): number {
    let score = 50; // Base score

    const preferredCountries = studentProfile.preferences?.preferred_countries || [];
    
    if (preferredCountries.length === 0) {
      return 70; // No preference specified, neutral score
    }

    // Check if university country matches preferences
    const countryMatch = preferredCountries.some(country => 
      country.toLowerCase() === university.country.toLowerCase()
    );

    if (countryMatch) {
      score += 40;
    } else {
      // Check for regional matches (e.g., EU countries, English-speaking countries)
      const universityCountry = university.country.toLowerCase();
      const hasRegionalMatch = preferredCountries.some(prefCountry => {
        return this.areCountriesInSameRegion(prefCountry.toLowerCase(), universityCountry);
      });

      if (hasRegionalMatch) {
        score += 20;
      } else {
        score -= 20;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateFinancialFit(studentProfile: StudentProfile, university: University): number {
    let score = 50; // Base score

    const scholarshipRequired = studentProfile.preferences?.scholarship_required || false;
    const scholarshipAvailable = university.scholarshipsAvailable || university.internationalFees?.scholarshipAvailable;

    if (scholarshipRequired) {
      if (scholarshipAvailable) {
        score += 30;
      } else {
        score -= 30;
      }
    }

    // Analyze tuition costs (simplified analysis)
    const tuitionInfo = university.internationalFees?.tuitionFee || '';
    const isAffordable = this.analyzeTuitionAffordability(tuitionInfo, university.country);

    if (isAffordable) {
      score += 20;
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateRequirementsFit(studentProfile: StudentProfile, university: University): number {
    let score = 60; // Base score

    // Language requirements
    const languageTest = university.requirements?.languageTest || '';
    if (languageTest.toLowerCase().includes('ielts') || languageTest.toLowerCase().includes('toefl')) {
      // Assume student can meet English requirements (in real app, check actual scores)
      score += 20;
    }

    // GPA requirements
    const studentGPA = studentProfile.academic_background?.gpa || 0;
    const requiredGPA = university.requirements?.gpa || 2.5;

    if (studentGPA >= requiredGPA) {
      score += 20;
    } else {
      score -= 20;
    }

    return Math.min(100, Math.max(0, score));
  }

  private determineMatchCategory(
    studentProfile: StudentProfile, 
    university: University, 
    matchScore: number
  ): 'reach' | 'match' | 'safety' {
    const studentGPA = studentProfile.academic_background?.gpa || 0;
    const requiredGPA = university.requirements?.gpa || 2.5;
    const acceptanceRate = parseInt(university.acceptanceRate?.replace('%', '') || '50');

    // Reach schools: High standards, low acceptance rate, or student below requirements
    if (acceptanceRate < 30 || studentGPA < requiredGPA - 0.2 || matchScore < 60) {
      return 'reach';
    }

    // Safety schools: High acceptance rate and student exceeds requirements
    if (acceptanceRate > 70 && studentGPA > requiredGPA + 0.3 && matchScore > 80) {
      return 'safety';
    }

    // Match schools: Everything else
    return 'match';
  }

  private generateMatchAnalysis(
    studentProfile: StudentProfile, 
    university: University, 
    criteria: MatchingCriteria
  ): { matchReasons: string[]; concerns: string[] } {
    const matchReasons: string[] = [];
    const concerns: string[] = [];

    // Academic fit analysis
    if (criteria.academicFit > 70) {
      matchReasons.push('Strong academic profile match');
    } else if (criteria.academicFit < 50) {
      concerns.push('Academic requirements may be challenging');
    }

    // Program fit analysis
    if (criteria.programFit > 70) {
      matchReasons.push('Excellent program alignment with your interests');
    } else if (criteria.programFit < 50) {
      concerns.push('Limited programs matching your field of interest');
    }

    // Location analysis
    if (criteria.locationPreference > 70) {
      matchReasons.push('Located in your preferred region');
    } else if (criteria.locationPreference < 50) {
      concerns.push('Location may not align with your preferences');
    }

    // Financial analysis
    if (criteria.financialFit > 70) {
      matchReasons.push('Good financial fit with scholarship opportunities');
    } else if (criteria.financialFit < 50) {
      concerns.push('May be financially challenging');
    }

    // Requirements analysis
    if (criteria.requirementsFit > 70) {
      matchReasons.push('You meet all admission requirements');
    } else if (criteria.requirementsFit < 50) {
      concerns.push('Some admission requirements may need attention');
    }

    return { matchReasons, concerns };
  }

  private generateInsights(
    studentProfile: StudentProfile,
    parsedDocuments: any[],
    topMatches: UniversityMatch[]
  ) {
    const strongestAreas: string[] = [];
    const improvementAreas: string[] = [];
    const recommendations: string[] = [];

    // Analyze student strengths
    const gpa = studentProfile.academic_background?.gpa || 0;
    if (gpa > 3.5) {
      strongestAreas.push('Strong Academic Performance');
    }

    const technicalSkills = studentProfile.skills?.technical?.length || 0;
    if (technicalSkills > 5) {
      strongestAreas.push('Diverse Technical Skills');
    }

    const languages = studentProfile.skills?.languages?.length || 0;
    if (languages > 1) {
      strongestAreas.push('Multilingual Abilities');
    }

    // Identify improvement areas
    if (gpa < 3.0) {
      improvementAreas.push('Academic Performance');
      recommendations.push('Consider retaking courses to improve GPA');
    }

    if (technicalSkills < 3) {
      improvementAreas.push('Technical Skills');
      recommendations.push('Develop more technical skills relevant to your field');
    }

    if (!studentProfile.preferences?.study_fields?.length) {
      improvementAreas.push('Field Specialization');
      recommendations.push('Define your academic interests more clearly');
    }

    // Generate recommendations based on matches
    const topCountries = this.getTopCountries(topMatches);
    if (topCountries.length > 0) {
      recommendations.push(`Consider focusing on universities in ${topCountries.slice(0, 3).join(', ')}`);
    }

    const avgMatchScore = topMatches.reduce((sum, match) => sum + match.matchScore, 0) / topMatches.length;
    if (avgMatchScore > 80) {
      recommendations.push('You have excellent university options - apply to a mix of reach and match schools');
    } else if (avgMatchScore > 60) {
      recommendations.push('Consider improving your profile to access more competitive programs');
    } else {
      recommendations.push('Focus on building a stronger academic and extracurricular profile');
    }

    return {
      strongestAreas,
      improvementAreas,
      recommendations
    };
  }

  private findRelatedFields(studentFields: string[], universityCourses: string[]): string[] {
    const relatedFieldMap: Record<string, string[]> = {
      'computer science': ['software engineering', 'data science', 'artificial intelligence', 'cybersecurity'],
      'business': ['economics', 'finance', 'marketing', 'management'],
      'engineering': ['mechanical engineering', 'electrical engineering', 'civil engineering'],
      'medicine': ['nursing', 'public health', 'pharmacy', 'dentistry'],
      'psychology': ['sociology', 'social work', 'counseling'],
      'biology': ['biochemistry', 'biotechnology', 'marine biology', 'environmental science']
    };

    const related: string[] = [];
    
    studentFields.forEach(field => {
      const fieldLower = field.toLowerCase();
      Object.entries(relatedFieldMap).forEach(([key, relatedFields]) => {
        if (fieldLower.includes(key) || key.includes(fieldLower)) {
          const matches = universityCourses.filter(course =>
            relatedFields.some(related => 
              course.toLowerCase().includes(related) || related.includes(course.toLowerCase())
            )
          );
          related.push(...matches);
        }
      });
    });

    return [...new Set(related)];
  }

  private areCountriesInSameRegion(country1: string, country2: string): boolean {
    const regions = {
      'english_speaking': ['united states', 'united kingdom', 'canada', 'australia', 'new zealand', 'ireland'],
      'european_union': ['germany', 'france', 'netherlands', 'sweden', 'denmark', 'finland', 'austria', 'belgium'],
      'nordic': ['sweden', 'norway', 'denmark', 'finland', 'iceland'],
      'asia_pacific': ['japan', 'south korea', 'singapore', 'hong kong', 'taiwan']
    };

    return Object.values(regions).some(region => 
      region.includes(country1) && region.includes(country2)
    );
  }

  private analyzeTuitionAffordability(tuitionInfo: string, country: string): boolean {
    // Simplified affordability analysis
    // In a real app, this would consider student's budget preferences
    
    const lowCostCountries = ['germany', 'france', 'norway', 'sweden', 'finland'];
    if (lowCostCountries.includes(country.toLowerCase())) {
      return true;
    }

    // Check for "free" or low numbers in tuition info
    if (tuitionInfo.toLowerCase().includes('free') || 
        tuitionInfo.includes('€500') || 
        tuitionInfo.includes('$3,000')) {
      return true;
    }

    return false; // Conservative approach
  }

  private getTopCountries(matches: UniversityMatch[]): string[] {
    const countryCount: Record<string, number> = {};
    
    matches.forEach(match => {
      countryCount[match.country] = (countryCount[match.country] || 0) + 1;
    });

    return Object.entries(countryCount)
      .sort(([,a], [,b]) => b - a)
      .map(([country]) => country);
  }
}

export const matchingService = MatchingService.getInstance();
export type { UniversityMatch, MatchingRecommendations, MatchingCriteria };