import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, GraduationCap, BookOpen, Award, DollarSign, CreditCard, Banknote } from 'lucide-react';
import { universityService, UniversityData, University } from '../../services/universityService';
import { Card, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface FilterState {
  searchQuery: string;
  selectedCountry: string;
  selectedCourse: string;
  selectedStudyLevel: string;
}

const UniversityList: React.FC = () => {
  const [universities, setUniversities] = useState<UniversityData[]>([]);
  const [transformedUniversities, setTransformedUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [studyLevels, setStudyLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCountry: '',
    selectedCourse: '',
    selectedStudyLevel: ''
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transformedUniversities, filters]);

  // Parse URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const country = urlParams.get('country');
    const course = urlParams.get('course');
    const level = urlParams.get('level');
    
    if (country || course || level) {
      setFilters(prev => ({
        ...prev,
        selectedCountry: country || '',
        selectedCourse: course || '',
        selectedStudyLevel: level || ''
      }));
    }
  }, []);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [universitiesData, countriesData] = await Promise.all([
        universityService.fetchUniversities(),
        universityService.getCountries()
      ]);
      
      // Transform universities to include course and study level data
      const transformed = universitiesData.map(uni => 
        universityService.transformToAppUniversity(uni)
      );
      
      setUniversities(universitiesData);
      setTransformedUniversities(transformed);
      setCountries(countriesData);
      setCourses(universityService.getAllCourses());
      setStudyLevels(universityService.getStudyLevels());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = transformedUniversities;

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        uni => 
          uni.name.toLowerCase().includes(query) ||
          uni.country.toLowerCase().includes(query) ||
          (uni.stateProvince && uni.stateProvince.toLowerCase().includes(query)) ||
          uni.courses.some(course => course.toLowerCase().includes(query))
      );
    }

    // Country filter
    if (filters.selectedCountry) {
      filtered = filtered.filter(uni => uni.country === filters.selectedCountry);
    }

    // Course filter
    if (filters.selectedCourse) {
      filtered = filtered.filter(uni => 
        uni.courses.some(course => 
          course.toLowerCase().includes(filters.selectedCourse.toLowerCase())
        )
      );
    }

    // Study level filter
    if (filters.selectedStudyLevel) {
      filtered = filtered.filter(uni => 
        uni.studyLevels.includes(filters.selectedStudyLevel)
      );
    }

    setFilteredUniversities(filtered);
    setCurrentPage(1);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCountry: '',
      selectedCourse: '',
      selectedStudyLevel: ''
    });
  };

  const getStudyLevelName = (levelId: string) => {
    const level = studyLevels.find(l => l.id === levelId);
    return level ? level.name : levelId;
  };

  // Pagination
  const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUniversities = filteredUniversities.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading universities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={loadUniversities}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Explore Universities Worldwide
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover {universities.length.toLocaleString()} universities from around the globe with detailed international student fees
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search universities, countries, or courses..."
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filters.selectedCountry}
              onChange={(e) => updateFilter('selectedCountry', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={filters.selectedCourse}
              onChange={(e) => updateFilter('selectedCourse', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>

            <select
              value={filters.selectedStudyLevel}
              onChange={(e) => updateFilter('selectedStudyLevel', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Study Levels</option>
              {studyLevels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                leftIcon={<Filter size={16} />}
              >
                Clear All Filters
              </Button>
              
              {/* Active Filters Display */}
              <div className="flex flex-wrap gap-2">
                {filters.selectedCountry && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    Country: {filters.selectedCountry}
                    <button
                      onClick={() => updateFilter('selectedCountry', '')}
                      className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.selectedCourse && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Course: {filters.selectedCourse}
                    <button
                      onClick={() => updateFilter('selectedCourse', '')}
                      className="ml-1 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.selectedStudyLevel && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    Level: {getStudyLevelName(filters.selectedStudyLevel)}
                    <button
                      onClick={() => updateFilter('selectedStudyLevel', '')}
                      className="ml-1 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredUniversities.length)} of {filteredUniversities.length.toLocaleString()} universities
            </div>
          </div>
        </div>

        {/* University Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentUniversities.map((university, index) => (
            <Card key={`${university.id}-${index}`} hoverable={true} className="overflow-hidden">
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {university.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin size={14} className="mr-1" />
                      <span>
                        {university.country}
                        {university.stateProvince && `, ${university.stateProvince}`}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* International Student Fees */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <DollarSign size={16} className="mr-2 text-green-600 dark:text-green-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">International Student Fees</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Tuition Fee</p>
                        <p className="font-medium text-gray-900 dark:text-white">{university.internationalFees.tuitionFee}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Living Costs</p>
                        <p className="font-medium text-gray-900 dark:text-white">{university.internationalFees.livingCosts}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600 dark:text-gray-400">Total Estimate</p>
                        <p className="font-bold text-lg text-green-600 dark:text-green-400">{university.internationalFees.totalEstimate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center text-xs">
                        <CreditCard size={12} className="mr-1 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">App Fee: {university.internationalFees.applicationFee}</span>
                      </div>
                      {university.internationalFees.scholarshipAvailable && (
                        <div className="flex items-center text-xs">
                          <Award size={12} className="mr-1 text-yellow-500" />
                          <span className="text-yellow-600 dark:text-yellow-400">Scholarships Available</span>
                        </div>
                      )}
                    </div>
                    
                    {university.internationalFees.financialAidPercentage && (
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        <Banknote size={12} className="inline mr-1" />
                        {university.internationalFees.financialAidPercentage} of students receive financial aid
                      </div>
                    )}
                  </div>

                  {/* Study Levels */}
                  <div>
                    <div className="flex items-center mb-2">
                      <Award size={14} className="mr-1 text-gray-500" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Study Levels:</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {university.studyLevels.slice(0, 3).map((levelId, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                        >
                          {getStudyLevelName(levelId)}
                        </span>
                      ))}
                      {university.studyLevels.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          +{university.studyLevels.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Available Courses */}
                  <div>
                    <div className="flex items-center mb-2">
                      <BookOpen size={14} className="mr-1 text-gray-500" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Courses:</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {university.courses.slice(0, 3).map((course, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        >
                          {course}
                        </span>
                      ))}
                      {university.courses.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          +{university.courses.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* University Info */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Acceptance Rate</p>
                        <p className="font-medium text-gray-900 dark:text-white">{university.acceptanceRate}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Language Test</p>
                        <p className="font-medium text-gray-900 dark:text-white">{university.requirements.languageTest}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Domains:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {university.domains.slice(0, 2).map((domain, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          >
                            {domain}
                          </span>
                        ))}
                        {university.domains.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            +{university.domains.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredUniversities.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No universities found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters to see more results.
            </p>
            <Button onClick={clearFilters}>Clear All Filters</Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityList;