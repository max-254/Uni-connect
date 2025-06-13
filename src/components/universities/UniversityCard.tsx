import React, { useState } from 'react';
import { 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Award, 
  DollarSign, 
  CreditCard, 
  Heart, 
  ExternalLink, 
  Calendar, 
  Users, 
  Star, 
  ChevronDown, 
  ChevronUp,
  Clock,
  CheckCircle,
  Globe,
  TrendingUp
} from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { University } from '../../services/universityService';

interface UniversityCardProps {
  university: University;
  isFavorite: boolean;
  onToggleFavorite: (universityId: string) => void;
  onViewDetails: (university: University) => void;
  viewMode?: 'grid' | 'list';
}

const UniversityCard: React.FC<UniversityCardProps> = ({
  university,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
  viewMode = 'grid'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
      return { color: 'text-red-600 dark:text-red-400', text: 'Deadline passed', urgent: true };
    } else if (daysLeft <= 30) {
      return { color: 'text-red-600 dark:text-red-400', text: `${daysLeft} days left`, urgent: true };
    } else if (daysLeft <= 90) {
      return { color: 'text-yellow-600 dark:text-yellow-400', text: `${daysLeft} days left`, urgent: false };
    } else {
      return { color: 'text-green-600 dark:text-green-400', text: `${daysLeft} days left`, urgent: false };
    }
  };

  const deadlineStatus = getDeadlineStatus(university.applicationDeadline);

  const renderGridView = () => (
    <Card hoverable={true} className="overflow-hidden h-full">
      <CardBody className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {university.name}
            </h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <MapPin size={14} className="mr-1 flex-shrink-0" />
              <span className="truncate">
                {university.country}
                {university.stateProvince && `, ${university.stateProvince}`}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-2">
            <button
              onClick={() => onToggleFavorite(university.id)}
              className={`p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Acceptance</p>
            <p className="font-semibold text-gray-900 dark:text-white">{university.acceptanceRate}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">GPA Req.</p>
            <p className="font-semibold text-gray-900 dark:text-white">{university.requirements.gpa}</p>
          </div>
        </div>

        {/* Tuition Info */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-2">
            <DollarSign size={14} className="mr-2 text-green-600 dark:text-green-400" />
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">International Fees</h4>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tuition:</span>
              <span className="font-medium text-gray-900 dark:text-white">{university.internationalFees.tuitionFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Est.:</span>
              <span className="font-bold text-green-600 dark:text-green-400">{university.internationalFees.totalEstimate}</span>
            </div>
          </div>
          {university.internationalFees.scholarshipAvailable && (
            <div className="flex items-center mt-2 text-xs">
              <Award size={10} className="mr-1 text-yellow-500" />
              <span className="text-yellow-600 dark:text-yellow-400">Scholarships Available</span>
            </div>
          )}
        </div>

        {/* Deadline */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">Deadline:</span>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(university.applicationDeadline)}
              </p>
              <p className={`text-xs ${deadlineStatus.color}`}>
                {deadlineStatus.text}
              </p>
            </div>
          </div>
        </div>

        {/* Programs Preview */}
        <div className="mb-4 flex-1">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Popular Programs:</h4>
          <div className="flex flex-wrap gap-1">
            {university.courses.slice(0, 3).map((course, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                {course}
              </span>
            ))}
            {university.courses.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                +{university.courses.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-auto">
          <Button 
            className="w-full" 
            size="sm"
            onClick={() => onViewDetails(university)}
          >
            View Details
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            size="sm"
            leftIcon={<ExternalLink size={14} />}
          >
            Apply Now
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  const renderListView = () => (
    <Card hoverable={true} className="overflow-hidden">
      <CardBody className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {university.name}
                  </h3>
                  <button
                    onClick={() => onToggleFavorite(university.id)}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                  >
                    <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <MapPin size={14} className="mr-1" />
                  <span>{university.country}</span>
                  {university.stateProvince && <span>, {university.stateProvince}</span>}
                  <span className="mx-2">•</span>
                  <Globe size={14} className="mr-1" />
                  <span>{university.requirements.languageTest}</span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {university.description}
                </p>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Acceptance Rate</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{university.acceptanceRate}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">GPA Required</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{university.requirements.gpa}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tuition</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-xs">{university.internationalFees.tuitionFee}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Deadline</p>
                    <p className={`font-semibold text-xs ${deadlineStatus.color}`}>
                      {deadlineStatus.text}
                    </p>
                  </div>
                </div>

                {/* Programs */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Programs:</h4>
                  <div className="flex flex-wrap gap-1">
                    {university.courses.slice(0, isExpanded ? university.courses.length : 6).map((course, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      >
                        {course}
                      </span>
                    ))}
                    {university.courses.length > 6 && !isExpanded && (
                      <button
                        onClick={() => setIsExpanded(true)}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        +{university.courses.length - 6} more
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Study Levels:</h5>
                        <div className="flex flex-wrap gap-1">
                          {university.studyLevels.map((level, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                            >
                              {level}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Requirements:</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Min GPA:</span>
                            <span className="font-medium">{university.requirements.gpa}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Language:</span>
                            <span className="font-medium">{university.requirements.languageTest}</span>
                          </div>
                          {university.requirements.otherTests && university.requirements.otherTests.length > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Other Tests:</span>
                              <span className="font-medium">{university.requirements.otherTests.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:w-80 space-y-4">
            {/* Financial Info */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <DollarSign size={16} className="mr-2 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">International Fees</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tuition:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{university.internationalFees.tuitionFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Living:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{university.internationalFees.livingCosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Application:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{university.internationalFees.applicationFee}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Estimate:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{university.internationalFees.totalEstimate}</span>
                  </div>
                </div>
              </div>
              
              {university.internationalFees.scholarshipAvailable && (
                <div className="flex items-center mt-3 text-sm">
                  <Award size={14} className="mr-2 text-yellow-500" />
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">Scholarships Available</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => onViewDetails(university)}
                leftIcon={<BookOpen size={16} />}
              >
                View Full Details
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                leftIcon={<ExternalLink size={16} />}
              >
                Apply Now
              </Button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
              >
                {isExpanded ? (
                  <>
                    Show Less <ChevronUp size={16} className="ml-1" />
                  </>
                ) : (
                  <>
                    Show More <ChevronDown size={16} className="ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return viewMode === 'grid' ? renderGridView() : renderListView();
};

export default UniversityCard;