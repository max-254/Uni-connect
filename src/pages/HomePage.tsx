import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Hero from '../components/home/Hero';
import { Card, CardBody } from '../components/ui/Card';
import { Check, BarChart3, Users, FileText, Search, Globe, BookOpen, Award } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-16">
        <Hero />
      </div>
      
      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              How UniMatch Works
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Find your perfect university match in 4 simple steps
            </p>
          </div>
          
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">1. Create Profile</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Sign up and complete your academic profile with your qualifications and preferences.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">2. Upload Documents</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Upload your academic transcripts, test scores, and other required documents.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">3. Get Matched</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Our algorithm analyzes your profile and matches you with suitable universities.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Check className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">4. Apply with Confidence</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Apply to your matched universities with guidance throughout the process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Why Choose UniMatch
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Discover the unique benefits of our platform
            </p>
          </div>
          
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card hoverable={true} className="overflow-hidden">
                <div className="h-2 bg-blue-500" />
                <CardBody className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Smart Matching</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Our algorithm finds universities that best match your academic profile, career goals, and preferences.
                  </p>
                </CardBody>
              </Card>
              
              <Card hoverable={true} className="overflow-hidden">
                <div className="h-2 bg-purple-500" />
                <CardBody className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Global Network</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Access to over 1,000 universities across 50+ countries with detailed information and requirements.
                  </p>
                </CardBody>
              </Card>
              
              <Card hoverable={true} className="overflow-hidden">
                <div className="h-2 bg-green-500" />
                <CardBody className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Expert Guidance</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Access resources, tips, and personalized guidance throughout your application journey.
                  </p>
                </CardBody>
              </Card>
              
              <Card hoverable={true} className="overflow-hidden">
                <div className="h-2 bg-red-500" />
                <CardBody className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-red-600 dark:text-red-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Scholarship Matching</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Find scholarships and financial aid opportunities that match your profile and needs.
                  </p>
                </CardBody>
              </Card>
              
              <Card hoverable={true} className="overflow-hidden">
                <div className="h-2 bg-yellow-500" />
                <CardBody className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Document Analysis</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Our system analyzes your documents to ensure they meet university requirements and suggests improvements.
                  </p>
                </CardBody>
              </Card>
              
              <Card hoverable={true} className="overflow-hidden">
                <div className="h-2 bg-indigo-500" />
                <CardBody className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Community Support</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Connect with students who have been accepted to your target universities for advice and insights.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Success Stories
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Hear from students who found their perfect university match
            </p>
          </div>
          
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  name: 'Sarah Johnson',
                  location: 'USA to UK',
                  image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
                  quote: 'UniMatch helped me find and get accepted to my dream university in London. The matching algorithm was spot on!',
                  university: 'London School of Economics',
                },
                {
                  name: 'Michael Chen',
                  location: 'China to Canada',
                  image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
                  quote: 'I was overwhelmed by the application process until I found UniMatch. Now I\'m studying Computer Science at my top choice university.',
                  university: 'University of Toronto',
                },
                {
                  name: 'Aisha Patel',
                  location: 'India to Australia',
                  image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
                  quote: 'The document screening saved me from submitting an incomplete application. Thanks to UniMatch, I got a scholarship too!',
                  university: 'University of Melbourne',
                },
              ].map((testimonial, index) => (
                <div key={index} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                  <div className="flex-shrink-0">
                    <img className="h-48 w-full object-cover" src={testimonial.image} alt={testimonial.name} />
                  </div>
                  <div className="flex flex-1 flex-col justify-between bg-white dark:bg-gray-700 p-6">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {testimonial.location}
                      </p>
                      <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
                        "{testimonial.quote}"
                      </p>
                    </div>
                    <div className="mt-6">
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Student at {testimonial.university}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Partner Universities */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Our Partner Universities
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Connecting students with top institutions worldwide
            </p>
          </div>
          
          <div className="mt-12">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex justify-center">
                  <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">University {i}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Start Your Journey Today
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Join thousands of students who found their perfect university match
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  Create Your Profile
                </a>
              </div>
              <div className="ml-3 inline-flex">
                <a
                  href="/universities"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700"
                >
                  Explore Universities
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default HomePage;