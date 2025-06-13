import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Award, 
  DollarSign, 
  Calendar, 
  Globe, 
  Users, 
  Star,
  ExternalLink,
  Heart,
  Share2,
  Download,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Building,
  Briefcase
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { University } from '../../services/universityService';

interface UniversityDetailModalProps {
  university: University | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (universityId: string) => void;
}

const UniversityDetailModal: React.FC<UniversityDetailModalProps> = ({
  university,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'admissions' | 'costs' | 'requirements'>('overview');

  if (!isOpen || !university) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineStatus = (deadline: string) => {
    const daysLeft = getDaysUntilDeadline(deadline);
    
    if (daysLeft < 0) {
      return { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20', text: 'Deadline passed', urgent: true };
    } else if (daysLeft <= 30) {
      return { color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20', text: `${daysLeft} days left`, urgent: true };
    } else if (daysLeft <= 90) {
      return { color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20', text: `${daysLeft} days left`, urgent: false };
    } else {
      return { color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20', text: `${daysLeft} days left`, urgent: false };
    }
  };

  const deadlineStatus = getDeadlineStatus(university.applicationDeadline);

  const getAcceptanceRateColor = (rate: string) => {
    const numRate = parseInt(rate.replace('%', ''));
    if (numRate < 20) return 'text-red-600 dark:text-red-400';
    if (numRate < 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* University Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About {university.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {university.description} This prestigious institution offers world-class education with state-of-the-art facilities, 
          renowned faculty, and a diverse student community from around the globe. The university is committed to academic 
          excellence, research innovation, and preparing students for successful careers in their chosen fields.
        </p>
      </div>

      {/* Key Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">25,000+</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
            <Building className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Faculties</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
            <Globe className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">100+</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Countries</p>
          </div>
        </div>
      </div>

      {/* Rankings & Recognition */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rankings & Recognition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="font-medium text-gray-900 dark:text-white">QS World Ranking</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">#150</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Global Universities</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Award className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="font-medium text-gray-900 dark:text-white">Subject Rankings</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">Top 50</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Engineering & Technology</p>
          </div>
        </div>
      </div>

      {/* Campus Life */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campus Life</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Facilities</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Modern library with 24/7 access</li>
              <li>• State-of-the-art research laboratories</li>
              <li>• Sports complex and fitness center</li>
              <li>• Student accommodation on campus</li>
              <li>• International student support services</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Student Life</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• 200+ student clubs and societies</li>
              <li>• Career counseling and job placement</li>
              <li>• Cultural events and festivals</li>
              <li>• Study abroad exchange programs</li>
              <li>• Mentorship programs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProgramsTab = () => (
    <div className="space-y-6">
      {/* Study Levels */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Study Levels</h3>
        <div className="flex flex-wrap gap-2">
          {university.studyLevels.map((level, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
            >
              <GraduationCap size={14} className="mr-2" />
              {level}
            </span>
          ))}
        </div>
      </div>

      {/* Programs by Category */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Programs by Field</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {university.courses.map((course, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center mb-2">
                <BookOpen size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-white text-sm">{course}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p>Duration: 2-4 years</p>
                <p>Mode: Full-time</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Programs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Popular Programs</h3>
        <div className="space-y-3">
          {university.courses.slice(0, 5).map((course, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{course}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bachelor's & Master's available</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">High Demand</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Apply early</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdmissionsTab = () => (
    <div className="space-y-6">
      {/* Application Deadline */}
      <div className={`p-4 rounded-lg border-2 ${deadlineStatus.urgent ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800'} ${deadlineStatus.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className={`w-6 h-6 mr-3 ${deadlineStatus.color}`} />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Application Deadline</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(university.applicationDeadline)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold ${deadlineStatus.color}`}>{deadlineStatus.text}</p>
            {deadlineStatus.urgent && (
              <p className="text-xs text-red-600 dark:text-red-400">Apply soon!</p>
            )}
          </div>
        </div>
      </div>

      {/* Admission Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admission Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
            <p className={`text-2xl font-bold ${getAcceptanceRateColor(university.acceptanceRate)}`}>
              {university.acceptanceRate}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Acceptance Rate</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">15,000+</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Applications/Year</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">3,500+</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">International Students</p>
          </div>
        </div>
      </div>

      {/* Application Process */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Process</h3>
        <div className="space-y-4">
          {[
            { step: 1, title: 'Online Application', description: 'Complete the online application form with personal and academic details' },
            { step: 2, title: 'Document Submission', description: 'Upload required documents including transcripts, CV, and personal statement' },
            { step: 3, title: 'Language Proficiency', description: 'Submit IELTS/TOEFL scores or equivalent language test results' },
            { step: 4, title: 'Application Review', description: 'University reviews your application (4-6 weeks processing time)' },
            { step: 5, title: 'Interview (if required)', description: 'Some programs may require an interview or portfolio review' },
            { step: 6, title: 'Decision Notification', description: 'Receive admission decision via email and student portal' }
          ].map((item) => (
            <div key={item.step} className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Dates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Important Dates</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-900 dark:text-white">Application Opens</span>
            <span className="text-gray-600 dark:text-gray-400">September 1, 2024</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-900 dark:text-white">Early Decision Deadline</span>
            <span className="text-gray-600 dark:text-gray-400">November 15, 2024</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-900 dark:text-white">Regular Decision Deadline</span>
            <span className="text-gray-600 dark:text-gray-400">{formatDate(university.applicationDeadline)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-900 dark:text-white">Decision Notification</span>
            <span className="text-gray-600 dark:text-gray-400">April 1, 2025</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCostsTab = () => (
    <div className="space-y-6">
      {/* Tuition & Fees Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tuition & Fees (International Students)</h3>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">Annual Tuition</span>
              <span className="font-semibold text-gray-900 dark:text-white">{university.internationalFees.tuitionFee}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">Application Fee</span>
              <span className="font-semibold text-gray-900 dark:text-white">{university.internationalFees.applicationFee}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">Living Expenses (Est.)</span>
              <span className="font-semibold text-gray-900 dark:text-white">{university.internationalFees.livingCosts}</span>
            </div>
            <div className="flex items-center justify-between py-3 bg-white dark:bg-gray-800 rounded-lg px-4">
              <span className="font-semibold text-gray-900 dark:text-white">Total Annual Cost</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">{university.internationalFees.totalEstimate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Living Costs Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Living Costs Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Accommodation</span>
              <span className="font-medium text-gray-900 dark:text-white">$8,000 - $12,000</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Food & Dining</span>
              <span className="font-medium text-gray-900 dark:text-white">$3,000 - $5,000</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Transportation</span>
              <span className="font-medium text-gray-900 dark:text-white">$1,000 - $2,000</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Books & Supplies</span>
              <span className="font-medium text-gray-900 dark:text-white">$800 - $1,200</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Personal Expenses</span>
              <span className="font-medium text-gray-900 dark:text-white">$1,500 - $2,500</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Health Insurance</span>
              <span className="font-medium text-gray-900 dark:text-white">$1,000 - $1,500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scholarships & Financial Aid */}
      {university.internationalFees.scholarshipAvailable && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scholarships & Financial Aid</h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" />
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Scholarships Available</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-yellow-700 dark:text-yellow-300">Merit-based Scholarships</span>
                <span className="font-medium text-yellow-800 dark:text-yellow-200">Up to 50% tuition</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-700 dark:text-yellow-300">Need-based Financial Aid</span>
                <span className="font-medium text-yellow-800 dark:text-yellow-200">Case by case</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-700 dark:text-yellow-300">International Student Grants</span>
                <span className="font-medium text-yellow-800 dark:text-yellow-200">$2,000 - $5,000</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Scholarship applications are typically due 2-3 months before the regular admission deadline. 
                Early application is recommended for better scholarship opportunities.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payment Schedule</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Tuition paid per semester</li>
              <li>• Payment due before semester start</li>
              <li>• Payment plans available</li>
              <li>• Late payment fees apply</li>
            </ul>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Accepted Payment Methods</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Bank transfer (preferred)</li>
              <li>• Credit/Debit cards</li>
              <li>• International money orders</li>
              <li>• Third-party payment services</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRequirementsTab = () => (
    <div className="space-y-6">
      {/* Academic Requirements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">Minimum GPA</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{university.requirements.gpa}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">On a 4.0 scale</p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Globe className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">Language Proficiency</span>
              </div>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">{university.requirements.languageTest}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Minimum required score</p>
            </div>
          </div>

          <div className="space-y-4">
            {university.requirements.otherTests && university.requirements.otherTests.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <span className="font-medium text-gray-900 dark:text-white">Standardized Tests</span>
                </div>
                <div className="space-y-1">
                  {university.requirements.otherTests.map((test, idx) => (
                    <p key={idx} className="text-sm text-gray-600 dark:text-gray-400">• {test}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">Application Deadline</span>
              </div>
              <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">{formatDate(university.applicationDeadline)}</p>
              <p className={`text-sm ${deadlineStatus.color}`}>{deadlineStatus.text}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Required Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { doc: 'Academic Transcripts', required: true, description: 'Official transcripts from all attended institutions' },
            { doc: 'Degree Certificates', required: true, description: 'Copies of all degree certificates and diplomas' },
            { doc: 'Personal Statement', required: true, description: 'Statement of purpose (500-1000 words)' },
            { doc: 'Letters of Recommendation', required: true, description: '2-3 letters from academic or professional references' },
            { doc: 'CV/Resume', required: true, description: 'Updated curriculum vitae or resume' },
            { doc: 'Language Test Scores', required: true, description: 'IELTS/TOEFL or equivalent test results' },
            { doc: 'Passport Copy', required: true, description: 'Valid passport identification page' },
            { doc: 'Financial Documents', required: true, description: 'Proof of financial support for studies' },
            { doc: 'Portfolio', required: false, description: 'Required for art, design, and architecture programs' },
            { doc: 'Work Experience Letters', required: false, description: 'For programs requiring professional experience' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                {item.required ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{item.doc}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                  item.required 
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' 
                    : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                }`}>
                  {item.required ? 'Required' : 'Optional'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Program-Specific Requirements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Program-Specific Requirements</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Engineering Programs</h4>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-200">
              <li>• Strong background in Mathematics and Physics</li>
              <li>• SAT Subject Tests in Math Level 2 and Physics (recommended)</li>
              <li>• Previous coursework in calculus and chemistry</li>
            </ul>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Business Programs</h4>
            <ul className="space-y-1 text-sm text-green-700 dark:text-green-200">
              <li>• GMAT scores for MBA programs</li>
              <li>• Work experience (2+ years for MBA)</li>
              <li>• Strong quantitative and analytical skills</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Arts & Design Programs</h4>
            <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-200">
              <li>• Portfolio submission required</li>
              <li>• Creative writing samples (for relevant programs)</li>
              <li>• Interview may be required</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{university.name}</h2>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <MapPin size={16} className="mr-1" />
                <span>{university.country}</span>
                {university.stateProvince && <span>, {university.stateProvince}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(university.id)}
              leftIcon={<Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />}
              className={isFavorite ? 'text-red-500' : 'text-gray-400'}
            >
              {isFavorite ? 'Saved' : 'Save'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Share2 size={16} />}
            >
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              leftIcon={<X size={16} />}
            >
              Close
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Info },
              { id: 'programs', label: 'Programs', icon: BookOpen },
              { id: 'admissions', label: 'Admissions', icon: GraduationCap },
              { id: 'costs', label: 'Costs', icon: DollarSign },
              { id: 'requirements', label: 'Requirements', icon: CheckCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'programs' && renderProgramsTab()}
          {activeTab === 'admissions' && renderAdmissionsTab()}
          {activeTab === 'costs' && renderCostsTab()}
          {activeTab === 'requirements' && renderRequirementsTab()}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" leftIcon={<ExternalLink size={16} />}>
              Apply Now
            </Button>
            <Button variant="outline" className="flex-1" leftIcon={<Download size={16} />}>
              Download Brochure
            </Button>
            <Button variant="outline" className="flex-1" leftIcon={<Briefcase size={16} />}>
              Contact Admissions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetailModal;