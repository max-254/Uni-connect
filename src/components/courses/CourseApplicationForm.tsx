import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Flag, 
  GraduationCap, 
  FileText, 
  Upload, 
  Check, 
  AlertTriangle, 
  Save, 
  Send, 
  ArrowLeft, 
  Info
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Course } from '../../types/course';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  currentStatus: string;
  languageProficiency: {
    english: string;
    other: string;
  };
  
  // Academic Background
  education: Array<{
    degree: string;
    institution: string;
    field: string;
    gpa: string;
    startDate: string;
    endDate: string;
  }>;
  relevantCoursework: string;
  
  // Documents
  documents: {
    transcript: File | null;
    cv: File | null;
    testScores: File | null;
    statementOfPurpose: File | null;
    recommendation: File | null;
  };
  
  // Additional Information
  additionalInfo: string;
  howDidYouHear: string;
  agreeToTerms: boolean;
}

const CourseApplicationForm: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const fileInputRefs = {
    transcript: useRef<HTMLInputElement>(null),
    cv: useRef<HTMLInputElement>(null),
    testScores: useRef<HTMLInputElement>(null),
    statementOfPurpose: useRef<HTMLInputElement>(null),
    recommendation: useRef<HTMLInputElement>(null)
  };
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    currentStatus: '',
    languageProficiency: {
      english: '',
      other: ''
    },
    education: [
      {
        degree: '',
        institution: '',
        field: '',
        gpa: '',
        startDate: '',
        endDate: ''
      }
    ],
    relevantCoursework: '',
    documents: {
      transcript: null,
      cv: null,
      testScores: null,
      statementOfPurpose: null,
      recommendation: null
    },
    additionalInfo: '',
    howDidYouHear: '',
    agreeToTerms: false
  });

  // Load course data
  React.useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        if (courseId) {
          const courseData = await courseService.getCourseById(courseId);
          setCourse(courseData);
          
          // Pre-fill form with user data if authenticated
          if (isAuthenticated && user) {
            setFormData(prev => ({
              ...prev,
              firstName: user.name?.split(' ')[0] || '',
              lastName: user.name?.split(' ').slice(1).join(' ') || '',
              email: user.email || ''
            }));
          }
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, isAuthenticated, user]);

  // Check for saved draft
  React.useEffect(() => {
    const savedDraft = localStorage.getItem(`application_draft_${courseId}`);
    if (savedDraft) {
      try {
        const parsedData = JSON.parse(savedDraft);
        // We can't restore file objects from localStorage, so we keep the current ones
        const { documents, ...restData } = parsedData;
        setFormData(prev => ({
          ...restData,
          documents: prev.documents
        }));
      } catch (error) {
        console.error('Error loading saved draft:', error);
      }
    }
  }, [courseId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FormData],
          [child]: value
        }
      }));
      return;
    }
    
    // Handle regular fields
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newEducation = [...prev.education];
      newEducation[index] = {
        ...newEducation[index],
        [field]: value
      };
      return {
        ...prev,
        education: newEducation
      };
    });
    
    // Clear validation error
    const errorKey = `education[${index}].${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: '',
          institution: '',
          field: '',
          gpa: '',
          startDate: '',
          endDate: ''
        }
      ]
    }));
  };

  const removeEducation = (index: number) => {
    if (formData.education.length > 1) {
      setFormData(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: keyof FormData['documents']) => {
    const file = e.target.files?.[0] || null;
    
    // Validate file size (max 5MB)
    if (file && file.size > 5 * 1024 * 1024) {
      setValidationErrors(prev => ({
        ...prev,
        [documentType]: 'File size exceeds 5MB limit'
      }));
      return;
    }
    
    // Validate file type
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
      
      if (!allowedExtensions.includes(fileExtension || '')) {
        setValidationErrors(prev => ({
          ...prev,
          [documentType]: 'Only PDF, JPG, and PNG files are allowed'
        }));
        return;
      }
    }
    
    // Clear validation error
    if (validationErrors[documentType]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[documentType];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }));
  };

  const triggerFileInput = (documentType: keyof FormData['documents']) => {
    fileInputRefs[documentType]?.current?.click();
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      // Validate personal information
      if (!formData.firstName.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
      if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
      if (!formData.nationality.trim()) errors.nationality = 'Nationality is required';
      if (!formData.currentStatus) errors.currentStatus = 'Current status is required';
      if (!formData.languageProficiency.english) errors['languageProficiency.english'] = 'English proficiency is required';
    }
    
    else if (step === 2) {
      // Validate academic background
      formData.education.forEach((edu, index) => {
        if (!edu.degree.trim()) errors[`education[${index}].degree`] = 'Degree is required';
        if (!edu.institution.trim()) errors[`education[${index}].institution`] = 'Institution is required';
        if (!edu.field.trim()) errors[`education[${index}].field`] = 'Field of study is required';
        if (!edu.gpa.trim()) errors[`education[${index}].gpa`] = 'GPA/Score is required';
        if (!edu.startDate) errors[`education[${index}].startDate`] = 'Start date is required';
        if (!edu.endDate) errors[`education[${index}].endDate`] = 'End date is required';
      });
    }
    
    else if (step === 3) {
      // Validate required documents
      if (!formData.documents.transcript) errors.transcript = 'Official transcript is required';
      if (!formData.documents.cv) errors.cv = 'CV/Resume is required';
      if (!formData.documents.statementOfPurpose) errors.statementOfPurpose = 'Statement of Purpose is required';
      
      // Test scores and recommendation letters might be optional depending on the course
      if (course?.requiresTestScores && !formData.documents.testScores) {
        errors.testScores = 'Test scores are required for this course';
      }
    }
    
    else if (step === 4) {
      // Validate final submission
      if (!formData.agreeToTerms) {
        errors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const saveDraft = async () => {
    try {
      setIsSaving(true);
      
      // Save form data to localStorage (excluding file objects)
      const { documents, ...dataToSave } = formData;
      localStorage.setItem(`application_draft_${courseId}`, JSON.stringify(dataToSave));
      
      // In a real app, you would also save to the server
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      alert('Application draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // In a real app, you would submit the form data to your API
      // This would include uploading the files to a storage service
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a unique application ID
      const applicationId = `APP-${Date.now().toString(36).toUpperCase()}`;
      
      // Clear the draft from localStorage
      localStorage.removeItem(`application_draft_${courseId}`);
      
      // Navigate to success page
      navigate(`/courses/application-success/${applicationId}`);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium">Course Not Found</h3>
          <p>The course you're looking for doesn't exist or has been removed.</p>
        </div>
        <Button onClick={() => navigate('/courses')}>
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/courses/${courseId}`)}
          leftIcon={<ArrowLeft size={16} />}
          className="mb-4"
        >
          Back to Course
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Application for {course.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please complete all required information to submit your application
        </p>
      </div>

      {/* Course Summary */}
      <Card className="mb-8">
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {course.title}
              </h2>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Starts {course.startDate}</span>
                <span className="mx-2">•</span>
                <Clock className="w-4 h-4 mr-1" />
                <span>{course.duration}</span>
              </div>
            </div>
            <div className="mt-2 sm:mt-0 text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Course Fee</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{course.fees}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['Personal Information', 'Academic Background', 'Documents', 'Review & Submit'].map((step, index) => (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep > index + 1
                      ? 'bg-green-500 text-white'
                      : currentStep === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {currentStep > index + 1 ? (
                    <Check size={20} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className={`mt-2 text-xs ${
                  currentStep === index + 1 
                    ? 'text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step}
                </span>
              </div>
              
              {/* Connector Line (except after last step) */}
              {index < 3 && (
                <div 
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > index + 1
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <Card>
        <CardBody className="p-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={validationErrors.firstName}
                  required
                  leftIcon={<User size={18} />}
                />
                
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={validationErrors.lastName}
                  required
                  leftIcon={<User size={18} />}
                />
                
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={validationErrors.email}
                  required
                  leftIcon={<Mail size={18} />}
                />
                
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={validationErrors.phone}
                  required
                  leftIcon={<Phone size={18} />}
                />
                
                <Input
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  error={validationErrors.dateOfBirth}
                  required
                  leftIcon={<Calendar size={18} />}
                />
                
                <Input
                  label="Nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  error={validationErrors.nationality}
                  required
                  leftIcon={<Flag size={18} />}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Status
                  </label>
                  <select
                    name="currentStatus"
                    value={formData.currentStatus}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                      validationErrors.currentStatus 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-md shadow-sm`}
                  >
                    <option value="">Select your current status</option>
                    <option value="student">Student</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="other">Other</option>
                  </select>
                  {validationErrors.currentStatus && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.currentStatus}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      English Proficiency Level
                    </label>
                    <select
                      name="languageProficiency.english"
                      value={formData.languageProficiency.english}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                        validationErrors['languageProficiency.english'] 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-md shadow-sm`}
                    >
                      <option value="">Select proficiency level</option>
                      <option value="native">Native</option>
                      <option value="fluent">Fluent</option>
                      <option value="advanced">Advanced</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="basic">Basic</option>
                    </select>
                    {validationErrors['languageProficiency.english'] && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validationErrors['languageProficiency.english']}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Other Languages (Optional)
                    </label>
                    <Input
                      name="languageProficiency.other"
                      value={formData.languageProficiency.other}
                      onChange={handleInputChange}
                      placeholder="e.g., Spanish (Intermediate), French (Basic)"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Academic Background */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Academic Background
              </h2>
              
              {formData.education.map((edu, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Education #{index + 1}
                    </h3>
                    {formData.education.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Degree/Qualification
                      </label>
                      <select
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                          validationErrors[`education[${index}].degree`] 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-md shadow-sm`}
                      >
                        <option value="">Select degree</option>
                        <option value="High School">High School</option>
                        <option value="Associate's">Associate's Degree</option>
                        <option value="Bachelor's">Bachelor's Degree</option>
                        <option value="Master's">Master's Degree</option>
                        <option value="Doctorate">Doctorate/PhD</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Certificate">Certificate</option>
                        <option value="Other">Other</option>
                      </select>
                      {validationErrors[`education[${index}].degree`] && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {validationErrors[`education[${index}].degree`]}
                        </p>
                      )}
                    </div>
                    
                    <Input
                      label="Institution"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      error={validationErrors[`education[${index}].institution`]}
                      required
                    />
                    
                    <Input
                      label="Field of Study"
                      value={edu.field}
                      onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                      error={validationErrors[`education[${index}].field`]}
                      required
                    />
                    
                    <Input
                      label="GPA/Percentage"
                      value={edu.gpa}
                      onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                      error={validationErrors[`education[${index}].gpa`]}
                      placeholder="e.g., 3.5/4.0 or 85%"
                      required
                    />
                    
                    <Input
                      label="Start Date"
                      type="month"
                      value={edu.startDate}
                      onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                      error={validationErrors[`education[${index}].startDate`]}
                      required
                    />
                    
                    <Input
                      label="End Date (or Expected)"
                      type="month"
                      value={edu.endDate}
                      onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                      error={validationErrors[`education[${index}].endDate`]}
                      required
                    />
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={addEducation}
                  leftIcon={<Plus size={16} />}
                >
                  Add Another Education
                </Button>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Relevant Coursework (Optional)
                </label>
                <textarea
                  name="relevantCoursework"
                  value={formData.relevantCoursework}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="List any relevant courses, projects, or academic achievements"
                />
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Required Documents
              </h2>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Document Requirements</h3>
                    <ul className="mt-2 text-sm text-blue-700 dark:text-blue-200 space-y-1">
                      <li>• All documents must be in PDF, JPG, or PNG format</li>
                      <li>• Maximum file size: 5MB per document</li>
                      <li>• Ensure all documents are clear and legible</li>
                      <li>• Official transcripts must include all completed coursework</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Official Transcript */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Official Transcript
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload your most recent academic transcript
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full">
                        Required
                      </span>
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRefs.transcript}
                    onChange={(e) => handleFileChange(e, 'transcript')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  
                  {formData.documents.transcript ? (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.documents.transcript.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(formData.documents.transcript.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => triggerFileInput('transcript')}
                      >
                        Replace
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => triggerFileInput('transcript')}
                      leftIcon={<Upload size={16} />}
                      className="w-full"
                    >
                      Upload Transcript
                    </Button>
                  )}
                  
                  {validationErrors.transcript && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.transcript}
                    </p>
                  )}
                </div>
                
                {/* CV/Resume */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Curriculum Vitae / Resume
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload your most recent CV or resume
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full">
                        Required
                      </span>
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRefs.cv}
                    onChange={(e) => handleFileChange(e, 'cv')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  
                  {formData.documents.cv ? (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.documents.cv.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(formData.documents.cv.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => triggerFileInput('cv')}
                      >
                        Replace
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => triggerFileInput('cv')}
                      leftIcon={<Upload size={16} />}
                      className="w-full"
                    >
                      Upload CV/Resume
                    </Button>
                  )}
                  
                  {validationErrors.cv && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.cv}
                    </p>
                  )}
                </div>
                
                {/* Test Scores */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Standardized Test Scores
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload GRE/GMAT/TOEFL/IELTS or other relevant test scores
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        course.requiresTestScores
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {course.requiresTestScores ? 'Required' : 'Optional'}
                      </span>
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRefs.testScores}
                    onChange={(e) => handleFileChange(e, 'testScores')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  
                  {formData.documents.testScores ? (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.documents.testScores.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(formData.documents.testScores.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => triggerFileInput('testScores')}
                      >
                        Replace
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => triggerFileInput('testScores')}
                      leftIcon={<Upload size={16} />}
                      className="w-full"
                    >
                      Upload Test Scores
                    </Button>
                  )}
                  
                  {validationErrors.testScores && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.testScores}
                    </p>
                  )}
                </div>
                
                {/* Statement of Purpose */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Statement of Purpose
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload your statement explaining why you want to join this course
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full">
                        Required
                      </span>
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRefs.statementOfPurpose}
                    onChange={(e) => handleFileChange(e, 'statementOfPurpose')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  
                  {formData.documents.statementOfPurpose ? (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.documents.statementOfPurpose.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(formData.documents.statementOfPurpose.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => triggerFileInput('statementOfPurpose')}
                      >
                        Replace
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => triggerFileInput('statementOfPurpose')}
                      leftIcon={<Upload size={16} />}
                      className="w-full"
                    >
                      Upload Statement
                    </Button>
                  )}
                  
                  {validationErrors.statementOfPurpose && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.statementOfPurpose}
                    </p>
                  )}
                </div>
                
                {/* Recommendation Letter */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Letter of Recommendation
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload a letter of recommendation if available
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                        Optional
                      </span>
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRefs.recommendation}
                    onChange={(e) => handleFileChange(e, 'recommendation')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  
                  {formData.documents.recommendation ? (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formData.documents.recommendation.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(formData.documents.recommendation.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => triggerFileInput('recommendation')}
                      >
                        Replace
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => triggerFileInput('recommendation')}
                      leftIcon={<Upload size={16} />}
                      className="w-full"
                    >
                      Upload Recommendation
                    </Button>
                  )}
                  
                  {validationErrors.recommendation && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.recommendation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Review & Submit
              </h2>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Important Notice</h3>
                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-200">
                      Please review all information carefully before submitting. Once submitted, you will not be able to make changes to your application.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Personal Information Summary */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Personal Information
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formData.firstName} {formData.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formData.dateOfBirth && new Date(formData.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nationality</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formData.nationality}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current Status</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {formData.currentStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Academic Background Summary */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Academic Background
                  </h3>
                </div>
                <div className="p-4">
                  {formData.education.map((edu, index) => (
                    <div key={index} className={`${index > 0 ? 'mt-4 pt-4 border-t border-gray-200 dark:border-gray-700' : ''}`}>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Education #{index + 1}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Degree</p>
                          <p className="font-medium text-gray-900 dark:text-white">{edu.degree}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Institution</p>
                          <p className="font-medium text-gray-900 dark:text-white">{edu.institution}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Field of Study</p>
                          <p className="font-medium text-gray-900 dark:text-white">{edu.field}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">GPA/Score</p>
                          <p className="font-medium text-gray-900 dark:text-white">{edu.gpa}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {edu.startDate && new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })} - 
                            {edu.endDate && new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Documents Summary */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Uploaded Documents
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                        <span className="text-gray-900 dark:text-white">Official Transcript</span>
                      </div>
                      {formData.documents.transcript ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <Check size={16} className="mr-1" /> Uploaded
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 flex items-center">
                          <AlertTriangle size={16} className="mr-1" /> Missing
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                        <span className="text-gray-900 dark:text-white">CV/Resume</span>
                      </div>
                      {formData.documents.cv ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <Check size={16} className="mr-1" /> Uploaded
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 flex items-center">
                          <AlertTriangle size={16} className="mr-1" /> Missing
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                        <span className="text-gray-900 dark:text-white">Test Scores</span>
                      </div>
                      {formData.documents.testScores ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <Check size={16} className="mr-1" /> Uploaded
                        </span>
                      ) : (
                        <span className={`flex items-center ${course.requiresTestScores ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          {course.requiresTestScores ? (
                            <>
                              <AlertTriangle size={16} className="mr-1" /> Missing
                            </>
                          ) : (
                            'Optional'
                          )}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                        <span className="text-gray-900 dark:text-white">Statement of Purpose</span>
                      </div>
                      {formData.documents.statementOfPurpose ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <Check size={16} className="mr-1" /> Uploaded
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 flex items-center">
                          <AlertTriangle size={16} className="mr-1" /> Missing
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                        <span className="text-gray-900 dark:text-white">Letter of Recommendation</span>
                      </div>
                      {formData.documents.recommendation ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <Check size={16} className="mr-1" /> Uploaded
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">
                          Optional
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Information (Optional)
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any additional information you'd like to share"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How did you hear about this course? (Optional)
                </label>
                <select
                  name="howDidYouHear"
                  value={formData.howDidYouHear}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  <option value="website">University Website</option>
                  <option value="search">Search Engine</option>
                  <option value="social">Social Media</option>
                  <option value="friend">Friend or Family</option>
                  <option value="alumni">Alumni</option>
                  <option value="event">Education Fair/Event</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mt-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeToTerms" className="font-medium text-gray-700 dark:text-gray-300">
                      I agree to the terms and conditions
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">
                      By submitting this application, I confirm that all information provided is accurate and complete.
                    </p>
                    {validationErrors.agreeToTerms && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validationErrors.agreeToTerms}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardBody>
        
        <CardFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center w-full">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                leftIcon={<ArrowLeft size={16} />}
              >
                Previous
              </Button>
            ) : (
              <div></div> // Empty div to maintain layout
            )}
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={saveDraft}
                leftIcon={<Save size={16} />}
                isLoading={isSaving}
              >
                Save Draft
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={goToNextStep}
                  rightIcon={<ArrowLeft size={16} className="rotate-180" />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  leftIcon={<Send size={16} />}
                  isLoading={isSubmitting}
                >
                  Submit Application
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CourseApplicationForm;