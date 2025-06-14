import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export const useAuditLog = () => {
  const { user } = useAuth();

  const logEvent = useCallback(
    async (action: string, resource: string, details: any = {}) => {
      if (!user) return;

      try {
        await authService.logAuditEvent(user.id, action, resource, details);
      } catch (error) {
        console.error('Failed to log audit event:', error);
        // Don't throw here to prevent disrupting the user experience
      }
    },
    [user]
  );

  return { logEvent };
};