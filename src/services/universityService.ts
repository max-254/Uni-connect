export interface UniversityData {
  name: string;
  alpha_two_code: string;
  country: string;
  domains: string[];
  web_pages: string[];
  'state-province'?: string;
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
  domains: string[];
  stateProvince?: string;
  studyLevels: string[];
  courses: string[];
}

export interface CourseCategory {
  name: string;
  courses: string[];
}

export interface StudyLevel {
  id: string;
  name: string;
  description: string;
}

class UniversityService {
  private static instance: UniversityService;
  private universities: UniversityData[] = [];
  private isLoaded = false;

  // Define allowed countries - UPDATED to match your requirements
  private allowedCountries = new Set([
    // Australia
    'Australia',
    
    // China
    'China',
    'Hong Kong',
    'Macau',
    
    // Canada
    'Canada',
    
    // United States
    'United States',
    'United States of America',
    
    // Ireland
    'Ireland',
    
    // United Kingdom
    'United Kingdom',
    'England',
    'Scotland',
    'Wales',
    'Northern Ireland',
    
    // Germany
    'Germany',
    
    // France
    'France',
    
    // Belgium
    'Belgium',
    
    // Netherlands
    'Netherlands'
  ]);

  // Course categories with specific courses
  private courseCategories: CourseCategory[] = [
    {
      name: 'Business & Management',
      courses: [
        'Business Administration', 'Marketing', 'Finance', 'Accounting', 
        'International Business', 'Entrepreneurship', 'Human Resources',
        'Supply Chain Management', 'Project Management', 'Economics'
      ]
    },
    {
      name: 'Engineering & Technology',
      courses: [
        'Computer Science', 'Software Engineering', 'Electrical Engineering',
        'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering',
        'Aerospace Engineering', 'Biomedical Engineering', 'Data Science',
        'Artificial Intelligence', 'Cybersecurity', 'Information Technology'
      ]
    },
    {
      name: 'Health & Medicine',
      courses: [
        'Medicine', 'Nursing', 'Pharmacy', 'Dentistry', 'Veterinary Medicine',
        'Public Health', 'Physical Therapy', 'Occupational Therapy',
        'Medical Technology', 'Health Administration', 'Nutrition'
      ]
    },
    {
      name: 'Arts & Humanities',
      courses: [
        'Literature', 'History', 'Philosophy', 'Art', 'Music', 'Theater',
        'Creative Writing', 'Linguistics', 'Archaeology', 'Cultural Studies',
        'Fine Arts', 'Graphic Design', 'Film Studies'
      ]
    },
    {
      name: 'Natural Sciences',
      courses: [
        'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Environmental Science',
        'Geology', 'Astronomy', 'Marine Biology', 'Biotechnology',
        'Biochemistry', 'Statistics', 'Applied Mathematics'
      ]
    },
    {
      name: 'Social Sciences',
      courses: [
        'Psychology', 'Sociology', 'Political Science', 'Anthropology',
        'International Relations', 'Social Work', 'Criminology',
        'Geography', 'Urban Planning', 'Public Administration'
      ]
    },
    {
      name: 'Law & Legal Studies',
      courses: [
        'Law', 'Legal Studies', 'Criminal Justice', 'International Law',
        'Corporate Law', 'Environmental Law', 'Human Rights Law'
      ]
    },
    {
      name: 'Education',
      courses: [
        'Elementary Education', 'Secondary Education', 'Special Education',
        'Educational Psychology', 'Curriculum Development', 'Educational Leadership'
      ]
    },
    {
      name: 'Communication & Media',
      courses: [
        'Journalism', 'Mass Communication', 'Public Relations', 'Broadcasting',
        'Digital Media', 'Advertising', 'Media Studies'
      ]
    },
    {
      name: 'Agriculture & Environmental',
      courses: [
        'Agriculture', 'Forestry', 'Environmental Studies', 'Sustainable Development',
        'Agricultural Engineering', 'Food Science', 'Horticulture'
      ]
    }
  ];

