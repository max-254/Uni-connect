import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types/user';

class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // User authentication
  async login(email: string, password: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // Fetch user profile with role information
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Return user with role information
      return {
        id: data.user.id,
        email: data.user.email || '',
        name: profileData.full_name || '',
        role: profileData.role as UserRole,
        profileComplete: !!profileData.profile_complete
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid login credentials');
    }
  }

  async register(email: string, password: string, name: string, role: UserRole = 'student'): Promise<User> {
    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role
          }
        }
      });

      if (error) throw error;
      
      if (!data.user) {
        throw new Error('User creation failed');
      }

      // Create profile record with role information
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: name,
            role,
            profile_complete: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      
      if (profileError) throw profileError;
      
      // Return user with role information
      return {
        id: data.user.id,
        email: data.user.email || '',
        name,
        role,
        profileComplete: false
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Failed to register user');
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to log out');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await supabase.auth.getUser();
      
      if (!data.user) return null;
      
      // Fetch user profile with role information
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Return user with role information
      return {
        id: data.user.id,
        email: data.user.email || '',
        name: profileData.full_name || '',
        role: profileData.role as UserRole,
        profileComplete: !!profileData.profile_complete
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Two-factor authentication
  async enableTwoFactor(userId: string): Promise<void> {
    try {
      // In a real implementation, this would generate a TOTP secret and QR code
      // For demo purposes, we'll just update a flag in the user's profile
      
      const { error } = await supabase
        .from('profiles')
        .update({ two_factor_enabled: true })
        .eq('id', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Enable 2FA error:', error);
      throw new Error('Failed to enable two-factor authentication');
    }
  }

  async disableTwoFactor(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ two_factor_enabled: false })
        .eq('id', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Disable 2FA error:', error);
      throw new Error('Failed to disable two-factor authentication');
    }
  }

  async verifyTwoFactor(userId: string, token: string): Promise<boolean> {
    try {
      // In a real implementation, this would verify the TOTP token
      // For demo purposes, we'll just return true
      return true;
    } catch (error) {
      console.error('Verify 2FA error:', error);
      throw new Error('Failed to verify two-factor authentication');
    }
  }

  // Password management
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Update password error:', error);
      throw new Error('Failed to update password');
    }
  }

  // Session management
  async refreshSession(): Promise<void> {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
    } catch (error) {
      console.error('Refresh session error:', error);
      throw new Error('Failed to refresh session');
    }
  }

  // Role-based access control
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      // Fetch user role
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      const role = data.role as UserRole;
      
      // Check permission based on role
      // In a real implementation, this would query a permissions table
      // For demo purposes, we'll use a simple role-based check
      
      switch (role) {
        case 'super_admin':
          // Super admins have all permissions
          return true;
        
        case 'admin':
          // Admins have most permissions except some super admin specific ones
          if (resource === 'system_settings' && action === 'modify') {
            return false;
          }
          return true;
        
        case 'institution_admin':
          // Institution admins can only access their institution's data
          if (resource === 'application' && (action === 'read' || action === 'update')) {
            // In a real implementation, we would check if the application belongs to their institution
            return true;
          }
          return false;
        
        case 'student':
          // Students can only access their own data
          if (resource === 'application' && action === 'read_own') {
            return true;
          }
          return false;
        
        default:
          return false;
      }
    } catch (error) {
      console.error('Check permission error:', error);
      return false;
    }
  }

  // Audit logging
  async logAuditEvent(userId: string, action: string, resource: string, details: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert([
          {
            user_id: userId,
            action,
            resource,
            details,
            ip_address: '127.0.0.1', // In a real app, this would be the actual IP
            user_agent: navigator.userAgent,
            created_at: new Date().toISOString()
          }
        ]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Audit logging error:', error);
      // Don't throw here to prevent disrupting the user experience
      // Just log the error
    }
  }
}

export const authService = AuthService.getInstance();