import React, { useState, useEffect } from 'react';
import { ArrowRight, GraduationCap, Search, MapPin, BookOpen, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { universityService } from '../../services/universityService';
import Button from '../ui/Button';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studyLevel: '',
    fieldOfStudy: '',
    country: ''
  });
  const [courses, setCourses] = useState<string[]>([]);
  const [studyLevels, setStudyLevels] = useState<any[]>([]);

  useEffect(() => {
    // Load courses and study levels
    setCourses(universityService.getAllCourses());
    setStudyLevels(universityService.getStudyLevels());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to universities page with filters
    const params = new URLSearchParams();
    if (formData.country) params.set('country', formData.country);
    if (formData.fieldOfStudy) params.set('course', formData.fieldOfStudy);
    if (formData.studyLevel) params.set('level', formData.studyLevel);
    
    navigate(`/universities?${params.toString()}`);
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white bg-opacity-5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white bg-opacity-15 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-6">
                <GraduationCap size={16} className="mr-2" />
                Now open for 2025 applications
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-6">
                Find Your Perfect
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                  University Match
                </span>
                <span className="block">Abroad</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0">
                Explore thousands of universities worldwide. Get matched with institutions that fit your qualifications, 
                and receive guidance throughout your application journey.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button
                  onClick={() => navigate('/universities')}
                  className="bg-white text-blue-700 hover:bg-blue-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                  rightIcon={<ArrowRight size={20} />}
                >
                  Explore Universities
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-700 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                  onClick={() => navigate('/about')}
                >
                  Learn More
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-blue-100">
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="ml-3 font-medium text-sm sm:text-base">15,000+ Students</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-blue-300"></div>
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <span className="ml-2 font-medium text-sm sm:text-base">4.9/5 Rating</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-blue-300"></div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  <span className="font-medium text-sm sm:text-base">50+ Countries</span>
                </div>
              </div>
            </div>

            {/* Right Content - Search Form */}
            <div className="w-full max-w-md mx-auto lg:max-w-none">
              <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    Quick University Search
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Find programs matching your preferences
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Study Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Study Level
                    </label>
                    <select
                      name="studyLevel"
                      value={formData.studyLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    >
                      <option value="">Select Study Level</option>
                      {studyLevels.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Field of Study */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field of Study
                    </label>
                    <select
                      name="fieldOfStudy"
                      value={formData.fieldOfStudy}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    >
                      <option value="">Select Field of Study</option>
                      {courses.slice(0, 20).map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    >
                      <option value="">Select Destination Country</option>
                      <option value="United States">🇺🇸 United States</option>
                      <option value="United Kingdom">🇬🇧 United Kingdom</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="Australia">🇦🇺 Australia</option>
                      <option value="Germany">🇩🇪 Germany</option>
                      <option value="Netherlands">🇳🇱 Netherlands</option>
                      <option value="France">🇫🇷 France</option>
                      <option value="Sweden">🇸🇪 Sweden</option>
                      <option value="Norway">🇳🇴 Norway</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit"
                    className="w-full py-3 sm:py-4 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    rightIcon={<ArrowRight size={20} />}
                  >
                    Find Universities
                  </Button>
                </form>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    By using our service, you agree to our{' '}
                    <a href="/terms" className="text-blue-600 hover:underline">Terms</a>,{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>, and{' '}
                    <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;