import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseList from '../components/courses/CourseList';

const CoursesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <CourseList />
      </div>
      <Footer />
    </div>
  );
};

export default CoursesPage;