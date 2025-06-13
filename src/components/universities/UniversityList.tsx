import React, { useState, useEffect } from 'react';
import { GraduationCap, AlertTriangle } from 'lucide-react';
import { universityService, UniversityData, University } from '../../services/universityService';
import { Card, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import UniversityFilters from './UniversityFilters';
import UniversityCard from './UniversityCard';
import UniversityDetailModal from './UniversityDetailModal';

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
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<FilterOptions>({
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
        countries: country ? [country] : [],
        courses: course ? [course] : [],
        studyLevels: level ? [level] : []
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
    let filtered = [...transformedUniversities];

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
    if (filters.countries.length > 0) {
      filtered = filtered.filter(uni => filters.countries.includes(uni.country));
    }

    // Course filter
    if (filters.courses.length > 0) {
      filtered = filtered.filter(uni => 
        filters.courses.some(filterCourse =>
          uni.courses.some(course => 
            course.toLowerCase().includes(filterCourse.toLowerCase())
          )
        )
      );
    }

    // Study level filter
    if (filters.studyLevels.length > 0) {
      filtered = filtered.filter(uni => 
        filters.studyLevels.some(level => uni.studyLevels.includes(level))
      );
    }

    // Tuition range filter
    if (filters.tuitionRange) {
      filtered = filtered.filter(uni => matchesTuitionRange(uni, filters.tuitionRange));
    }

    // Acceptance rate filter
    if (filters.acceptanceRate) {
      filtered = filtered.filter(uni => matchesAcceptanceRate(uni, filters.acceptanceRate));
    }

    // Application deadline filter
    if (filters.applicationDeadline) {
      filtered = filtered.filter(uni => matchesDeadline(uni, filters.applicationDeadline));
    }

    // Scholarship filter
    if (filters.scholarshipOnly) {
      filtered = filtered.filter(uni => uni.scholarshipsAvailable || uni.internationalFees.scholarshipAvailable);
    }

    // Apply sorting
    filtered = applySorting(filtered, filters.sortBy, filters.sortOrder);

    setFilteredUniversities(filtered);
    setCurrentPage(1);
  };

  const matchesTuitionRange = (university: University, range: string): boolean => {
    const tuitionInfo = university.internationalFees.tuitionFee.toLowerCase();
    
    switch (range) {
      case 'free':
        return tuitionInfo.includes('free') || tuitionInfo.includes('€500') || tuitionInfo.includes('$500');
      case 'low':
        return extractMaxTuition(tuitionInfo) < 10000;
      case 'medium':
        const maxTuition = extractMaxTuition(tuitionInfo);
        return maxTuition >= 10000 && maxTuition <= 30000;
      case 'high':
        const highMaxTuition = extractMaxTuition(tuitionInfo);
        return highMaxTuition > 30000 && highMaxTuition <= 50000;
      case 'premium':
        return extractMaxTuition(tuitionInfo) > 50000;
      default:
        return true;
    }
  };

  const extractMaxTuition = (tuitionInfo: string): number => {
    // Extract numbers from tuition string and return the maximum
    const numbers = tuitionInfo.match(/[\d,]+/g);
    if (!numbers) return 0;
    
    const maxNumber = Math.max(...numbers.map(n => parseInt(n.replace(/,/g, ''))));
    return maxNumber;
  };

  const matchesAcceptanceRate = (university: University, range: string): boolean => {
    const rate = parseInt(university.acceptanceRate.replace('%', ''));
    
    switch (range) {
      case 'very-competitive':
        return rate < 20;
      case 'competitive':
        return rate >= 20 && rate <= 50;
      case 'moderate':
        return rate > 50 && rate <= 70;
      case 'accessible':
        return rate > 70;
      default:
        return true;
    }
  };

  const matchesDeadline = (university: University, range: string): boolean => {
    const deadline = new Date(university.applicationDeadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (range) {
      case 'next-month':
        return diffDays <= 30 && diffDays > 0;
      case 'next-3-months':
        return diffDays <= 90 && diffDays > 0;
      case 'next-6-months':
        return diffDays <= 180 && diffDays > 0;
      case 'next-year':
        return diffDays <= 365 && diffDays > 0;
      default:
        return true;
    }
  };

  const applySorting = (universities: University[], sortBy: string, sortOrder: 'asc' | 'desc'): University[] => {
    const sorted = [...universities].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'country':
          comparison = a.country.localeCompare(b.country);
          break;
        case 'acceptance-rate':
          const rateA = parseInt(a.acceptanceRate.replace('%', ''));
          const rateB = parseInt(b.acceptanceRate.replace('%', ''));
          comparison = rateA - rateB;
          break;
        case 'tuition':
          const tuitionA = extractMaxTuition(a.internationalFees.tuitionFee);
          const tuitionB = extractMaxTuition(b.internationalFees.tuitionFee);
          comparison = tuitionA - tuitionB;
          break;
        case 'deadline':
          const deadlineA = new Date(a.applicationDeadline).getTime();
          const deadlineB = new Date(b.applicationDeadline).getTime();
          comparison = deadlineA - deadlineB;
          break;
        default: // relevance
          // For relevance, we can use a combination of factors
          const scoreA = calculateRelevanceScore(a, filters.searchQuery);
          const scoreB = calculateRelevanceScore(b, filters.searchQuery);
          comparison = scoreB - scoreA; // Higher score first
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  };

  const calculateRelevanceScore = (university: University, searchQuery: string): number => {
    if (!searchQuery) return 0;
    
    let score = 0;
    const query = searchQuery.toLowerCase();
    
    // Name match gets highest score
    if (university.name.toLowerCase().includes(query)) score += 10;
    
    // Country match
    if (university.country.toLowerCase().includes(query)) score += 5;
    
    // Course match
    if (university.courses.some(course => course.toLowerCase().includes(query))) score += 8;
    
    // State/Province match
    if (university.stateProvince && university.stateProvince.toLowerCase().includes(query)) score += 3;
    
    return score;
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

  const handleViewDetails = (university: University) => {
    setSelectedUniversity(university);
    setShowDetailModal(true);
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
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Failed to Load Universities
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={loadUniversities}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Explore Universities
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Discover {universities.length.toLocaleString()} universities worldwide with advanced filtering
          </p>
        </div>

        {/* Filters */}
        <UniversityFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableCountries={countries}
          availableCourses={courses}
          availableStudyLevels={studyLevels}
          totalResults={filteredUniversities.length}
          isLoading={loading}
        />

        {/* View Mode Toggle - Desktop */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredUniversities.length)} of {filteredUniversities.length.toLocaleString()} universities
          </div>
          
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
        </div>

        {/* University Grid/List */}
        <div className={`mb-8 ${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' 
            : 'space-y-6'
        }`}>
          {currentUniversities.map((university, index) => (
            <UniversityCard
              key={`${university.id}-${index}`}
              university={university}
              isFavorite={favorites.has(university.id)}
              onToggleFavorite={toggleFavorite}
              onViewDetails={handleViewDetails}
              viewMode={viewMode}
              highlightQuery={filters.searchQuery}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredUniversities.length === 0 && !loading && (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No universities found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters to see more results.
            </p>
            <Button onClick={() => setFilters({
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
            })}>
              Clear All Filters
            </Button>
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

      {/* University Detail Modal */}
      <UniversityDetailModal
        university={selectedUniversity}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        isFavorite={selectedUniversity ? favorites.has(selectedUniversity.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
};

export default UniversityList;