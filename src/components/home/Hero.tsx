import React, { useState, useEffect } from 'react';
import { ArrowRight, GraduationCap } from 'lucide-react';
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
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
      {/* Decorative elements */}
      <div className="hidden lg:block lg:absolute lg:inset-0">
        <svg
          className="absolute left-full transform -translate-y-3/4 -translate-x-1/4 md:-translate-y-1/2 lg:-translate-x-1/2"
          width="404"
          height="784"
          fill="none"
          viewBox="0 0 404 784"
        >
          <defs>
            <pattern
              id="5d0dd344-b041-4d26-bec4-8d33ea57ec9b"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <rect x="0" y="0" width="4" height="4" fill="rgba(255, 255, 255, 0.1)" />
            </pattern>
          </defs>
          <rect width="404" height="784" fill="url(#5d0dd344-b041-4d26-bec4-8d33ea57ec9b)" />
        </svg>
      </div>

      <div className="relative pt-6 pb-16 sm:pb-24">
        <main className="mt-16 sm:mt-24">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="px-4 sm:px-6 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
                <div>
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <GraduationCap size={16} className="mr-1" />
                    Now open for 2025 applications
                  </div>
                  <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:text-5xl lg:mt-6 xl:text-6xl">
                    <span className="block">Find Your Perfect</span>
                    <span className="block text-blue-200">University Match Abroad</span>
                  </h1>
                  <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    Explore thousands of universities worldwide. Get matched with institutions that fit your qualifications, 
                    and receive guidance throughout your application journey.
                  </p>
                  <div className="mt-8 sm:mt-10">
                    <div className="sm:flex sm:justify-center lg:justify-start">
                      <div className="rounded-md shadow">
                        <button
                          onClick={() => navigate('/universities')}
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10 transition-colors"
                        >
                          Explore Universities
                        </button>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <a
                          href="/about"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 bg-opacity-60 hover:bg-opacity-70 md:py-4 md:text-lg md:px-10 transition-colors"
                        >
                          Learn More
                        </a>
                      </div>
                    </div>
                    
                    <div className="mt-6 sm:mt-8">
                      <p className="text-xs text-blue-200 uppercase tracking-wide font-semibold">
                        Trusted by students from over 50 countries
                      </p>
                      <div className="mt-2 w-full flex justify-center lg:justify-start">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center">
                            <div className="flex -space-x-1 overflow-hidden">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                  key={i}
                                  className={`inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-${400 + i * 100} text-xs text-white flex items-center justify-center font-medium`}
                                >
                                  {String.fromCharCode(64 + i)}
                                </div>
                              ))}
                            </div>
                            <span className="ml-3 text-sm font-medium text-blue-100">+15K Users</span>
                          </div>
                          <div className="h-4 w-px bg-blue-400" />
                          <div className="text-sm font-medium text-blue-100">4.9 ★★★★★</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6">
                <div className="bg-white sm:max-w-md sm:w-full sm:mx-auto sm:rounded-lg sm:overflow-hidden">
                  <div className="px-4 py-8 sm:px-10">
                    <div>
                      <p className="text-lg font-medium text-gray-700 text-center">
                        Quick University Search
                      </p>
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        Find programs matching your preferences
                      </p>
                    </div>

                    <div className="mt-6">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="study-level" className="sr-only">
                            Study Level
                          </label>
                          <select
                            id="study-level"
                            name="studyLevel"
                            value={formData.studyLevel}
                            onChange={handleInputChange}
                            className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                          >
                            <option value="">Select Study Level</option>
                            {studyLevels.map(level => (
                              <option key={level.id} value={level.id}>{level.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="field-of-study" className="sr-only">
                            Field of Study
                          </label>
                          <select
                            id="field-of-study"
                            name="fieldOfStudy"
                            value={formData.fieldOfStudy}
                            onChange={handleInputChange}
                            className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                          >
                            <option value="">Select Field of Study</option>
                            {courses.slice(0, 20).map(course => (
                              <option key={course} value={course}>{course}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="country" className="sr-only">
                            Destination Country
                          </label>
                          <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                          >
                            <option value="">Select Destination Country</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                            <option value="Germany">Germany</option>
                            <option value="Netherlands">Netherlands</option>
                            <option value="France">France</option>
                            <option value="Sweden">Sweden</option>
                            <option value="Norway">Norway</option>
                          </select>
                        </div>

                        <div>
                          <Button 
                            className="w-full" 
                            rightIcon={<ArrowRight size={16} />}
                            type="submit"
                          >
                            Find Universities
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="px-4 py-6 bg-gray-50 border-t-2 border-gray-200 sm:px-10">
                    <p className="text-xs leading-5 text-gray-500">
                      By using our service, you agree to our{' '}
                      <a href="#" className="font-medium text-gray-900 hover:underline">
                        Terms
                      </a>
                      ,{' '}
                      <a href="#" className="font-medium text-gray-900 hover:underline">
                        Data Policy
                      </a>{' '}
                      and{' '}
                      <a href="#" className="font-medium text-gray-900 hover:underline">
                        Cookies Policy
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Hero;