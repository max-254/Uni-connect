/*
  # Security and Access Control Migration

  This migration creates security-related tables and functions for the application:
  
  1. New Tables
    - `audit_logs` - Records user actions for auditing purposes
    - `user_sessions` - Tracks user login sessions
    - `permissions` - Defines available permissions in the system
    - `role_permissions` - Maps permissions to roles
    - `security_logs` - Records security-related events
  
  2. Functions
    - `current_user_id()` - Helper function to get the current user ID
  
  3. Security
    - Adds RLS policies for all tables
    - Adds two-factor authentication columns to profiles table
    - Inserts default permissions and role assignments
*/

-- Helper function to get current user ID (replacement for auth.uid())
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub', 
    '00000000-0000-0000-0000-000000000000'
  )::uuid;
$$;

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  resource text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  user_name text,
  user_role text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'audit_logs' AND policyname = 'Admins can view all audit logs'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admins can view all audit logs"
        ON public.audit_logs
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = current_user_id() AND profiles.role = 'admin'
          )
        )
    $policy$;
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'audit_logs' AND policyname = 'Users can view their own audit logs'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can view their own audit logs"
        ON public.audit_logs
        FOR SELECT
        USING (user_id = current_user_id())
    $policy$;
  END IF;
END
$$;

-- User Sessions Table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  last_activity timestamptz DEFAULT now() NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for user_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'user_sessions' AND policyname = 'Users can view their own sessions'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can view their own sessions"
        ON public.user_sessions
        FOR SELECT
        USING (user_id = current_user_id())
    $policy$;
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'user_sessions' AND policyname = 'Users can delete their own sessions'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can delete their own sessions"
        ON public.user_sessions
        FOR DELETE
        USING (user_id = current_user_id())
    $policy$;
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'user_sessions' AND policyname = 'Admins can view all sessions'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admins can view all sessions"
        ON public.user_sessions
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = current_user_id() AND profiles.role = 'admin'
          )
        )
    $policy$;
  END IF;
END
$$;

-- Permissions Table
CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(resource, action)
);

-- Enable RLS on permissions
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Policies for permissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'permissions' AND policyname = 'Anyone can view permissions'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Anyone can view permissions"
        ON public.permissions
        FOR SELECT
        USING (true)
    $policy$;
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'permissions' AND policyname = 'Only admins can modify permissions'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Only admins can modify permissions"
        ON public.permissions
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = current_user_id() AND profiles.role = 'admin'
          )
        )
    $policy$;
  END IF;
END
$$;

-- Role Permissions Table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  conditions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(role, permission_id)
);

-- Enable RLS on role_permissions
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for role_permissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'role_permissions' AND policyname = 'Anyone can view role permissions'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Anyone can view role permissions"
        ON public.role_permissions
        FOR SELECT
        USING (true)
    $policy$;
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'role_permissions' AND policyname = 'Only admins can modify role permissions'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Only admins can modify role permissions"
        ON public.role_permissions
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = current_user_id() AND profiles.role = 'admin'
          )
        )
    $policy$;
  END IF;
END
$$;

-- Security Logs Table
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  description text NOT NULL,
  ip_address text,
  user_agent text,
  location text,
  browser text,
  success boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on security_logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Policies for security_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'security_logs' AND policyname = 'Users can view their own security logs'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can view their own security logs"
        ON public.security_logs
        FOR SELECT
        USING (user_id = current_user_id())
    $policy$;
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'security_logs' AND policyname = 'Admins can view all security logs'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admins can view all security logs"
        ON public.security_logs
        FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = current_user_id() AND profiles.role = 'admin'
          )
        )
    $policy$;
  END IF;
END
$$;

-- Add two-factor authentication columns to profiles if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles') THEN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_secret text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS session_timeout_minutes integer DEFAULT 30;
  END IF;
END
$$;

-- Insert default permissions
INSERT INTO public.permissions (resource, action, description)
VALUES
  ('application', 'create', 'Create a new application'),
  ('application', 'read', 'View application details'),
  ('application', 'update', 'Update application details'),
  ('application', 'delete', 'Delete an application'),
  ('application', 'read_own', 'View own application details'),
  ('application', 'update_own', 'Update own application details'),
  ('application', 'delete_own', 'Delete own application'),
  
  ('university', 'create', 'Create a new university'),
  ('university', 'read', 'View university details'),
  ('university', 'update', 'Update university details'),
  ('university', 'delete', 'Delete a university'),
  
  ('student_profile', 'create', 'Create a student profile'),
  ('student_profile', 'read', 'View student profile details'),
  ('student_profile', 'update', 'Update student profile details'),
  ('student_profile', 'delete', 'Delete a student profile'),
  ('student_profile', 'read_own', 'View own student profile'),
  ('student_profile', 'update_own', 'Update own student profile'),
  
  ('document', 'upload', 'Upload a document'),
  ('document', 'read', 'View document details'),
  ('document', 'delete', 'Delete a document'),
  ('document', 'upload_own', 'Upload own document'),
  ('document', 'read_own', 'View own document details'),
  ('document', 'delete_own', 'Delete own document'),
  
  ('user', 'create', 'Create a new user'),
  ('user', 'read', 'View user details'),
  ('user', 'update', 'Update user details'),
  ('user', 'delete', 'Delete a user'),
  ('user', 'update_own', 'Update own user details'),
  
  ('system_settings', 'read', 'View system settings'),
  ('system_settings', 'modify', 'Modify system settings'),
  
  ('audit_logs', 'read', 'View audit logs'),
  ('security_logs', 'read', 'View security logs'),
  ('security_logs', 'read_own', 'View own security logs')
ON CONFLICT (resource, action) DO NOTHING;

-- Assign permissions to roles
DO $$
DECLARE
  perm_id uuid;
BEGIN
  -- Insert permissions for admin role
  FOR perm_id IN SELECT id FROM public.permissions 
    WHERE resource != 'system_settings' OR action != 'modify'
  LOOP
    INSERT INTO public.role_permissions (role, permission_id)
    VALUES ('admin', perm_id)
    ON CONFLICT (role, permission_id) DO NOTHING;
  END LOOP;

  -- Insert permissions for student role
  FOR perm_id IN SELECT id FROM public.permissions 
    WHERE 
      (resource = 'application' AND action IN ('create', 'read_own', 'update_own', 'delete_own')) OR
      (resource = 'student_profile' AND action IN ('create', 'read_own', 'update_own')) OR
      (resource = 'document' AND action IN ('upload_own', 'read_own', 'delete_own')) OR
      (resource = 'user' AND action = 'update_own') OR
      (resource = 'security_logs' AND action = 'read_own')
  LOOP
    INSERT INTO public.role_permissions (role, permission_id)
    VALUES ('student', perm_id)
    ON CONFLICT (role, permission_id) DO NOTHING;
  END LOOP;
END
$$;