  private studyLevels: StudyLevel[] = [
    {
      id: 'certificate',
      name: 'Certificate Programs',
      description: 'Short-term professional certification programs'
    },
    {
      id: 'diploma',
      name: 'Diploma Programs',
      description: 'Vocational and technical diploma programs'
    },
    {
      id: 'associate',
      name: 'Associate Degree',
      description: '2-year undergraduate programs'
    },
    {
      id: 'bachelor',
      name: 'Bachelor\'s Degree',
      description: '3-4 year undergraduate programs'
    },
    {
      id: 'master',
      name: 'Master\'s Degree',
      description: '1-2 year postgraduate programs'
    },
    {
      id: 'doctoral',
      name: 'Doctoral/PhD',
      description: 'Research-based doctoral programs'
    },
    {
      id: 'professional',
      name: 'Professional Degrees',
      description: 'Specialized professional programs (MBA, JD, MD, etc.)'
    }
  ];

  // Keywords to identify course specializations from university names
  private courseKeywords = {
    'technology': ['Computer Science', 'Information Technology', 'Software Engineering', 'Data Science'],
    'tech': ['Computer Science', 'Information Technology', 'Software Engineering', 'Data Science'],
    'engineering': ['Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Chemical Engineering'],
    'medical': ['Medicine', 'Nursing', 'Public Health', 'Medical Technology'],
    'medicine': ['Medicine', 'Nursing', 'Public Health', 'Medical Technology'],
    'health': ['Public Health', 'Nursing', 'Health Administration', 'Nutrition'],
    'business': ['Business Administration', 'Marketing', 'Finance', 'Economics'],
    'management': ['Business Administration', 'Project Management', 'Human Resources'],
    'law': ['Law', 'Legal Studies', 'Criminal Justice'],
    'arts': ['Fine Arts', 'Art', 'Creative Writing', 'Music'],
    'science': ['Biology', 'Chemistry', 'Physics', 'Mathematics'],
    'agriculture': ['Agriculture', 'Environmental Science', 'Food Science'],
    'agricultural': ['Agriculture', 'Environmental Science', 'Food Science'],
    'education': ['Elementary Education', 'Secondary Education', 'Educational Psychology'],
    'teacher': ['Elementary Education', 'Secondary Education', 'Educational Leadership'],
    'music': ['Music', 'Theater', 'Fine Arts'],
    'art': ['Fine Arts', 'Art', 'Graphic Design'],
    'design': ['Graphic Design', 'Fine Arts', 'Art'],
    'communication': ['Mass Communication', 'Journalism', 'Public Relations'],
    'journalism': ['Journalism', 'Mass Communication', 'Media Studies'],
    'psychology': ['Psychology', 'Social Work', 'Educational Psychology'],
    'social': ['Social Work', 'Sociology', 'Social Sciences'],
    'economics': ['Economics', 'Business Administration', 'Finance'],
    'finance': ['Finance', 'Economics', 'Business Administration'],
    'nursing': ['Nursing', 'Public Health', 'Health Administration'],
    'pharmacy': ['Pharmacy', 'Medicine', 'Biochemistry'],
    'dental': ['Dentistry', 'Medicine', 'Public Health'],
    'veterinary': ['Veterinary Medicine', 'Biology', 'Animal Science'],
    'environmental': ['Environmental Science', 'Environmental Studies', 'Sustainable Development'],
    'marine': ['Marine Biology', 'Biology', 'Environmental Science'],
    'international': ['International Relations', 'International Business', 'International Law'],
    'public': ['Public Administration', 'Public Health', 'Public Relations'],
    'applied': ['Applied Mathematics', 'Applied Sciences', 'Engineering'],
    'research': ['Research', 'Biology', 'Chemistry', 'Physics'],
    'institute': ['Research', 'Technology', 'Science'],
    'polytechnic': ['Engineering', 'Technology', 'Applied Sciences'],
    'college': ['Liberal Arts', 'General Studies', 'Education']
  };

