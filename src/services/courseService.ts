import { Course } from '../types/course';

class CourseService {
  private static instance: CourseService;

  static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  async getCourses(): Promise<Course[]> {
    // In a real app, this would be an API call
    // For demo purposes, we'll return mock data
    return [
      {
        id: 'cs-101',
        title: 'Master of Computer Science',
        description: 'A comprehensive program covering advanced topics in computer science, including artificial intelligence, machine learning, and software engineering.',
        university: 'University of Technology',
        level: 'Graduate',
        duration: '2 years',
        durationMonths: 24,
        startDate: 'September 2025',
        startDateRaw: '2025-09-01',
        fees: '$35,000 per year',
        feesAmount: 35000,
        classSize: '30-40 students',
        isPopular: true,
        isOnline: false,
        requiresTestScores: true,
        highlights: [
          'World-class faculty with industry experience',
          'State-of-the-art research facilities',
          'Internship opportunities with leading tech companies',
          'Specialization tracks in AI, cybersecurity, and data science'
        ],
        eligibility: [
          'Bachelor\'s degree in Computer Science or related field',
          'Minimum GPA of 3.0',
          'GRE scores (minimum 310)',
          'TOEFL/IELTS for international students'
        ],
        applicationDeadline: '2025-05-15'
      },
      {
        id: 'mba-202',
        title: 'Master of Business Administration',
        description: 'A prestigious MBA program designed to develop future business leaders with a focus on innovation, entrepreneurship, and global business strategies.',
        university: 'Global Business School',
        level: 'Graduate',
        duration: '18 months',
        durationMonths: 18,
        startDate: 'January 2026',
        startDateRaw: '2026-01-15',
        fees: '$45,000 per year',
        feesAmount: 45000,
        classSize: '50-60 students',
        isPopular: true,
        isOnline: false,
        requiresTestScores: true,
        highlights: [
          'Ranked in top 20 MBA programs globally',
          'International study trips to business hubs',
          'Executive mentorship program',
          'Strong alumni network in Fortune 500 companies'
        ],
        eligibility: [
          'Bachelor\'s degree in any discipline',
          'Minimum 2 years of professional experience',
          'GMAT/GRE scores',
          'Leadership potential and team skills'
        ],
        applicationDeadline: '2025-10-30'
      },
      {
        id: 'ds-303',
        title: 'Data Science Certificate',
        description: 'An intensive program covering the fundamentals of data science, including statistical analysis, machine learning, and data visualization.',
        university: 'Tech Institute',
        level: 'Professional',
        duration: '6 months',
        durationMonths: 6,
        startDate: 'March 2025',
        startDateRaw: '2025-03-01',
        fees: '$12,000 total',
        feesAmount: 12000,
        classSize: '25 students',
        isPopular: false,
        isOnline: true,
        requiresTestScores: false,
        highlights: [
          'Hands-on projects with real-world datasets',
          'Industry-aligned curriculum',
          'Career coaching and job placement assistance',
          'Flexible online learning format'
        ],
        eligibility: [
          'Bachelor\'s degree (preferably in a quantitative field)',
          'Basic programming knowledge',
          'Understanding of statistics fundamentals',
          'No standardized tests required'
        ],
        applicationDeadline: '2025-02-15'
      },
      {
        id: 'eng-404',
        title: 'Bachelor of Engineering in Robotics',
        description: 'A cutting-edge undergraduate program focused on robotics engineering, mechatronics, and autonomous systems design.',
        university: 'National Engineering University',
        level: 'Undergraduate',
        duration: '4 years',
        durationMonths: 48,
        startDate: 'August 2025',
        startDateRaw: '2025-08-15',
        fees: '$28,000 per year',
        feesAmount: 28000,
        classSize: '60 students',
        isPopular: false,
        isOnline: false,
        requiresTestScores: true,
        highlights: [
          'Dedicated robotics lab with industry-standard equipment',
          'Annual robotics competition participation',
          'Industry partnerships for internships',
          'Senior capstone project with industry mentors'
        ],
        eligibility: [
          'High school diploma or equivalent',
          'Strong background in mathematics and physics',
          'SAT/ACT scores',
          'Demonstrated interest in engineering or robotics'
        ],
        applicationDeadline: '2025-04-01'
      },
      {
        id: 'med-505',
        title: 'Doctor of Medicine',
        description: 'A comprehensive medical program preparing students for careers as physicians with a focus on patient-centered care and medical innovation.',
        university: 'Medical Sciences University',
        level: 'Graduate',
        duration: '4 years',
        durationMonths: 48,
        startDate: 'August 2025',
        startDateRaw: '2025-08-01',
        fees: '$55,000 per year',
        feesAmount: 55000,
        classSize: '120 students',
        isPopular: true,
        isOnline: false,
        requiresTestScores: true,
        highlights: [
          'State-of-the-art simulation center',
          'Early clinical exposure from first year',
          'Research opportunities with renowned faculty',
          'Global health electives available'
        ],
        eligibility: [
          'Bachelor\'s degree with pre-med requirements',
          'MCAT scores (minimum 510)',
          'Healthcare experience recommended',
          'Strong academic background in sciences'
        ],
        applicationDeadline: '2024-11-01'
      },
      {
        id: 'law-606',
        title: 'Juris Doctor (JD)',
        description: 'A rigorous legal education program preparing students for careers in law, with specializations in corporate, international, and public interest law.',
        university: 'National Law School',
        level: 'Graduate',
        duration: '3 years',
        durationMonths: 36,
        startDate: 'September 2025',
        startDateRaw: '2025-09-01',
        fees: '$48,000 per year',
        feesAmount: 48000,
        classSize: '150 students',
        isPopular: false,
        isOnline: false,
        requiresTestScores: true,
        highlights: [
          'Moot court competitions',
          'Legal clinics serving the community',
          'Judicial internship opportunities',
          'Distinguished visiting faculty from top law firms'
        ],
        eligibility: [
          'Bachelor\'s degree in any discipline',
          'LSAT scores (minimum 160)',
          'Personal statement',
          'Letters of recommendation'
        ],
        applicationDeadline: '2025-02-15'
      },
      {
        id: 'art-707',
        title: 'Master of Fine Arts in Digital Media',
        description: 'An innovative program exploring the intersection of art, technology, and digital storytelling for the next generation of creative professionals.',
        university: 'Creative Arts Academy',
        level: 'Graduate',
        duration: '2 years',
        durationMonths: 24,
        startDate: 'January 2026',
        startDateRaw: '2026-01-10',
        fees: '$32,000 per year',
        feesAmount: 32000,
        classSize: '20 students',
        isPopular: false,
        isOnline: true,
        requiresTestScores: false,
        highlights: [
          'Industry-standard digital production facilities',
          'Collaboration with film and game studios',
          'Annual digital arts showcase',
          'Mentorship from award-winning artists'
        ],
        eligibility: [
          'Bachelor\'s degree in arts, design, or related field',
          'Digital portfolio submission',
          'Statement of artistic intent',
          'No standardized tests required'
        ],
        applicationDeadline: '2025-10-15'
      },
      {
        id: 'edu-808',
        title: 'Master of Education in Educational Technology',
        description: 'A forward-thinking program for educators looking to integrate technology into teaching and learning environments.',
        university: 'Teachers College',
        level: 'Graduate',
        duration: '1 year',
        durationMonths: 12,
        startDate: 'June 2025',
        startDateRaw: '2025-06-15',
        fees: '$25,000 total',
        feesAmount: 25000,
        classSize: '30 students',
        isPopular: false,
        isOnline: true,
        requiresTestScores: false,
        highlights: [
          'Fully online flexible schedule',
          'Practical technology integration projects',
          'Focus on both K-12 and higher education',
          'Certificate in instructional design included'
        ],
        eligibility: [
          'Bachelor\'s degree',
          'Teaching experience preferred but not required',
          'Personal statement of educational philosophy',
          'Basic technology proficiency'
        ],
        applicationDeadline: '2025-04-30'
      }
    ];
  }

