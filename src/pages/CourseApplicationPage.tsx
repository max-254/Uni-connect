import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseApplicationForm from '../components/courses/CourseApplicationForm';

const CourseApplicationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <CourseApplicationForm />
      </div>
      <Footer />
    </div>
  );
};

export default CourseApplicationPage;