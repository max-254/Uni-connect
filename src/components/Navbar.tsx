import React, { useState } from 'react';
import { Menu, X, Globe, User, FileText, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import Button from './ui/Button';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm fixed w-full z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">UniMatch</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="/" 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Home
            </a>
            <a 
              href="/universities" 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Universities
            </a>
            {isAuthenticated && (
              <>
                <a 
                  href="/dashboard" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Dashboard
                </a>
              </>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="flex items-center space-x-3">
                  <div className="hidden lg:block text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Student
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <a href="/dashboard">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        leftIcon={<FileText size={16} />}
                        className="hidden lg:flex"
                        onClick={() => window.location.href = '/dashboard'}
                      >
                        Documents
                      </Button>
                    </a>
                    <a href="/dashboard">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        leftIcon={<User size={16} />}
                        className="hidden lg:flex"
                      >
                        Profile
                      </Button>
                    </a>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={logout}
                    >
                      Sign out
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <a href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </a>
                <a href="/signup">
                  <Button variant="primary" size="sm">
                    Sign up
                  </Button>
                </a>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            <ThemeToggle size="sm" />
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <a 
              href="/" 
              className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              Home
            </a>
            <a 
              href="/universities" 
              className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              Universities
            </a>
            {isAuthenticated && (
              <>
                <a 
                  href="/dashboard" 
                  className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  Dashboard
                </a>
              </>
            )}
          </div>
          
          {/* Mobile user section */}
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {isAuthenticated ? (
              <div className="px-4 space-y-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                      {user?.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                  <button className="ml-auto p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 relative">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                </div>
                
                <div className="space-y-2">
                  <a href="/dashboard" className="block">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      leftIcon={<FileText size={16} />}
                    >
                      Documents
                    </Button>
                  </a>
                  <a href="/dashboard" className="block">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      leftIcon={<User size={16} />}
                    >
                      Profile
                    </Button>
                  </a>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={logout}
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="px-4 space-y-2">
                <a href="/login" className="block">
                  <Button variant="ghost" className="w-full">
                    Sign in
                  </Button>
                </a>
                <a href="/signup" className="block">
                  <Button variant="primary" className="w-full">
                    Sign up
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;