  async getCourseById(courseId: string): Promise<Course | null> {
    const courses = await this.getCourses();
    return courses.find(course => course.id === courseId) || null;
  }

  async getUserApplications(userId: string): Promise<any[]> {
    // In a real app, this would fetch from your API
    // For demo purposes, we'll return mock data
    return [
      {
        id: 'APP-2024001',
        courseId: 'cs-101',
        courseName: 'Master of Computer Science',
        university: 'University of Technology',
        submissionDate: '2024-06-10T14:30:00Z',
        status: 'document_verification',
        lastUpdated: '2024-06-12T09:15:00Z',
        documents: [
          { name: 'Official Transcript', status: 'verified' },
          { name: 'CV/Resume', status: 'verified' },
          { name: 'GRE Score Report', status: 'pending' },
          { name: 'Statement of Purpose', status: 'verified' },
          { name: 'Letter of Recommendation', status: 'pending' }
        ],
        timeline: [
          { 
            date: '2024-06-10T14:30:00Z', 
            status: 'Application Submitted', 
            message: 'Your application has been successfully submitted.' 
          },
          { 
            date: '2024-06-11T10:45:00Z', 
            status: 'Document Verification Started', 
            message: 'Our team has started reviewing your submitted documents.' 
          },
          { 
            date: '2024-06-12T09:15:00Z', 
            status: 'Documents Partially Verified', 
            message: 'Some of your documents have been verified. We are still reviewing the remaining documents.' 
          }
        ],
        nextSteps: [
          'Complete document verification',
          'Application review by admissions committee',
          'Potential interview invitation'
        ]
      },
      {
        id: 'APP-2024002',
        courseId: 'mba-202',
        courseName: 'Master of Business Administration',
        university: 'Global Business School',
        submissionDate: '2024-05-20T11:45:00Z',
        status: 'interview_scheduled',
        lastUpdated: '2024-06-05T16:20:00Z',
        documents: [
          { name: 'Official Transcript', status: 'verified' },
          { name: 'CV/Resume', status: 'verified' },
          { name: 'GMAT Score Report', status: 'verified' },
          { name: 'Statement of Purpose', status: 'verified' },
          { name: 'Letters of Recommendation', status: 'verified' }
        ],
        timeline: [
          { 
            date: '2024-05-20T11:45:00Z', 
            status: 'Application Submitted', 
            message: 'Your application has been successfully submitted.' 
          },
          { 
            date: '2024-05-25T14:30:00Z', 
            status: 'Document Verification Completed', 
            message: 'All your documents have been verified.' 
          },
          { 
            date: '2024-06-01T09:00:00Z', 
            status: 'Application Under Review', 
            message: 'Your application is being reviewed by the admissions committee.' 
          },
          { 
            date: '2024-06-05T16:20:00Z', 
            status: 'Interview Invitation', 
            message: 'Congratulations! You have been selected for an interview.' 
          }
        ],
        interviewDetails: {
          date: '2024-06-20',
          time: '10:00 AM EST',
          location: 'Online via Zoom',
          interviewers: ['Dr. Sarah Johnson, MBA Director', 'Prof. Michael Chen, Finance Department'],
          format: 'Panel Interview'
        }
      },
      {
        id: 'APP-2024003',
        courseId: 'ds-303',
        courseName: 'Data Science Certificate',
        university: 'Tech Institute',
        submissionDate: '2024-04-15T09:30:00Z',
        status: 'accepted',
        lastUpdated: '2024-05-10T14:00:00Z',
        documents: [
          { name: 'Official Transcript', status: 'verified' },
          { name: 'CV/Resume', status: 'verified' },
          { name: 'Statement of Purpose', status: 'verified' }
        ],
        timeline: [
          { 
            date: '2024-04-15T09:30:00Z', 
            status: 'Application Submitted', 
            message: 'Your application has been successfully submitted.' 
          },
          { 
            date: '2024-04-20T11:15:00Z', 
            status: 'Document Verification Completed', 
            message: 'All your documents have been verified.' 
          },
          { 
            date: '2024-04-25T14:30:00Z', 
            status: 'Application Under Review', 
            message: 'Your application is being reviewed by the admissions committee.' 
          },
          { 
            date: '2024-05-05T10:00:00Z', 
            status: 'Interview Completed', 
            message: 'Thank you for participating in the interview. Your performance will be considered in the final decision.' 
          },
          { 
            date: '2024-05-10T14:00:00Z', 
            status: 'Application Accepted', 
            message: 'Congratulations! Your application has been accepted.' 
          }
        ],
        decisionDetails: {
          date: '2024-05-10T14:00:00Z',
          message: 'Congratulations! We are pleased to offer you admission to the Data Science Certificate program at Tech Institute. Your academic background and professional experience make you an excellent fit for our program.',
          nextSteps: [
            'Accept your offer by June 1, 2024',
            'Pay the enrollment deposit of $1,500',
            'Complete the online orientation by July 15, 2024',
            'Register for classes starting August 1, 2024'
          ]
        }
      }
    ];
  }

  async submitApplication(courseId: string, formData: any): Promise<string> {
    // In a real app, this would submit to your API
    // For demo purposes, we'll just return a mock application ID
    console.log('Submitting application for course:', courseId, formData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a unique application ID
    const applicationId = `APP-${Date.now().toString(36).toUpperCase()}`;
    
    return applicationId;
  }
}

export const courseService = CourseService.getInstance();