  private constructor() {}

  static getInstance(): UniversityService {
    if (!UniversityService.instance) {
      UniversityService.instance = new UniversityService();
    }
    return UniversityService.instance;
  }

  private isAllowedCountry(country: string): boolean {
    return this.allowedCountries.has(country);
  }

  async fetchUniversities(): Promise<UniversityData[]> {
    if (this.isLoaded) {
      return this.universities;
    }

    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: UniversityData[] = await response.json();
      
      // Filter universities to only include allowed countries/regions
      this.universities = data.filter(uni => this.isAllowedCountry(uni.country));
      this.isLoaded = true;
      
      return this.universities;
    } catch (error) {
      console.error('Error fetching universities:', error);
      throw new Error('Failed to fetch universities data');
    }
  }

  async getUniversitiesByCountry(country: string): Promise<UniversityData[]> {
    const universities = await this.fetchUniversities();
    return universities.filter(
      uni => uni.country.toLowerCase() === country.toLowerCase()
    );
  }

  async searchUniversities(query: string): Promise<UniversityData[]> {
    const universities = await this.fetchUniversities();
    const searchTerm = query.toLowerCase();
    
    return universities.filter(
      uni => 
        uni.name.toLowerCase().includes(searchTerm) ||
        uni.country.toLowerCase().includes(searchTerm) ||
        (uni['state-province'] && uni['state-province'].toLowerCase().includes(searchTerm))
    );
  }

  async getCountries(): Promise<string[]> {
    const universities = await this.fetchUniversities();
    const countries = [...new Set(universities.map(uni => uni.country))];
    return countries.sort();
  }

  getCourseCategories(): CourseCategory[] {
    return this.courseCategories;
  }

  getAllCourses(): string[] {
    return this.courseCategories.flatMap(category => category.courses).sort();
  }

  getStudyLevels(): StudyLevel[] {
    return this.studyLevels;
  }

  // Extract courses based on university name and type
  private extractCoursesFromUniversityName(universityName: string): string[] {
    const name = universityName.toLowerCase();
    const extractedCourses: string[] = [];
    
    // Check for specific keywords in university name
    Object.entries(this.courseKeywords).forEach(([keyword, courses]) => {
      if (name.includes(keyword)) {
        extractedCourses.push(...courses);
      }
    });

    // If no specific courses found, add general courses based on university type
    if (extractedCourses.length === 0) {
      // Check for university type indicators
      if (name.includes('university') || name.includes('college')) {
        // General university - add diverse courses
        const generalCourses = [
          'Business Administration', 'Computer Science', 'Psychology', 'Biology',
          'Mathematics', 'History', 'Economics', 'Literature'
        ];
        extractedCourses.push(...generalCourses);
      } else if (name.includes('institute')) {
        // Institute - more specialized/technical
        const instituteCourses = [
          'Computer Science', 'Engineering', 'Research', 'Technology',
          'Applied Sciences', 'Data Science'
        ];
        extractedCourses.push(...instituteCourses);
      } else {
        // Default courses for any educational institution
        const defaultCourses = [
          'Business Administration', 'Computer Science', 'Mathematics', 'Literature'
        ];
        extractedCourses.push(...defaultCourses);
      }
    }

    // Add some random additional courses to make it more realistic
    const allCourses = this.getAllCourses();
    const additionalCourses = allCourses
      .filter(course => !extractedCourses.includes(course))
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 5) + 2);
    
    extractedCourses.push(...additionalCourses);

    // Remove duplicates and return
    return [...new Set(extractedCourses)];
  }

  // Generate international student fees based on country and university type
  private generateInternationalFees(country: string, universityName: string) {
    const name = universityName.toLowerCase();
    const isPrivate = name.includes('private') || name.includes('international') || Math.random() > 0.7;
    const isPremium = name.includes('harvard') || name.includes('oxford') || name.includes('cambridge') || name.includes('stanford') || Math.random() > 0.9;
    
    const feeStructures: Record<string, any> = {
      'United States': {
        currency: 'USD',
        tuitionFee: isPremium ? '$45,000 - $75,000' : isPrivate ? '$25,000 - $55,000' : '$15,000 - $35,000',
        applicationFee: '$50 - $150',
        livingCosts: '$12,000 - $20,000',
        totalEstimate: isPremium ? '$60,000 - $95,000' : isPrivate ? '$40,000 - $75,000' : '$30,000 - $55,000'
      },
      'United States of America': {
        currency: 'USD',
        tuitionFee: isPremium ? '$45,000 - $75,000' : isPrivate ? '$25,000 - $55,000' : '$15,000 - $35,000',
        applicationFee: '$50 - $150',
        livingCosts: '$12,000 - $20,000',
        totalEstimate: isPremium ? '$60,000 - $95,000' : isPrivate ? '$40,000 - $75,000' : '$30,000 - $55,000'
      },
      'United Kingdom': {
        currency: 'GBP',
        tuitionFee: isPremium ? '£25,000 - £45,000' : isPrivate ? '£18,000 - £35,000' : '£12,000 - £25,000',
        applicationFee: '£20 - £75',
        livingCosts: '£10,000 - £15,000',
        totalEstimate: isPremium ? '£35,000 - £60,000' : isPrivate ? '£28,000 - £50,000' : '£22,000 - £40,000'
      },
      'England': {
        currency: 'GBP',
        tuitionFee: isPremium ? '£25,000 - £45,000' : isPrivate ? '£18,000 - £35,000' : '£12,000 - £25,000',
        applicationFee: '£20 - £75',
        livingCosts: '£10,000 - £15,000',
        totalEstimate: isPremium ? '£35,000 - £60,000' : isPrivate ? '£28,000 - £50,000' : '£22,000 - £40,000'
      },
      'Scotland': {
        currency: 'GBP',
        tuitionFee: isPremium ? '£25,000 - £45,000' : isPrivate ? '£18,000 - £35,000' : '£12,000 - £25,000',
        applicationFee: '£20 - £75',
        livingCosts: '£9,000 - £14,000',
        totalEstimate: isPremium ? '£34,000 - £59,000' : isPrivate ? '£27,000 - £49,000' : '£21,000 - £39,000'
      },
      'Wales': {
        currency: 'GBP',
        tuitionFee: isPremium ? '£25,000 - £45,000' : isPrivate ? '£18,000 - £35,000' : '£12,000 - £25,000',
        applicationFee: '£20 - £75',
        livingCosts: '£9,000 - £13,000',
        totalEstimate: isPremium ? '£34,000 - £58,000' : isPrivate ? '£27,000 - £48,000' : '£21,000 - £38,000'
      },
      'Northern Ireland': {
        currency: 'GBP',
        tuitionFee: isPremium ? '£25,000 - £45,000' : isPrivate ? '£18,000 - £35,000' : '£12,000 - £25,000',
        applicationFee: '£20 - £75',
        livingCosts: '£8,000 - £12,000',
        totalEstimate: isPremium ? '£33,000 - £57,000' : isPrivate ? '£26,000 - £47,000' : '£20,000 - £37,000'
      },
      'Canada': {
        currency: 'CAD',
        tuitionFee: isPremium ? '$35,000 - $60,000' : isPrivate ? '$20,000 - $45,000' : '$12,000 - $30,000',
        applicationFee: '$50 - $200',
        livingCosts: '$12,000 - $18,000',
        totalEstimate: isPremium ? '$50,000 - $78,000' : isPrivate ? '$35,000 - $63,000' : '$25,000 - $48,000'
      },
      'Australia': {
        currency: 'AUD',
        tuitionFee: isPremium ? '$40,000 - $65,000' : isPrivate ? '$25,000 - $50,000' : '$18,000 - $35,000',
        applicationFee: '$50 - $150',
        livingCosts: '$15,000 - $25,000',
        totalEstimate: isPremium ? '$55,000 - $90,000' : isPrivate ? '$40,000 - $75,000' : '$33,000 - $60,000'
      },
      'Germany': {
        currency: 'EUR',
        tuitionFee: isPrivate ? '€15,000 - €35,000' : '€500 - €3,500',
        applicationFee: '€50 - €150',
        livingCosts: '€8,000 - €12,000',
        totalEstimate: isPrivate ? '€23,000 - €47,000' : '€8,500 - €15,500'
      },
      'France': {
        currency: 'EUR',
        tuitionFee: isPrivate ? '€8,000 - €25,000' : '€2,770 - €3,770',
        applicationFee: '€30 - €100',
        livingCosts: '€9,000 - €15,000',
        totalEstimate: isPrivate ? '€17,000 - €40,000' : '€12,000 - €19,000'
      },
      'Netherlands': {
        currency: 'EUR',
        tuitionFee: isPremium ? '€15,000 - €25,000' : '€8,000 - €18,000',
        applicationFee: '€50 - €100',
        livingCosts: '€10,000 - €15,000',
        totalEstimate: isPremium ? '€25,000 - €40,000' : '€18,000 - €33,000'
      },
      'Belgium': {
        currency: 'EUR',
        tuitionFee: isPrivate ? '€8,000 - €20,000' : '€835 - €4,175',
        applicationFee: '€50 - €100',
        livingCosts: '€8,000 - €12,000',
        totalEstimate: isPrivate ? '€16,000 - €32,000' : '€9,000 - €16,000'
      },
      'Ireland': {
        currency: 'EUR',
        tuitionFee: isPremium ? '€20,000 - €35,000' : '€10,000 - €25,000',
        applicationFee: '€50 - €150',
        livingCosts: '€9,000 - €15,000',
        totalEstimate: isPremium ? '€29,000 - €50,000' : '€19,000 - €40,000'
      },
      'China': {
        currency: 'CNY',
        tuitionFee: isPrivate ? '¥30,000 - 80,000' : '¥15,000 - 40,000',
        applicationFee: '¥400 - 800',
        livingCosts: '¥20,000 - 40,000',
        totalEstimate: isPrivate ? '¥50,000 - 120,000' : '¥35,000 - 80,000'
      },
      'Hong Kong': {
        currency: 'HKD',
        tuitionFee: 'HK$140,000 - 280,000',
        applicationFee: 'HK$300 - 500',
        livingCosts: 'HK$80,000 - 120,000',
        totalEstimate: 'HK$220,000 - 400,000'
      },
      'Macau': {
        currency: 'MOP',
        tuitionFee: 'MOP$50,000 - 120,000',
        applicationFee: 'MOP$200 - 500',
        livingCosts: 'MOP$40,000 - 80,000',
        totalEstimate: 'MOP$90,000 - 200,000'
      }
    };

    const defaultFees = {
      currency: 'EUR',
      tuitionFee: isPrivate ? '€8,000 - €25,000' : '€3,000 - €15,000',
      applicationFee: '€50 - €150',
      livingCosts: '€6,000 - €12,000',
      totalEstimate: isPrivate ? '€14,000 - €37,000' : '€9,000 - €27,000'
    };

    const fees = feeStructures[country] || defaultFees;
    
    return {
      ...fees,
      scholarshipAvailable: Math.random() > 0.4,
      financialAidPercentage: Math.random() > 0.6 ? `${Math.floor(Math.random() * 50) + 10}%` : undefined
    };
  }

  // Transform raw university data to our app's University interface
  transformToAppUniversity(universityData: UniversityData): University {
    const extractedCourses = this.extractCoursesFromUniversityName(universityData.name);
    
    return {
      id: this.generateId(universityData.name, universityData.country),
      name: universityData.name,
      country: universityData.country,
      logo: this.generateLogoUrl(universityData.name),
      description: `${universityData.name} is a prestigious institution located in ${universityData.country}${universityData['state-province'] ? `, ${universityData['state-province']}` : ''}.`,
      programs: extractedCourses.slice(0, 8), // Use extracted courses for programs
      tuitionRange: this.generateTuitionRange(universityData.country),
      internationalFees: this.generateInternationalFees(universityData.country, universityData.name),
      acceptanceRate: this.generateAcceptanceRate(),
      applicationDeadline: this.generateDeadline(),
      scholarshipsAvailable: Math.random() > 0.3,
      requirements: {
        gpa: Math.round((Math.random() * 1.5 + 2.5) * 10) / 10,
        languageTest: this.getLanguageTest(universityData.country),
        otherTests: this.generateOtherTests()
      },
      domains: universityData.domains,
      stateProvince: universityData['state-province'],
      studyLevels: this.generateStudyLevels(),
      courses: extractedCourses // Use extracted courses
    };
  }

  private generateId(name: string, country: string): string {
    return `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${country.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }

  private generateLogoUrl(name: string): string {
    // Generate a placeholder logo URL
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&size=200&background=random&color=fff&format=png`;
  }

  private generateStudyLevels(): string[] {
    const levels = this.studyLevels.map(level => level.id);
    const numLevels = Math.floor(Math.random() * 4) + 2; // 2-6 study levels per university
    const shuffled = levels.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numLevels);
  }

  private generateTuitionRange(country: string): string {
    const ranges: Record<string, string> = {
      'United States': '$20,000 - $60,000',
      'United States of America': '$20,000 - $60,000',
      'United Kingdom': '$15,000 - $45,000',
      'England': '$15,000 - $45,000',
      'Scotland': '$15,000 - $45,000',
      'Wales': '$15,000 - $45,000',
      'Northern Ireland': '$15,000 - $45,000',
      'Canada': '$12,000 - $35,000',
      'Australia': '$18,000 - $50,000',
      'Germany': '$500 - $3,000',
      'France': '$200 - $15,000',
      'Netherlands': '$2,000 - $20,000',
      'Belgium': '$1,000 - $15,000',
      'Ireland': '$10,000 - $30,000',
      'China': '$3,000 - $15,000',
      'Hong Kong': '$15,000 - $30,000',
      'Macau': '$8,000 - $20,000'
    };
    
    return ranges[country] || '$5,000 - $25,000';
  }

  private generateAcceptanceRate(): string {
    const rate = Math.floor(Math.random() * 70) + 15;
    return `${rate}%`;
  }

  private generateDeadline(): string {
    const dates = [
      '2025-01-15', '2025-02-01', '2025-03-15', '2025-04-01',
      '2025-05-15', '2025-06-01', '2025-12-01', '2025-11-15'
    ];
    return dates[Math.floor(Math.random() * dates.length)];
  }

  private getLanguageTest(country: string): string {
    const englishSpeaking = ['United States', 'United States of America', 'United Kingdom', 'England', 'Scotland', 'Wales', 'Northern Ireland', 'Canada', 'Australia', 'Ireland'];
    
    if (englishSpeaking.includes(country)) {
      return Math.random() > 0.5 ? 'IELTS 6.5' : 'TOEFL 90';
    }
    
    const tests: Record<string, string> = {
      'Germany': 'German B2 or IELTS 6.5',
      'France': 'French B2 or IELTS 6.5',
      'Belgium': 'Dutch/French B2 or IELTS 6.5',
      'Netherlands': 'IELTS 6.5',
      'China': 'HSK 4 or IELTS 6.0',
      'Hong Kong': 'IELTS 6.0',
      'Macau': 'Chinese/Portuguese B2 or IELTS 6.0'
    };
    
    return tests[country] || 'IELTS 6.5';
  }

  private generateOtherTests(): string[] {
    const tests = ['SAT', 'GRE', 'GMAT', 'MCAT', 'LSAT'];
    const numTests = Math.floor(Math.random() * 3);
    const shuffled = tests.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numTests);
  }
}

export const universityService = UniversityService.getInstance();