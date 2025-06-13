import React from 'react';
import { Calendar, Clock, DollarSign, BookOpen, Award, Users, ChevronRight } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { Course } from '../../types/course';
import { useNavigate } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
  variant?: 'compact' | 'full';
}

const CourseCard: React.FC<CourseCardProps> = ({ course, variant = 'full' }) => {
  const navigate = useNavigate();
  
  const handleApplyNow = () => {
    navigate(`/courses/${course.id}/apply`);
  };

  const handleViewDetails = () => {
    navigate(`/courses/${course.id}`);
  };

  if (variant === 'compact') {
    return (
      <Card hoverable={true} className="h-full">
        <CardBody className="p-5">
          <div className="flex flex-col h-full">
            {/* Course badge */}
            <div className="mb-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                course.isPopular 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {course.isPopular ? 'Popular' : course.level}
              </span>
            </div>
            
            {/* Course title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {course.title}
            </h3>
            
            {/* Quick info */}
            <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Starts {course.startDate}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{course.fees}</span>
              </div>
            </div>
            
            {/* Apply button */}
            <div className="mt-auto">
              <Button 
                onClick={handleApplyNow}
                className="w-full"
                size="sm"
              >
                Apply Now
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card hoverable={true} className="overflow-hidden">
      <CardBody className="p-6">
        <div className="flex flex-col lg:flex-row">
          {/* Course info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                course.isPopular 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}>
                {course.isPopular ? 'Popular' : course.level}
              </span>
              
              {course.isPopular && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {course.level}
                </span>
              )}
              
              {course.isOnline && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  Online
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {course.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {course.description}
            </p>
            
            {/* Course highlights */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="font-medium text-gray-900 dark:text-white">{course.duration}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{course.startDate}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fees</p>
                  <p className="font-medium text-gray-900 dark:text-white">{course.fees}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Users className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Class Size</p>
                  <p className="font-medium text-gray-900 dark:text-white">{course.classSize}</p>
                </div>
              </div>
            </div>
            
            {/* Key highlights */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Key Highlights:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {course.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-2 text-sm text-gray-600 dark:text-gray-400">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Action sidebar */}
          <div className="lg:w-64 lg:ml-6 mt-4 lg:mt-0 flex flex-col">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-3">
                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h4 className="font-medium text-gray-900 dark:text-white">Eligibility</h4>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                {course.eligibility.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight className="w-4 h-4 text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Button 
              onClick={handleApplyNow}
              className="w-full mb-3"
            >
              Apply Now
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleViewDetails}
              className="w-full"
            >
              View Details
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CourseCard;