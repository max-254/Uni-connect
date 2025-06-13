import React, { useState } from 'react';
import { Menu, X, Globe, Moon, Sun, User, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from './ui/Button';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">UniMatch</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="/" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Home
              </a>
              <a href="/universities" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Universities
              </a>
              {isAuthenticated && (
                <>
                  <a href="/dashboard" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Dashboard
                  </a>
                  <a href="/profile/documents" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Documents
                  </a>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user?.name}
                </span>
                <div className="flex items-center space-x-2">
                  <a href="/profile/documents">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      leftIcon={<FileText size={18} />}
                    >
                      Documents
                    </Button>
                  </a>
                  <a href="/dashboard">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      leftIcon={<User size={18} />}
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
            ) : (
              <div className="flex items-center space-x-2">
                <a href="/login">
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </a>
                <a href="/register">
                  <Button variant="primary" size="sm">
                    Sign up
                  </Button>
                </a>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white focus:outline-none mr-2"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <a href="/" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              Home
            </a>
            <a href="/universities" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              Universities
            </a>
            {isAuthenticated && (
              <>
                <a href="/dashboard" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Dashboard
                </a>
                <a href="/profile/documents" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Documents
                </a>
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {isAuthenticated ? (
              <div className="space-y-2 px-4">
                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                  {user?.name}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {user?.email}
                </div>
                <div className="mt-3 space-y-1">
                  <a href="/profile/documents" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Documents
                  </a>
                  <a href="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Profile
                  </a>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 px-4">
                <a href="/login">
                  <Button variant="outline" className="w-full mb-2">
                    Sign in
                  </Button>
                </a>
                <a href="/register">
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