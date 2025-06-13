import { supabase, ParsedDocumentData, StudentProfile } from '../lib/supabase';

interface DocumentFile {
  id: string;
  name: string;
  type: string;
  url?: string;
  content?: string;
}

class DocumentParsingService {
  private static instance: DocumentParsingService;

  static getInstance(): DocumentParsingService {
    if (!DocumentParsingService.instance) {
      DocumentParsingService.instance = new DocumentParsingService();
    }
    return DocumentParsingService.instance;
  }

  // Simulate AI document parsing (in production, this would call actual AI services)
  async parseDocument(file: DocumentFile, documentType: string): Promise<ParsedDocumentData> {
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract text content (simulated)
      const extractedText = await this.extractTextFromDocument(file);
      
      // Parse content based on document type
      const parsedData = await this.analyzeDocumentContent(extractedText, documentType);
      
      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(parsedData, extractedText);

      const result: ParsedDocumentData = {
        user_id: await this.getCurrentUserId(),
        document_id: file.id,
        document_type: documentType as any,
        parsed_data: parsedData,
        confidence_score: confidenceScore,
        processing_status: 'completed'
      };

      // Save to database
      await this.saveParsedData(result);
      
      // Update student profile
      await this.updateStudentProfile(result);

      return result;
    } catch (error) {
      console.error('Document parsing failed:', error);
      throw new Error('Failed to parse document');
    }
  }

  private async extractTextFromDocument(file: DocumentFile): Promise<string> {
    // Simulate OCR/text extraction
    // In production, this would use services like:
    // - Google Cloud Vision API
    // - AWS Textract
    // - Azure Computer Vision
    // - Tesseract.js for client-side OCR

    const mockTexts = {
      cv: `
        John Doe
        Software Engineer
        Email: john.doe@email.com
        Phone: +1-555-0123
        LinkedIn: linkedin.com/in/johndoe

        EDUCATION
        Master of Science in Computer Science
        Stanford University, 2020-2022
        GPA: 3.8/4.0
        Relevant Coursework: Machine Learning, Data Structures, Algorithms

        Bachelor of Science in Computer Engineering
        University of California, Berkeley, 2016-2020
        GPA: 3.6/4.0
        Magna Cum Laude

        EXPERIENCE
        Senior Software Engineer
        Google Inc., 2022-Present
        - Developed scalable web applications using React and Node.js
        - Led a team of 5 engineers on cloud infrastructure projects
        - Improved system performance by 40%

        Software Engineer Intern
        Microsoft Corporation, Summer 2021
        - Built machine learning models for data analysis
        - Collaborated with cross-functional teams

        SKILLS
        Programming Languages: Python, JavaScript, Java, C++
        Frameworks: React, Node.js, Django, Spring Boot
        Databases: PostgreSQL, MongoDB, Redis
        Cloud Platforms: AWS, Google Cloud, Azure
        Languages: English (Native), Spanish (Conversational), Mandarin (Basic)

        ACHIEVEMENTS
        - Dean's List (2018, 2019, 2020)
        - Google Code Jam Finalist 2021
        - Published research paper on ML algorithms
      `,
      transcript: `
        OFFICIAL TRANSCRIPT
        Stanford University
        Student: John Doe
        Student ID: 12345678
        Degree: Master of Science in Computer Science

        FALL 2020
        CS 229 Machine Learning                    A    4.0
        CS 161 Design and Analysis of Algorithms  A-   3.7
        CS 224N Natural Language Processing        B+   3.3

        SPRING 2021
        CS 231N Convolutional Neural Networks      A    4.0
        CS 246 Mining Massive Data Sets           A-   3.7
        CS 348B Computer Graphics                  B+   3.3

        FALL 2021
        CS 221 Artificial Intelligence            A    4.0
        CS 234 Reinforcement Learning             A-   3.7
        Thesis Research                           A    4.0

        SPRING 2022
        Thesis Research                           A    4.0
        CS 379C Computational Models of Cognition A-   3.7

        Cumulative GPA: 3.8/4.0
        Graduation Date: June 2022
        Degree Conferred: Master of Science in Computer Science
      `,
      statement: `
        PERSONAL STATEMENT

        My passion for artificial intelligence and machine learning began during my undergraduate studies at UC Berkeley, where I first encountered the fascinating intersection of computer science and cognitive science. This interest has driven my academic and professional journey, leading me to pursue advanced studies and research in AI.

        During my master's program at Stanford, I focused on natural language processing and computer vision, working under Dr. Smith on developing novel algorithms for image recognition. My thesis, "Deep Learning Approaches to Multi-Modal Understanding," contributed to the field by proposing a new architecture that improved accuracy by 15% over existing methods.

        My career goal is to become a research scientist in AI, specifically focusing on developing ethical AI systems that can benefit society. I am particularly interested in applications of AI in healthcare and education, where technology can make a meaningful impact on people's lives.

        I am seeking to pursue a PhD in Computer Science with a focus on Artificial Intelligence. My research interests include:
        - Machine Learning and Deep Learning
        - Natural Language Processing
        - Computer Vision
        - Ethical AI and Fairness in ML
        - AI Applications in Healthcare

        I believe that the next breakthrough in AI will come from interdisciplinary collaboration, combining insights from computer science, psychology, neuroscience, and ethics. I am excited about the opportunity to contribute to this field and work with leading researchers to push the boundaries of what's possible with artificial intelligence.

        My long-term vision is to establish a research lab that focuses on developing AI systems that are not only technically advanced but also socially responsible and beneficial to humanity.
      `
    };

    // Return mock text based on document type or file name
    if (file.name.toLowerCase().includes('cv') || file.name.toLowerCase().includes('resume')) {
      return mockTexts.cv;
    } else if (file.name.toLowerCase().includes('transcript')) {
      return mockTexts.transcript;
    } else if (file.name.toLowerCase().includes('statement')) {
      return mockTexts.statement;
    }

    return mockTexts.cv; // Default fallback
  }

  private async analyzeDocumentContent(text: string, documentType: string): Promise<any> {
    // Simulate AI analysis using NLP
    // In production, this would use services like:
    // - OpenAI GPT API
    // - Google Cloud Natural Language API
    // - AWS Comprehend
    // - Custom trained models

    const analysis: any = {
      raw_text: text
    };

    // Extract different information based on document type
    switch (documentType) {
      case 'cv':
        analysis.education = this.extractEducation(text);
        analysis.experience = this.extractExperience(text);
        analysis.skills = this.extractSkills(text);
        analysis.contact = this.extractContact(text);
        break;

      case 'transcript':
        analysis.academic_performance = this.extractAcademicPerformance(text);
        analysis.education = this.extractEducationFromTranscript(text);
        break;

      case 'statement':
        analysis.preferences = this.extractPreferences(text);
        analysis.career_goals = this.extractCareerGoals(text);
        break;

      case 'recommendation':
        analysis.skills = this.extractSkillsFromRecommendation(text);
        analysis.achievements = this.extractAchievements(text);
        break;

      default:
        // General parsing for other document types
        analysis.education = this.extractEducation(text);
        analysis.skills = this.extractSkills(text);
        break;
    }

    return analysis;
  }

  private extractEducation(text: string) {
    // Simulate education extraction
    const institutions = [];
    
    if (text.includes('Stanford University')) {
      institutions.push({
        name: 'Stanford University',
        degree: 'Master of Science',
        field: 'Computer Science',
        gpa: 3.8,
        startDate: '2020',
        endDate: '2022',
        location: 'Stanford, CA'
      });
    }

    if (text.includes('University of California, Berkeley') || text.includes('UC Berkeley')) {
      institutions.push({
        name: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        field: 'Computer Engineering',
        gpa: 3.6,
        startDate: '2016',
        endDate: '2020',
        location: 'Berkeley, CA'
      });
    }

    return {
      institutions,
      certifications: []
    };
  }

  private extractEducationFromTranscript(text: string) {
    const institutions = [];
    
    if (text.includes('Stanford University')) {
      institutions.push({
        name: 'Stanford University',
        degree: 'Master of Science',
        field: 'Computer Science',
        gpa: 3.8,
        endDate: '2022'
      });
    }

    return { institutions };
  }

  private extractExperience(text: string) {
    const positions = [];

    if (text.includes('Google Inc.')) {
      positions.push({
        title: 'Senior Software Engineer',
        company: 'Google Inc.',
        duration: '2022-Present',
        description: 'Developed scalable web applications using React and Node.js',
        location: 'Mountain View, CA'
      });
    }

    if (text.includes('Microsoft Corporation')) {
      positions.push({
        title: 'Software Engineer Intern',
        company: 'Microsoft Corporation',
        duration: 'Summer 2021',
        description: 'Built machine learning models for data analysis',
        location: 'Redmond, WA'
      });
    }

    return { positions };
  }

  private extractSkills(text: string) {
    const technical = [];
    const languages = [];
    const soft_skills = [];

    // Extract technical skills
    if (text.includes('Python')) technical.push('Python');
    if (text.includes('JavaScript')) technical.push('JavaScript');
    if (text.includes('Java')) technical.push('Java');
    if (text.includes('C++')) technical.push('C++');
    if (text.includes('React')) technical.push('React');
    if (text.includes('Node.js')) technical.push('Node.js');
    if (text.includes('Machine Learning')) technical.push('Machine Learning');
    if (text.includes('AWS')) technical.push('AWS');
    if (text.includes('PostgreSQL')) technical.push('PostgreSQL');

    // Extract languages
    if (text.includes('English')) {
      languages.push({ language: 'English', proficiency: 'Native' });
    }
    if (text.includes('Spanish')) {
      languages.push({ language: 'Spanish', proficiency: 'Conversational' });
    }
    if (text.includes('Mandarin')) {
      languages.push({ language: 'Mandarin', proficiency: 'Basic' });
    }

    // Extract soft skills
    if (text.includes('leadership') || text.includes('Led a team')) {
      soft_skills.push('Leadership');
    }
    if (text.includes('collaboration') || text.includes('Collaborated')) {
      soft_skills.push('Collaboration');
    }
    if (text.includes('communication')) {
      soft_skills.push('Communication');
    }

    return { technical, languages, soft_skills };
  }

  private extractSkillsFromRecommendation(text: string) {
    // Extract skills mentioned in recommendation letters
    const soft_skills = [];
    
    if (text.toLowerCase().includes('excellent communication')) {
      soft_skills.push('Communication');
    }
    if (text.toLowerCase().includes('leadership')) {
      soft_skills.push('Leadership');
    }
    if (text.toLowerCase().includes('analytical')) {
      soft_skills.push('Analytical Thinking');
    }
    if (text.toLowerCase().includes('creative')) {
      soft_skills.push('Creativity');
    }

    return { soft_skills, technical: [], languages: [] };
  }

  private extractContact(text: string) {
    const contact: any = {};

    // Extract email
    const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch) {
      contact.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = text.match(/\+?[\d\s\-\(\)]{10,}/);
    if (phoneMatch) {
      contact.phone = phoneMatch[0];
    }

    // Extract LinkedIn
    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w\-]+/);
    if (linkedinMatch) {
      contact.linkedin = linkedinMatch[0];
    }

    return contact;
  }

  private extractAcademicPerformance(text: string) {
    const performance: any = {};
    const test_scores = [];

    // Extract GPA
    const gpaMatch = text.match(/GPA:\s*([\d\.]+)/i);
    if (gpaMatch) {
      performance.overall_gpa = parseFloat(gpaMatch[1]);
    }

    // Extract test scores (simulated)
    if (text.includes('GRE')) {
      test_scores.push({
        test_name: 'GRE',
        score: '325',
        date: '2020-03-15'
      });
    }

    performance.test_scores = test_scores;
    performance.achievements = ['Dean\'s List', 'Magna Cum Laude'];

    return performance;
  }

  private extractPreferences(text: string) {
    const study_fields = [];
    const career_goals = [];
    const research_interests = [];

    // Extract study fields
    if (text.includes('Computer Science')) study_fields.push('Computer Science');
    if (text.includes('Artificial Intelligence')) study_fields.push('Artificial Intelligence');
    if (text.includes('Machine Learning')) study_fields.push('Machine Learning');
    if (text.includes('Data Science')) study_fields.push('Data Science');

    // Extract career goals
    if (text.includes('research scientist')) career_goals.push('Research Scientist');
    if (text.includes('PhD')) career_goals.push('Academic Career');
    if (text.includes('healthcare')) career_goals.push('Healthcare Technology');

    // Extract research interests
    if (text.includes('Natural Language Processing')) research_interests.push('Natural Language Processing');
    if (text.includes('Computer Vision')) research_interests.push('Computer Vision');
    if (text.includes('Ethical AI')) research_interests.push('Ethical AI');

    return { study_fields, career_goals, research_interests };
  }

  private extractCareerGoals(text: string) {
    const goals = [];
    
    if (text.includes('research scientist')) goals.push('Research Scientist');
    if (text.includes('professor')) goals.push('Professor');
    if (text.includes('entrepreneur')) goals.push('Entrepreneur');
    if (text.includes('consultant')) goals.push('Consultant');

    return goals;
  }

  private extractAchievements(text: string) {
    const achievements = [];
    
    if (text.includes('Dean\'s List')) achievements.push('Dean\'s List');
    if (text.includes('Magna Cum Laude')) achievements.push('Magna Cum Laude');
    if (text.includes('published')) achievements.push('Published Research');
    if (text.includes('award')) achievements.push('Academic Award');

    return achievements;
  }

  private calculateConfidenceScore(parsedData: any, text: string): number {
    let score = 0;
    let maxScore = 0;

    // Check for presence of different data types
    if (parsedData.education?.institutions?.length > 0) {
      score += 20;
    }
    maxScore += 20;

    if (parsedData.experience?.positions?.length > 0) {
      score += 15;
    }
    maxScore += 15;

    if (parsedData.skills?.technical?.length > 0) {
      score += 15;
    }
    maxScore += 15;

    if (parsedData.contact?.email) {
      score += 10;
    }
    maxScore += 10;

    if (parsedData.academic_performance?.overall_gpa) {
      score += 15;
    }
    maxScore += 15;

    if (parsedData.preferences?.study_fields?.length > 0) {
      score += 15;
    }
    maxScore += 15;

    // Text quality score
    if (text.length > 500) {
      score += 10;
    }
    maxScore += 10;

    return Math.round((score / maxScore) * 100);
  }

  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.id;
  }

  private async saveParsedData(data: ParsedDocumentData): Promise<void> {
    const { error } = await supabase
      .from('parsed_documents')
      .insert([data]);

    if (error) {
      console.error('Error saving parsed data:', error);
      throw new Error('Failed to save parsed data');
    }
  }

  private async updateStudentProfile(parsedData: ParsedDocumentData): Promise<void> {
    try {
      const userId = parsedData.user_id;
      
      // Get existing profile
      const { data: existingProfile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Merge parsed data with existing profile
      const updatedProfile = this.mergeProfileData(existingProfile, parsedData);

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('student_profiles')
          .update(updatedProfile)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('student_profiles')
          .insert([{ ...updatedProfile, user_id: userId }]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating student profile:', error);
      // Don't throw error here to avoid breaking the parsing flow
    }
  }

  private mergeProfileData(existingProfile: StudentProfile | null, parsedData: ParsedDocumentData): Partial<StudentProfile> {
    const parsed = parsedData.parsed_data;
    
    const profile: Partial<StudentProfile> = existingProfile ? { ...existingProfile } : {
      academic_background: {
        highest_education: '',
        gpa: 0,
        institutions: [],
        test_scores: []
      },
      skills: {
        technical: [],
        languages: [],
        soft_skills: []
      },
      preferences: {
        study_fields: [],
        preferred_countries: [],
        career_goals: [],
        scholarship_required: false
      },
      experience: [],
      contact_info: {},
      profile_completion: 0
    };

    // Merge education data
    if (parsed.education?.institutions) {
      profile.academic_background!.institutions = [
        ...(profile.academic_background?.institutions || []),
        ...parsed.education.institutions.map(inst => ({
          name: inst.name,
          degree: inst.degree,
          field: inst.field,
          gpa: inst.gpa,
          graduation_year: inst.endDate ? parseInt(inst.endDate) : undefined
        }))
      ];

      // Update highest education
      const degrees = profile.academic_background!.institutions.map(i => i.degree);
      if (degrees.some(d => d.toLowerCase().includes('phd') || d.toLowerCase().includes('doctorate'))) {
        profile.academic_background!.highest_education = 'PhD';
      } else if (degrees.some(d => d.toLowerCase().includes('master'))) {
        profile.academic_background!.highest_education = 'Masters';
      } else if (degrees.some(d => d.toLowerCase().includes('bachelor'))) {
        profile.academic_background!.highest_education = 'Bachelors';
      }
    }

    // Merge academic performance
    if (parsed.academic_performance) {
      if (parsed.academic_performance.overall_gpa) {
        profile.academic_background!.gpa = parsed.academic_performance.overall_gpa;
      }
      if (parsed.academic_performance.test_scores) {
        profile.academic_background!.test_scores = [
          ...(profile.academic_background?.test_scores || []),
          ...parsed.academic_performance.test_scores
        ];
      }
    }

    // Merge skills
    if (parsed.skills) {
      if (parsed.skills.technical) {
        profile.skills!.technical = [
          ...new Set([
            ...(profile.skills?.technical || []),
            ...parsed.skills.technical
          ])
        ];
      }
      if (parsed.skills.languages) {
        profile.skills!.languages = [
          ...(profile.skills?.languages || []),
          ...parsed.skills.languages
        ];
      }
      if (parsed.skills.soft_skills) {
        profile.skills!.soft_skills = [
          ...new Set([
            ...(profile.skills?.soft_skills || []),
            ...parsed.skills.soft_skills
          ])
        ];
      }
    }

    // Merge preferences
    if (parsed.preferences) {
      if (parsed.preferences.study_fields) {
        profile.preferences!.study_fields = [
          ...new Set([
            ...(profile.preferences?.study_fields || []),
            ...parsed.preferences.study_fields
          ])
        ];
      }
      if (parsed.preferences.career_goals) {
        profile.preferences!.career_goals = [
          ...new Set([
            ...(profile.preferences?.career_goals || []),
            ...parsed.preferences.career_goals
          ])
        ];
      }
    }

    // Merge experience
    if (parsed.experience?.positions) {
      profile.experience = [
        ...(profile.experience || []),
        ...parsed.experience.positions.map(pos => ({
          title: pos.title,
          company: pos.company,
          duration: pos.duration,
          description: pos.description
        }))
      ];
    }

    // Merge contact info
    if (parsed.contact) {
      profile.contact_info = {
        ...profile.contact_info,
        ...parsed.contact
      };
    }

    // Calculate profile completion
    profile.profile_completion = this.calculateProfileCompletion(profile);

    return profile;
  }

  private calculateProfileCompletion(profile: Partial<StudentProfile>): number {
    let completed = 0;
    let total = 8;

    if (profile.academic_background?.institutions?.length) completed++;
    if (profile.academic_background?.gpa) completed++;
    if (profile.skills?.technical?.length) completed++;
    if (profile.skills?.languages?.length) completed++;
    if (profile.preferences?.study_fields?.length) completed++;
    if (profile.preferences?.career_goals?.length) completed++;
    if (profile.experience?.length) completed++;
    if (profile.contact_info?.email) completed++;

    return Math.round((completed / total) * 100);
  }

  // Public method to get parsed data for a user
  async getParsedDocuments(userId: string): Promise<ParsedDocumentData[]> {
    const { data, error } = await supabase
      .from('parsed_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching parsed documents:', error);
      return [];
    }

    return data || [];
  }

  // Public method to get student profile
  async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching student profile:', error);
      return null;
    }

    return data;
  }

  // Public method to manually trigger profile update
  async updateProfileFromParsedData(userId: string): Promise<void> {
    const parsedDocuments = await this.getParsedDocuments(userId);
    
    for (const doc of parsedDocuments) {
      await this.updateStudentProfile(doc);
    }
  }
}

export const documentParsingService = DocumentParsingService.getInstance();