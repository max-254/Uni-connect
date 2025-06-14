import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
              <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Access Denied
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
              You don't have permission to access this page.
            </p>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {user ? (
                  <>Your current role ({user.role}) doesn't have the required permissions.</>
                ) : (
                  <>Please log in to access this resource.</>
                )}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate(-1)}
                  leftIcon={<ArrowLeft size={16} />}
                  variant="outline"
                >
                  Go Back
                </Button>
                
                <Button
                  onClick={() => navigate('/')}
                >
                  Go to Homepage
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UnauthorizedPage;