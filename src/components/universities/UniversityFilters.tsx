import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Calendar,
  DollarSign,
  MapPin,
  GraduationCap,
  Award,
  Sliders
} from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface FilterOptions {
  searchQuery: string;
  countries: string[];
  studyLevels: string[];
  courses: string[];
  tuitionRange: string;
  acceptanceRate: string;
  applicationDeadline: string;
  scholarshipOnly: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface UniversityFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableCountries: string[];
  availableCourses: string[];
  availableStudyLevels: any[];
  totalResults: number;
  isLoading?: boolean;
}

const UniversityFilters: React.FC<UniversityFiltersProps> = ({
  filters,
  onFiltersChange,
  availableCountries,
  availableCourses,
  availableStudyLevels,
  totalResults,
  isLoading = false
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const tuitionRanges = [
    { value: '', label: 'Any Budget' },
    { value: 'free', label: 'Free Tuition' },
    { value: 'low', label: 'Under $10,000' },
    { value: 'medium', label: '$10,000 - $30,000' },
    { value: 'high', label: '$30,000 - $50,000' },
    { value: 'premium', label: 'Above $50,000' }
  ];

  const acceptanceRateRanges = [
    { value: '', label: 'Any Rate' },
    { value: 'very-competitive', label: 'Under 20%' },
    { value: 'competitive', label: '20% - 50%' },
    { value: 'moderate', label: '50% - 70%' },
    { value: 'accessible', label: 'Above 70%' }
  ];

  const deadlineOptions = [
    { value: '', label: 'Any Deadline' },
    { value: 'next-month', label: 'Next Month' },
    { value: 'next-3-months', label: 'Next 3 Months' },
    { value: 'next-6-months', label: 'Next 6 Months' },
    { value: 'next-year', label: 'Next Year' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'name', label: 'University Name' },
    { value: 'country', label: 'Country' },
    { value: 'acceptance-rate', label: 'Acceptance Rate' },
    { value: 'tuition', label: 'Tuition Cost' },
    { value: 'deadline', label: 'Application Deadline' }
  ];

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const updateArrayFilter = (key: keyof FilterOptions, value: string, checked: boolean) => {
    const currentArray = filters[key] as string[];
    let newArray;
    
    if (checked) {
      newArray = [...currentArray, value];
    } else {
      newArray = currentArray.filter(item => item !== value);
    }
    
    onFiltersChange({
      ...filters,
      [key]: newArray
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchQuery: '',
      countries: [],
      studyLevels: [],
      courses: [],
      tuitionRange: '',
      acceptanceRate: '',
      applicationDeadline: '',
      scholarshipOnly: false,
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
    setShowMobileFilters(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.countries.length > 0) count++;
    if (filters.studyLevels.length > 0) count++;
    if (filters.courses.length > 0) count++;
    if (filters.tuitionRange) count++;
    if (filters.acceptanceRate) count++;
    if (filters.applicationDeadline) count++;
    if (filters.scholarshipOnly) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <>
      {/* Desktop Filters */}
      <Card className="hidden lg:block mb-6">
        <CardBody className="p-6">
          {/* Main Search and Quick Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search universities, programs, or locations..."
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Country Filter */}
            <div className="lg:col-span-2">
              <select
                value={filters.countries[0] || ''}
                onChange={(e) => updateFilter('countries', e.target.value ? [e.target.value] : [])}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Countries</option>
                {availableCountries.slice(0, 20).map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Study Level Filter */}
            <div className="lg:col-span-2">
              <select
                value={filters.studyLevels[0] || ''}
                onChange={(e) => updateFilter('studyLevels', e.target.value ? [e.target.value] : [])}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Study Levels</option>
                {availableStudyLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>

            {/* Course Filter */}
            <div className="lg:col-span-2">
              <select
                value={filters.courses[0] || ''}
                onChange={(e) => updateFilter('courses', e.target.value ? [e.target.value] : [])}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Fields</option>
                {availableCourses.slice(0, 30).map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:col-span-2">
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <Sliders size={16} className="mr-2" />
                Advanced Filters
                <ChevronDown size={16} className={`ml-1 transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex items-center">
                <input
                  id="scholarshipOnly"
                  type="checkbox"
                  checked={filters.scholarshipOnly}
                  onChange={(e) => updateFilter('scholarshipOnly', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="scholarshipOnly" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Scholarships Available
                </label>
              </div>

              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  leftIcon={<X size={16} />}
                >
                  Clear All ({activeFilterCount})
                </Button>
              )}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isLoading ? 'Searching...' : `${totalResults.toLocaleString()} universities found`}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tuition Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <DollarSign size={16} className="inline mr-1" />
                    Tuition Range
                  </label>
                  <select
                    value={filters.tuitionRange}
                    onChange={(e) => updateFilter('tuitionRange', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {tuitionRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                {/* Acceptance Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Award size={16} className="inline mr-1" />
                    Acceptance Rate
                  </label>
                  <select
                    value={filters.acceptanceRate}
                    onChange={(e) => updateFilter('acceptanceRate', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {acceptanceRateRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                {/* Application Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Application Deadline
                  </label>
                  <select
                    value={filters.applicationDeadline}
                    onChange={(e) => updateFilter('applicationDeadline', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {deadlineOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multiple Selection Filters */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Multiple Countries */}
                {availableCountries.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <MapPin size={16} className="inline mr-1" />
                      Countries ({filters.countries.length} selected)
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-3 space-y-2">
                      {availableCountries.slice(0, 20).map(country => (
                        <label key={country} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.countries.includes(country)}
                            onChange={(e) => updateArrayFilter('countries', country, e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{country}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multiple Study Levels */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <GraduationCap size={16} className="inline mr-1" />
                    Study Levels ({filters.studyLevels.length} selected)
                  </label>
                  <div className="space-y-2">
                    {availableStudyLevels.map(level => (
                      <label key={level.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.studyLevels.includes(level.id)}
                          onChange={(e) => updateArrayFilter('studyLevels', level.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{level.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Mobile Filters */}
      <div className="lg:hidden mb-4">
        {/* Mobile Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search universities..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            leftIcon={<Filter size={16} />}
            className="flex-1 mr-2"
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
          
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
          {isLoading ? 'Searching...' : `${totalResults.toLocaleString()} universities found`}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileFilters(false)}
                  leftIcon={<X size={16} />}
                >
                  Close
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <select
                  value={filters.countries[0] || ''}
                  onChange={(e) => updateFilter('countries', e.target.value ? [e.target.value] : [])}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  <option value="">All Countries</option>
                  {availableCountries.slice(0, 20).map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Study Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Study Level
                </label>
                <select
                  value={filters.studyLevels[0] || ''}
                  onChange={(e) => updateFilter('studyLevels', e.target.value ? [e.target.value] : [])}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  <option value="">All Study Levels</option>
                  {availableStudyLevels.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              </div>

              {/* Field of Study */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Field of Study
                </label>
                <select
                  value={filters.courses[0] || ''}
                  onChange={(e) => updateFilter('courses', e.target.value ? [e.target.value] : [])}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  <option value="">All Fields</option>
                  {availableCourses.slice(0, 30).map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              {/* Tuition Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tuition Range
                </label>
                <select
                  value={filters.tuitionRange}
                  onChange={(e) => updateFilter('tuitionRange', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  {tuitionRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Acceptance Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Acceptance Rate
                </label>
                <select
                  value={filters.acceptanceRate}
                  onChange={(e) => updateFilter('acceptanceRate', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                >
                  {acceptanceRateRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Scholarships */}
              <div className="flex items-center">
                <input
                  id="scholarshipOnly-mobile"
                  type="checkbox"
                  checked={filters.scholarshipOnly}
                  onChange={(e) => updateFilter('scholarshipOnly', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="scholarshipOnly-mobile" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Scholarships Available Only
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UniversityFilters;