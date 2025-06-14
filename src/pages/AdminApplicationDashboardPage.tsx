import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ApplicationManagementDashboard from '../components/admin/ApplicationManagementDashboard';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminApplicationDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  
  // Redirect if not authenticated or not an admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ApplicationManagementDashboard />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminApplicationDashboardPage;