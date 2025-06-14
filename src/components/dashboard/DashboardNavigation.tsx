import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  GraduationCap, 
  User, 
  Settings, 
  Heart, 
  DollarSign, 
  BookOpen, 
  MessageSquare, 
  Bell, 
  HelpCircle 
} from 'lucide-react';

const DashboardNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { path: '/dashboard/applications', label: 'Applications', icon: <FileText size={18} /> },
    { path: '/dashboard/favorites', label: 'Favorites', icon: <Heart size={18} /> },
    { path: '/documents', label: 'Documents', icon: <BookOpen size={18} /> },
    { path: '/payments', label: 'Payments', icon: <DollarSign size={18} /> },
    { path: '/dashboard/profile', label: 'Profile', icon: <User size={18} /> },
    { path: '/dashboard/messages', label: 'Messages', icon: <MessageSquare size={18} /> },
    { path: '/dashboard/notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { path: '/dashboard/settings', label: 'Settings', icon: <Settings size={18} /> },
    { path: '/dashboard/help', label: 'Help & Support', icon: <HelpCircle size={18} /> }
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive(item.path)
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className={`mr-3 ${
                isActive(item.path)
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {item.icon}
              </span>
              {item.label}
              
              {/* Notification badge example */}
              {item.label === 'Messages' && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  3
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default DashboardNavigation;