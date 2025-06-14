export type UserRole = 'student' | 'admin' | 'institution_admin' | 'super_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileComplete: boolean;
  institutionId?: string; // For institution admins
}

export interface UserPermission {
  id: string;
  roleId: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}