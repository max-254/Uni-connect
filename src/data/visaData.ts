export interface VisaRequirement {
  id: string;
  title: string;
  description: string;
  required: boolean;
  documents?: string[];
  notes?: string;
}

export interface VisaInfo {
  country: string;
  visaType: string;
  title: string;
  description: string;
  requirements: VisaRequirement[];
  importantNotes: string[];
  officialLinks: {
    name: string;
    url: string;
    description: string;
  }[];
  processingTime: string;
  applicationFee: string;
  workRights?: string;
  postStudyOptions?: string;
}

export const visaData: Record<string, VisaInfo> = {
  'Australia': {
    country: 'Australia',
    visaType: 'Subclass 500',
    title: 'Student Visa (Subclass 500)',
    description: 'The Student visa allows you to stay in Australia to study full-time in a registered course.',
    requirements: [
      {
        id: 'coe',
        title: 'Confirmation of Enrolment (CoE)',
        description: 'Letter of Offer and Confirmation of Enrolment from your institution',
        required: true,
        documents: ['Letter of Offer', 'Confirmation of Enrolment (CoE)'],
        notes: 'Must be from a CRICOS registered institution'
      },
      {
        id: 'funds',
        title: 'Proof of Financial Capacity',
        description: 'Evidence of sufficient funds to cover tuition, living costs, and travel',
        required: true,
        documents: ['Bank statements', 'Financial guarantee', 'Scholarship letters'],
        notes: 'Minimum A$29,710 per year for living costs (2024 rates)'
      },
      {
        id: 'oshc',
        title: 'Overseas Student Health Cover (OSHC)',
        description: 'Health insurance coverage for the duration of your stay',
        required: true,
        documents: ['OSHC policy certificate'],
        notes: 'Must be purchased before visa application'
      },
      {
        id: 'english',
        title: 'English Language Proficiency',
        description: 'Evidence of English language skills',
        required: true,
        documents: ['IELTS', 'TOEFL', 'PTE Academic', 'Cambridge English'],
        notes: 'Minimum requirements vary by course level'
      },
      {
        id: 'health',
        title: 'Health Requirements',
        description: 'Health examinations and medical clearances',
        required: true,
        documents: ['Health examination results', 'Chest X-ray', 'Medical clearances'],
        notes: 'Required for stays longer than 6 months'
      },
      {
        id: 'character',
        title: 'Character Requirements',
        description: 'Police clearance certificates',
        required: true,
        documents: ['Police clearance certificates'],
        notes: 'From all countries where you lived for 12+ months in the last 10 years'
      }
    ],
    importantNotes: [
      'Apply online through ImmiAccount - no paper applications accepted',
      'Offshore application requirement for visitor/graduate visa holders',
      'Must maintain adequate health insurance throughout your stay',
      'Can work up to 48 hours per fortnight during study periods',
      'Must maintain satisfactory course progress and attendance'
    ],
    officialLinks: [
      {
        name: 'ImmiAccount Portal',
        url: 'https://online.immi.gov.au/lusc/login',
        description: 'Official visa application portal'
      },
      {
        name: 'CRICOS Registry',
        url: 'https://cricos.education.gov.au/',
        description: 'Search for registered courses and institutions'
      },
      {
        name: 'Student Visa Information',
        url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500',
        description: 'Comprehensive visa requirements and guidelines'
      }
    ],
    processingTime: '4-6 weeks (75% of applications)',
    applicationFee: 'A$710 (2024 rate)',
    workRights: 'Up to 48 hours per fortnight during study, unlimited during breaks',
    postStudyOptions: 'Temporary Graduate visa (subclass 485) may be available'
  },

  'United States': {
    country: 'United States',
    visaType: 'F-1',
    title: 'F-1 Student Visa',
    description: 'The F-1 visa is for academic studies at SEVP-certified institutions in the United States.',
    requirements: [
      {
        id: 'i20',
        title: 'Form I-20',
        description: 'Certificate of Eligibility issued by SEVP-certified school',
        required: true,
        documents: ['Form I-20'],
        notes: 'Must be issued by your intended school'
      },
      {
        id: 'sevis',
        title: 'SEVIS Fee Payment',
        description: 'Student and Exchange Visitor Information System fee',
        required: true,
        documents: ['SEVIS fee receipt'],
        notes: 'Pay online at fmjfee.com - approximately US$350'
      },
      {
        id: 'ds160',
        title: 'DS-160 Application',
        description: 'Online nonimmigrant visa application',
        required: true,
        documents: ['DS-160 confirmation page'],
        notes: 'Complete online application and print confirmation'
      },
      {
        id: 'interview',
        title: 'Embassy Interview',
        description: 'Visa interview at US Embassy or Consulate',
        required: true,
        documents: ['Appointment confirmation', 'Supporting documents'],
        notes: 'Schedule interview after completing DS-160'
      },
      {
        id: 'financial',
        title: 'Financial Documentation',
        description: 'Proof of ability to pay for education and living expenses',
        required: true,
        documents: ['Bank statements', 'Sponsor affidavit', 'Scholarship letters'],
        notes: 'Must cover tuition and living expenses for entire program'
      },
      {
        id: 'ties',
        title: 'Home Country Ties',
        description: 'Evidence of intent to return to home country',
        required: true,
        documents: ['Property ownership', 'Family ties', 'Job prospects'],
        notes: 'Demonstrate strong ties to home country'
      }
    ],
    importantNotes: [
      'Must demonstrate non-immigrant intent',
      'Can work on-campus up to 20 hours/week during studies',
      'Optional Practical Training (OPT) available for 12 months post-graduation',
      'STEM graduates may be eligible for 24-month OPT extension',
      '60-day grace period after program completion',
      'Must maintain full-time enrollment status'
    ],
    officialLinks: [
      {
        name: 'DS-160 Application',
        url: 'https://ceac.state.gov/genniv/',
        description: 'Online visa application portal'
      },
      {
        name: 'SEVIS Fee Payment',
        url: 'https://www.fmjfee.com/',
        description: 'Pay SEVIS I-901 fee online'
      },
      {
        name: 'Study in the States',
        url: 'https://studyinthestates.dhs.gov/',
        description: 'Official information for international students'
      }
    ],
    processingTime: '2-8 weeks (varies by embassy)',
    applicationFee: 'US$185 (MRV fee)',
    workRights: 'On-campus: 20 hours/week during studies, full-time during breaks',
    postStudyOptions: 'Optional Practical Training (OPT) - 12 months, STEM extension available'
  },

  'Canada': {
    country: 'Canada',
    visaType: 'Study Permit',
    title: 'Study Permit',
    description: 'A study permit is required for international students to study in Canada for programs longer than 6 months.',
    requirements: [
      {
        id: 'acceptance',
        title: 'Letter of Acceptance',
        description: 'Acceptance letter from Designated Learning Institution (DLI)',
        required: true,
        documents: ['Letter of acceptance from DLI'],
        notes: 'Must be from a DLI with valid DLI number'
      },
      {
        id: 'financial',
        title: 'Proof of Financial Support',
        description: 'Evidence of funds for tuition, living expenses, and return transportation',
        required: true,
        documents: ['Bank statements', 'GIC certificate', 'Sponsor documents'],
        notes: 'Minimum CAD$20,000-25,000 per year depending on province'
      },
      {
        id: 'identity',
        title: 'Identity Documents',
        description: 'Valid passport and travel documents',
        required: true,
        documents: ['Valid passport', 'National identity document'],
        notes: 'Passport must be valid for duration of intended stay'
      },
      {
        id: 'medical',
        title: 'Medical Examination',
        description: 'Medical exam by panel physician (if required)',
        required: false,
        documents: ['Medical examination results'],
        notes: 'Required for certain countries or if staying >6 months'
      },
      {
        id: 'police',
        title: 'Police Certificate',
        description: 'Police clearance certificate',
        required: false,
        documents: ['Police clearance certificate'],
        notes: 'May be required depending on country of residence'
      },
      {
        id: 'pal',
        title: 'Provincial Attestation Letter (PAL)',
        description: 'Letter from provincial/territorial government (new requirement)',
        required: true,
        documents: ['Provincial Attestation Letter'],
        notes: 'Required for most study permit applications as of January 2024'
      }
    ],
    importantNotes: [
      'Stricter eligibility rules implemented since January 2024',
      'Indian student permits dropped 31% due to new requirements',
      'Can work up to 20 hours/week during studies, full-time during breaks',
      'Post-Graduation Work Permit (PGWP) may be available',
      'Apply online through IRCC portal or at Port of Entry (limited cases)',
      'Processing times vary significantly by country of residence'
    ],
    officialLinks: [
      {
        name: 'IRCC Online Portal',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html',
        description: 'Official immigration application portal'
      },
      {
        name: 'DLI List',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/designated-learning-institutions-list.html',
        description: 'List of Designated Learning Institutions'
      },
      {
        name: 'Study Permit Guide',
        url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html',
        description: 'Complete study permit information'
      }
    ],
    processingTime: '4-16 weeks (varies by country)',
    applicationFee: 'CAD$150',
    workRights: '20 hours/week during studies, full-time during scheduled breaks',
    postStudyOptions: 'Post-Graduation Work Permit (PGWP) - up to 3 years depending on program length'
  },

  'Germany': {
    country: 'Germany',
    visaType: 'National Visa (Type D)',
    title: 'Student Visa (National Visa)',
    description: 'Long-stay visa for studies exceeding 90 days in Germany.',
    requirements: [
      {
        id: 'admission',
        title: 'University Admission',
        description: 'Letter of admission or conditional admission from German university',
        required: true,
        documents: ['Admission letter', 'Conditional admission letter'],
        notes: 'Must be from recognized German institution'
      },
      {
        id: 'financial',
        title: 'Financial Proof',
        description: 'Evidence of sufficient funds for living expenses',
        required: true,
        documents: ['Blocked account (Sperrkonto)', 'Bank statements', 'Scholarship letter'],
        notes: 'Minimum €11,208 per year (2024) in blocked account'
      },
      {
        id: 'insurance',
        title: 'Health Insurance',
        description: 'Valid health insurance coverage',
        required: true,
        documents: ['Health insurance certificate'],
        notes: 'Must be valid in Germany and cover entire stay'
      },
      {
        id: 'academic',
        title: 'Academic Qualifications',
        description: 'Educational certificates and transcripts',
        required: true,
        documents: ['Degree certificates', 'Transcripts', 'Language certificates'],
        notes: 'May require recognition/equivalency assessment'
      },
      {
        id: 'language',
        title: 'Language Proficiency',
        description: 'German or English language proficiency proof',
        required: true,
        documents: ['TestDaF', 'DSH', 'IELTS', 'TOEFL certificates'],
        notes: 'Requirements vary by program and university'
      }
    ],
    importantNotes: [
      'Apply at German consulate in your home country',
      'Schengen visa rules apply for travel within EU',
      'Can work 120 full days or 240 half days per year',
      'Residence permit required upon arrival for stays >90 days',
      'Many public universities have no tuition fees for international students'
    ],
    officialLinks: [
      {
        name: 'Germany Visa Portal',
        url: 'https://visa.diplo.de/',
        description: 'Official visa application portal'
      },
      {
        name: 'DAAD Information',
        url: 'https://www.daad.de/en/',
        description: 'German Academic Exchange Service'
      },
      {
        name: 'Study in Germany',
        url: 'https://www.study-in-germany.de/',
        description: 'Official study information portal'
      }
    ],
    processingTime: '4-12 weeks',
    applicationFee: '€75',
    workRights: '120 full days or 240 half days per year',
    postStudyOptions: '18-month residence permit for job seeking after graduation'
  },

  'United Kingdom': {
    country: 'United Kingdom',
    visaType: 'Student Visa',
    title: 'Student Visa (formerly Tier 4)',
    description: 'For studying a course in the UK that lasts longer than 6 months.',
    requirements: [
      {
        id: 'cas',
        title: 'Confirmation of Acceptance for Studies (CAS)',
        description: 'CAS from licensed Student sponsor',
        required: true,
        documents: ['CAS reference number and details'],
        notes: 'Must be from licensed Student sponsor institution'
      },
      {
        id: 'financial',
        title: 'Financial Requirements',
        description: 'Proof of funds for tuition and living costs',
        required: true,
        documents: ['Bank statements', 'Official financial sponsor letter'],
        notes: '£1,334/month for London, £1,023/month outside London (2024 rates)'
      },
      {
        id: 'english',
        title: 'English Language Proficiency',
        description: 'Approved English language test results',
        required: true,
        documents: ['IELTS', 'TOEFL', 'PTE Academic', 'Cambridge English'],
        notes: 'Minimum B2 level required for most courses'
      },
      {
        id: 'tuberculosis',
        title: 'Tuberculosis Test',
        description: 'TB test results (if from certain countries)',
        required: false,
        documents: ['TB test certificate'],
        notes: 'Required if from countries with high TB incidence'
      },
      {
        id: 'atas',
        title: 'ATAS Certificate',
        description: 'Academic Technology Approval Scheme certificate',
        required: false,
        documents: ['ATAS certificate'],
        notes: 'Required for certain sensitive subjects'
      }
    ],
    importantNotes: [
      'Apply online up to 6 months before course starts',
      'Can work up to 20 hours/week during term time',
      'Graduate visa available for 2-3 years after graduation',
      'Must pay Immigration Health Surcharge (IHS)',
      'Biometric information required at visa application centre'
    ],
    officialLinks: [
      {
        name: 'UK Visa Application',
        url: 'https://www.gov.uk/apply-uk-visa',
        description: 'Official UK visa application portal'
      },
      {
        name: 'Student Visa Guide',
        url: 'https://www.gov.uk/student-visa',
        description: 'Complete student visa information'
      },
      {
        name: 'UKCISA',
        url: 'https://www.ukcisa.org.uk/',
        description: 'UK Council for International Student Affairs'
      }
    ],
    processingTime: '3-8 weeks (varies by country)',
    applicationFee: '£363 (outside UK)',
    workRights: '20 hours/week during term, full-time during holidays',
    postStudyOptions: 'Graduate visa - 2 years (3 years for PhD graduates)'
  },

  'France': {
    country: 'France',
    visaType: 'Long-stay Student Visa',
    title: 'Long-stay Student Visa (VLS-TS)',
    description: 'For studies in France lasting more than 90 days.',
    requirements: [
      {
        id: 'admission',
        title: 'University Admission',
        description: 'Acceptance letter from French institution',
        required: true,
        documents: ['Letter of admission', 'Registration certificate'],
        notes: 'Must be from recognized French institution'
      },
      {
        id: 'financial',
        title: 'Financial Resources',
        description: 'Proof of sufficient financial means',
        required: true,
        documents: ['Bank statements', 'Scholarship letter', 'Sponsor guarantee'],
        notes: 'Minimum €615/month (2024 rate)'
      },
      {
        id: 'accommodation',
        title: 'Accommodation Proof',
        description: 'Evidence of housing arrangements',
        required: true,
        documents: ['Housing certificate', 'Rental agreement', 'University accommodation letter'],
        notes: 'Must cover initial period of stay'
      },
      {
        id: 'insurance',
        title: 'Health Insurance',
        description: 'Health insurance coverage',
        required: true,
        documents: ['Health insurance certificate'],
        notes: 'Must be valid in France'
      },
      {
        id: 'language',
        title: 'Language Proficiency',
        description: 'French or English language skills proof',
        required: false,
        documents: ['DELF/DALF', 'TCF', 'IELTS', 'TOEFL certificates'],
        notes: 'Requirements vary by program'
      }
    ],
    importantNotes: [
      'VLS-TS acts as residence permit for first year',
      'Must validate visa within 3 months of arrival',
      'Can work up to 964 hours per year (60% of full-time)',
      'Schengen area travel permitted',
      'Campus France procedure may be required in some countries'
    ],
    officialLinks: [
      {
        name: 'Campus France',
        url: 'https://www.campusfrance.org/',
        description: 'Official French higher education agency'
      },
      {
        name: 'France Visa Portal',
        url: 'https://france-visas.gouv.fr/',
        description: 'Official visa application portal'
      },
      {
        name: 'Study in France',
        url: 'https://www.etudiant.gouv.fr/',
        description: 'Official student information portal'
      }
    ],
    processingTime: '2-8 weeks',
    applicationFee: '€99',
    workRights: '964 hours per year (approximately 20 hours/week)',
    postStudyOptions: 'Temporary residence permit for job seeking (APS) - 12 months'
  },

  'Netherlands': {
    country: 'Netherlands',
    visaType: 'Student Visa/Residence Permit',
    title: 'Student Visa and Residence Permit',
    description: 'For studying in the Netherlands for more than 90 days.',
    requirements: [
      {
        id: 'admission',
        title: 'University Admission',
        description: 'Acceptance from recognized Dutch institution',
        required: true,
        documents: ['Letter of admission', 'Enrollment certificate'],
        notes: 'Must be from government-recognized institution'
      },
      {
        id: 'financial',
        title: 'Financial Proof',
        description: 'Evidence of sufficient funds',
        required: true,
        documents: ['Bank statements', 'Scholarship letter', 'Sponsor declaration'],
        notes: 'Approximately €13,000-15,000 per year'
      },
      {
        id: 'insurance',
        title: 'Health Insurance',
        description: 'Valid health insurance coverage',
        required: true,
        documents: ['Health insurance policy'],
        notes: 'Must meet Dutch requirements'
      },
      {
        id: 'diploma',
        title: 'Educational Qualifications',
        description: 'Previous education certificates',
        required: true,
        documents: ['Diploma', 'Transcripts', 'Diploma evaluation'],
        notes: 'May require Nuffic evaluation'
      }
    ],
    importantNotes: [
      'EU/EEA students do not need visa/residence permit',
      'Can work up to 16 hours/week or full-time during summer',
      'Orientation year available after graduation',
      'Highly Skilled Migrant scheme may apply',
      'BSN (citizen service number) required for many services'
    ],
    officialLinks: [
      {
        name: 'IND (Immigration Service)',
        url: 'https://ind.nl/',
        description: 'Dutch Immigration and Naturalisation Service'
      },
      {
        name: 'Study in Holland',
        url: 'https://www.studyinholland.nl/',
        description: 'Official study information portal'
      },
      {
        name: 'Nuffic',
        url: 'https://www.nuffic.nl/',
        description: 'Dutch organisation for internationalisation in education'
      }
    ],
    processingTime: '2-8 weeks',
    applicationFee: '€350',
    workRights: '16 hours/week during studies, full-time in summer',
    postStudyOptions: 'Orientation year for graduates - 12 months'
  }
};

// Helper function to get visa info by country
export const getVisaInfoByCountry = (country: string): VisaInfo | null => {
  return visaData[country] || null;
};

// Helper function to get all supported countries
export const getSupportedVisaCountries = (): string[] => {
  return Object.keys(visaData);
};