import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ApplicationSuccess from '../components/courses/ApplicationSuccess';

const ApplicationSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <ApplicationSuccess />
      </div>
      <Footer />
    </div>
  );
};

export default ApplicationSuccessPage;