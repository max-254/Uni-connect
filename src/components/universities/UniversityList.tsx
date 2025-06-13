import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, GraduationCap, BookOpen, Award, DollarSign, CreditCard, Banknote, Heart, ExternalLink, Calendar, Users, Star, ChevronDown, ChevronUp, X } from 'lucide-react';
import { universityService, UniversityData, University } from '../../services/universityService';
import { Card, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface FilterState {
  searchQuery: string;
  selectedCountry: string;
  selectedCourse: string;
  selectedStudyLevel: string;
  priceRange: string;
  scholarshipOnly: boolean;
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
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCountry: '',
    selectedCourse: '',
    selectedStudyLevel: '',
    priceRange: '',
    scholarshipOnly: false
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

    // Scholarship filter
    if (filters.scholarshipOnly) {
      filtered = filtered.filter(uni => uni.internationalFees.scholarshipAvailable);
    }

    setFilteredUniversities(filtered);
    setCurrentPage(1);
  };

  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
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
      selectedStudyLevel: '',
      priceRange: '',
      scholarshipOnly: false
    });
    setShowMobileFilters(false);
  };

  const toggleFavorite = (universityId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(universityId)) {
        newFavorites.delete(universityId);
      } else {
        newFavorites.add(universityId);
      }
      return newFavorites;
    });
  };

  const toggleCardExpansion = (universityId: string) => {
    setExpandedCards(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(universityId)) {
        newExpanded.delete(universityId);
      } else {
        newExpanded.add(universityId);
      }
      return newExpanded;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile-First Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Explore Universities
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Discover {universities.length.toLocaleString()} universities worldwide
          </p>
        </div>

        {/* Mobile Search Bar */}
        <div className="mb-4 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search universities..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10 pr-4 py-3 text-base"
            />
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between mb-4 sm:hidden">
          <Button
            variant="outline"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            leftIcon={<Filter size={16} />}
            className="flex-1 mr-2"
          >
            Filters
            {Object.values(filters).some(v => v && v !== '') && (
              <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {Object.values(filters).filter(v => v && v !== '').length}
              </span>
            )}
          </Button>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              List
            </Button>
          </div>
        </div>

        {/* Mobile Filters Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 sm:hidden">
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
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
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <select
                    value={filters.selectedCountry}
                    onChange={(e) => updateFilter('selectedCountry', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                  >
                    <option value="">All Countries</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Field of Study
                  </label>
                  <select
                    value={filters.selectedCourse}
                    onChange={(e) => updateFilter('selectedCourse', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                  >
                    <option value="">All Fields</option>
                    {courses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Study Level
                  </label>
                  <select
                    value={filters.selectedStudyLevel}
                    onChange={(e) => updateFilter('selectedStudyLevel', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                  >
                    <option value="">All Levels</option>
                    {studyLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="scholarshipOnly"
                    type="checkbox"
                    checked={filters.scholarshipOnly}
                    onChange={(e) => updateFilter('scholarshipOnly', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="scholarshipOnly" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Scholarships Available Only
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={clearFilters}
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
        )}

        {/* Desktop Filters */}
        <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative lg:col-span-2">
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

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <input
                  id="scholarshipOnly-desktop"
                  type="checkbox"
                  checked={filters.scholarshipOnly}
                  onChange={(e) => updateFilter('scholarshipOnly', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="scholarshipOnly-desktop" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Scholarships Available
                </label>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                leftIcon={<Filter size={16} />}
              >
                Clear Filters
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {startIndex + 1}-{Math.min(endIndex, filteredUniversities.length)} of {filteredUniversities.length.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count - Mobile */}
        <div className="flex items-center justify-between mb-4 sm:hidden">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredUniversities.length.toLocaleString()} universities found
          </div>
        </div>

        {/* University Grid/List */}
        <div className={`mb-8 ${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' 
            : 'space-y-4'
        }`}>
          {currentUniversities.map((university, index) => (
            <Card 
              key={`${university.id}-${index}`} 
              hoverable={true} 
              className={`overflow-hidden transition-all duration-200 ${
                viewMode === 'list' ? 'w-full' : ''
              }`}
            >
              <CardBody className={`p-4 sm:p-6 ${viewMode === 'list' ? 'flex flex-col sm:flex-row gap-4 sm:gap-6' : ''}`}>
                {/* University Header */}
                <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
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
                        onClick={() => toggleFavorite(university.id)}
                        className={`p-2 rounded-full transition-colors ${
                          favorites.has(university.id)
                            ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      >
                        <Heart size={16} fill={favorites.has(university.id) ? 'currentColor' : 'none'} />
                      </button>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-300" />
                      </div>
                    </div>
                  </div>

                  {/* International Student Fees - Compact for Mobile */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-3 sm:p-4 mb-4">
                    <div className="flex items-center mb-2 sm:mb-3">
                      <DollarSign size={14} className="mr-2 text-green-600 dark:text-green-400" />
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">International Fees</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Tuition</p>
                        <p className="font-medium text-gray-900 dark:text-white truncate">{university.internationalFees.tuitionFee}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Living</p>
                        <p className="font-medium text-gray-900 dark:text-white truncate">{university.internationalFees.livingCosts}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600 dark:text-gray-400">Total Estimate</p>
                        <p className="font-bold text-base sm:text-lg text-green-600 dark:text-green-400">{university.internationalFees.totalEstimate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center text-xs">
                        <CreditCard size={10} className="mr-1 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">App: {university.internationalFees.applicationFee}</span>
                      </div>
                      {university.internationalFees.scholarshipAvailable && (
                        <div className="flex items-center text-xs">
                          <Award size={10} className="mr-1 text-yellow-500" />
                          <span className="text-yellow-600 dark:text-yellow-400">Scholarships</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm mb-4">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Acceptance Rate</p>
                      <p className="font-medium text-gray-900 dark:text-white">{university.acceptanceRate}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Language Test</p>
                      <p className="font-medium text-gray-900 dark:text-white">{university.requirements.languageTest}</p>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  <div className={`transition-all duration-200 ${
                    expandedCards.has(university.id) ? 'block' : 'hidden sm:block'
                  }`}>
                    {/* Study Levels */}
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <Award size={12} className="mr-1 text-gray-500" />
                        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Study Levels:</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {university.studyLevels.slice(0, 2).map((levelId, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                          >
                            {getStudyLevelName(levelId)}
                          </span>
                        ))}
                        {university.studyLevels.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            +{university.studyLevels.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Available Courses */}
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <BookOpen size={12} className="mr-1 text-gray-500" />
                        <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Popular Courses:</p>
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
                            +{university.courses.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Expand/Collapse Button */}
                  <button
                    onClick={() => toggleCardExpansion(university.id)}
                    className="sm:hidden w-full flex items-center justify-center py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    {expandedCards.has(university.id) ? (
                      <>
                        Show Less <ChevronUp size={16} className="ml-1" />
                      </>
                    ) : (
                      <>
                        Show More <ChevronDown size={16} className="ml-1" />
                      </>
                    )}
                  </button>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                    <Button className="flex-1 text-sm" size="sm">
                      Apply Now
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 text-sm" 
                      size="sm"
                      leftIcon={<BookOpen size={14} />}
                    >
                      View Details
                    </Button>
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Mobile Pagination */}
            <div className="flex items-center space-x-2 sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden sm:flex items-center space-x-2">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityList;