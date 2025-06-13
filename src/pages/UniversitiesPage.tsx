import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UniversityList from '../components/universities/UniversityList';

const UniversitiesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <UniversityList />
      </div>
      <Footer />
    </div>
  );
};

export default UniversitiesPage;