import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import CourseCard from './CourseCard';
import { Course } from '../../types/course';
import { courseService } from '../../services/courseService';

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [onlineOnly, setOnlineOnly] = useState<boolean>(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourses();
        setCourses(data);
        setFilteredCourses(data);
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedLevel, selectedDuration, selectedStartDate, priceRange, onlineOnly, courses]);

  const applyFilters = () => {
    let filtered = [...courses];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query) || 
        course.description.toLowerCase().includes(query) ||
        course.university.toLowerCase().includes(query)
      );
    }

    // Apply level filter
    if (selectedLevel) {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Apply duration filter
    if (selectedDuration) {
      filtered = filtered.filter(course => {
        if (selectedDuration === 'short') return course.durationMonths <= 3;
        if (selectedDuration === 'medium') return course.durationMonths > 3 && course.durationMonths <= 12;
        if (selectedDuration === 'long') return course.durationMonths > 12;
        return true;
      });
    }

    // Apply start date filter
    if (selectedStartDate) {
      const now = new Date();
      const threeMonths = new Date(now.setMonth(now.getMonth() + 3));
      const sixMonths = new Date(now.setMonth(now.getMonth() + 3));
      
      filtered = filtered.filter(course => {
        const courseStartDate = new Date(course.startDateRaw);
        
        if (selectedStartDate === 'immediate') {
          return courseStartDate <= new Date();
        } else if (selectedStartDate === 'soon') {
          return courseStartDate > new Date() && courseStartDate <= threeMonths;
        } else if (selectedStartDate === 'future') {
          return courseStartDate > threeMonths && courseStartDate <= sixMonths;
        } else if (selectedStartDate === 'later') {
          return courseStartDate > sixMonths;
        }
        
        return true;
      });
    }

    // Apply price range filter
    filtered = filtered.filter(course => {
      const coursePrice = parseFloat(course.fees.replace(/[^0-9.]/g, ''));
      return coursePrice >= priceRange[0] && coursePrice <= priceRange[1];
    });

    // Apply online only filter
    if (onlineOnly) {
      filtered = filtered.filter(course => course.isOnline);
    }

    setFilteredCourses(filtered);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLevel('');
    setSelectedDuration('');
    setSelectedStartDate('');
    setPriceRange([0, 50000]);
    setOnlineOnly(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Available Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore our wide range of courses and find the perfect match for your academic journey
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search courses by title, description, or university..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal size={16} />}
            >
              Filters {showFilters ? 'Hide' : 'Show'}
            </Button>

            {/* View mode toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration
                  </label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any Duration</option>
                    <option value="short">Short (≤ 3 months)</option>
                    <option value="medium">Medium (3-12 months)</option>
                    <option value="long">Long (> 12 months)</option>
                  </select>
                </div>

                {/* Start Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <select
                    value={selectedStartDate}
                    onChange={(e) => setSelectedStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any Start Date</option>
                    <option value="immediate">Immediate</option>
                    <option value="soon">Within 3 months</option>
                    <option value="future">3-6 months</option>
                    <option value="later">Later than 6 months</option>
                  </select>
                </div>

                {/* Online Only Filter */}
                <div className="flex items-center">
                  <input
                    id="online-only"
                    type="checkbox"
                    checked={onlineOnly}
                    onChange={(e) => setOnlineOnly(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="online-only" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Online Courses Only
                  </label>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">$0</span>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">$50,000</span>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mr-3"
                >
                  Reset Filters
                </Button>
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Results Count */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
      </div>

      {/* Course List */}
      {filteredCourses.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-6"
        }>
          {filteredCourses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              variant={viewMode === 'grid' ? 'compact' : 'full'} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filter criteria
          </p>
          <Button onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseList;