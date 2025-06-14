import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const usePermission = (resource: string, action: string) => {
  const { hasPermission, isAuthenticated } = useAuth();
  const [permitted, setPermitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      if (!isAuthenticated) {
        setPermitted(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const hasAccess = await hasPermission(resource, action);
        setPermitted(hasAccess);
      } catch (error) {
        console.error('Permission check error:', error);
        setPermitted(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [resource, action, isAuthenticated, hasPermission]);

  const checkPermission = useCallback(
    async (res: string, act: string) => {
      if (!isAuthenticated) return false;
      return await hasPermission(res, act);
    },
    [isAuthenticated, hasPermission]
  );

  return { permitted, loading, checkPermission };
};