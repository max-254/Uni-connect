import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/user';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  hasPermission: (resource: string, action: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      
      // Log successful login
      await authService.logAuditEvent(
        loggedInUser.id,
        'login',
        'auth',
        { method: 'password' }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole = 'student') => {
    try {
      setLoading(true);
      setError(null);
      
      const newUser = await authService.register(email, password, name, role);
      setUser(newUser);
      
      // Log successful registration
      await authService.logAuditEvent(
        newUser.id,
        'register',
        'auth',
        { method: 'password', role }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Log logout event before actually logging out
      if (user) {
        await authService.logAuditEvent(
          user.id,
          'logout',
          'auth',
          {}
        );
      }
      
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const hasPermission = async (resource: string, action: string): Promise<boolean> => {
    if (!user) return false;
    
    return await authService.hasPermission(user.id, resource, action);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout,
      hasPermission,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};