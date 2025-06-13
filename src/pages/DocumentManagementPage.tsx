import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import AdminDocumentManager from '../components/documents/AdminDocumentManager';
import StudentDocumentDashboard from '../components/documents/StudentDocumentDashboard';

const DocumentManagementPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isAdmin ? <AdminDocumentManager /> : <StudentDocumentDashboard />}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DocumentManagementPage;