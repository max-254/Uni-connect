import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

interface SessionTimeoutHandlerProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
}

const SessionTimeoutHandler: React.FC<SessionTimeoutHandlerProps> = ({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout
}) => {
  const { isAuthenticated, logout, refreshUser } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Reset timer on user activity
  const resetTimer = () => {
    setLastActivity(Date.now());
    setShowWarning(false);
  };

  // Handle user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Clean up
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated]);

  // Check for session timeout
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = Math.floor((now - lastActivity) / 1000 / 60);
      
      if (timeSinceLastActivity >= timeoutMinutes) {
        // Session timeout
        clearInterval(interval);
        setShowWarning(false);
        if (onTimeout) {
          onTimeout();
        } else {
          logout();
        }
      } else if (timeSinceLastActivity >= (timeoutMinutes - warningMinutes)) {
        // Show warning
        setShowWarning(true);
        setTimeLeft(timeoutMinutes - timeSinceLastActivity);
      } else {
        setShowWarning(false);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, timeoutMinutes, warningMinutes, logout, onTimeout]);

  // Extend session
  const extendSession = async () => {
    try {
      await refreshUser();
      resetTimer();
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  };

  if (!showWarning || !isAuthenticated) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-md">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Clock className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Session Timeout Warning
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Your session will expire in {timeLeft} {timeLeft === 1 ? 'minute' : 'minutes'} due to inactivity.
            </p>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                onClick={extendSession}
                leftIcon={<RefreshCw size={14} />}
              >
                Extend Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutHandler;