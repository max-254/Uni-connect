import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface PermissionGateProps {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({ 
  resource, 
  action, 
  children, 
  fallback = null 
}) => {
  const { hasPermission, isAuthenticated } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      if (!isAuthenticated) {
        setHasAccess(false);
        setChecking(false);
        return;
      }

      try {
        const permitted = await hasPermission(resource, action);
        setHasAccess(permitted);
      } catch (error) {
        console.error('Permission check error:', error);
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    };

    checkPermission();
  }, [resource, action, isAuthenticated, hasPermission]);

  if (checking) {
    return null; // Or a loading indicator if preferred
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGate;