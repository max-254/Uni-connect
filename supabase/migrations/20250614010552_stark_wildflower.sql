/*
# Security and Access Control System

1. New Tables
   - `audit_logs`: Tracks all data modifications with user info
   - `user_sessions`: Manages user session data
   - `permissions`: Defines available system permissions
   - `role_permissions`: Maps permissions to roles
   - `security_logs`: Records security-related events

2. Security
   - Enable RLS on all tables
   - Add policies for proper access control
   - Add two-factor authentication support to profiles

3. Changes
   - Add audit logging functionality
   - Create permission management system
*/

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
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

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
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own sessions"
  ON public.user_sessions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions"
  ON public.user_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

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
CREATE POLICY "Anyone can view permissions"
  ON public.permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify permissions"
  ON public.permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

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
CREATE POLICY "Anyone can view role permissions"
  ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify role permissions"
  ON public.role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

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
CREATE POLICY "Users can view their own security logs"
  ON public.security_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all security logs"
  ON public.security_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

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

-- Create function to update audit_logs user information
CREATE OR REPLACE FUNCTION update_audit_log_user_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Only try to get user info if profiles table exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles') THEN
    BEGIN
      SELECT full_name, role INTO NEW.user_name, NEW.user_role 
      FROM public.profiles 
      WHERE id = NEW.user_id;
    EXCEPTION WHEN OTHERS THEN
      -- If any error occurs, just continue without setting these fields
      NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update audit_logs user information
DROP TRIGGER IF EXISTS update_audit_log_user_info_trigger ON public.audit_logs;
CREATE TRIGGER update_audit_log_user_info_trigger
BEFORE INSERT ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION update_audit_log_user_info();

-- Create function for automatic audit logging
CREATE OR REPLACE FUNCTION log_table_changes()
RETURNS TRIGGER AS $$
DECLARE
  old_data jsonb;
  new_data jsonb;
  changed_fields jsonb;
  user_id uuid;
BEGIN
  -- Get current user ID from session context if available
  BEGIN
    user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    user_id := '00000000-0000-0000-0000-000000000000'::uuid;
  END;
  
  -- Determine operation type and prepare data
  CASE TG_OP
    WHEN 'INSERT' THEN
      old_data := NULL;
      new_data := to_jsonb(NEW);
      changed_fields := new_data;
    WHEN 'UPDATE' THEN
      old_data := to_jsonb(OLD);
      new_data := to_jsonb(NEW);
      changed_fields := jsonb_build_object();
      
      FOR key IN SELECT jsonb_object_keys(new_data) LOOP
        IF new_data->key IS DISTINCT FROM old_data->key THEN
          changed_fields := changed_fields || jsonb_build_object(key, new_data->key);
        END IF;
      END LOOP;
    WHEN 'DELETE' THEN
      old_data := to_jsonb(OLD);
      new_data := NULL;
      changed_fields := old_data;
  END CASE;
  
  -- Insert audit log
  BEGIN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource,
      details,
      ip_address
    ) VALUES (
      user_id,
      lower(TG_OP),
      TG_TABLE_NAME,
      jsonb_build_object(
        'old_data', old_data,
        'new_data', new_data,
        'changed_fields', changed_fields,
        'record_id', CASE
          WHEN TG_OP = 'DELETE' THEN old_data->>'id'
          ELSE new_data->>'id'
        END
      ),
      '127.0.0.1' -- In a real app, this would be captured from the request
    );
  EXCEPTION WHEN OTHERS THEN
    -- If audit logging fails, we still want the original operation to succeed
    NULL;
  END;
  
  -- For INSERT and UPDATE operations, return NEW; for DELETE, return OLD
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit logging trigger to key tables (conditionally)
DO $$
BEGIN
  -- Check if applications table exists before creating trigger
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'applications') THEN
    DROP TRIGGER IF EXISTS applications_audit_trigger ON public.applications;
    CREATE TRIGGER applications_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION log_table_changes();
  END IF;

  -- Check if profiles table exists before creating trigger
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles') THEN
    DROP TRIGGER IF EXISTS profiles_audit_trigger ON public.profiles;
    CREATE TRIGGER profiles_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION log_table_changes();
  END IF;

  -- Check if universities table exists before creating trigger
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'universities') THEN
    DROP TRIGGER IF EXISTS universities_audit_trigger ON public.universities;
    CREATE TRIGGER universities_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.universities
    FOR EACH ROW EXECUTE FUNCTION log_table_changes();
  END IF;

  -- Check if student_profiles table exists before creating trigger
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'student_profiles') THEN
    DROP TRIGGER IF EXISTS student_profiles_audit_trigger ON public.student_profiles;
    CREATE TRIGGER student_profiles_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.student_profiles
    FOR EACH ROW EXECUTE FUNCTION log_table_changes();
  END IF;

  -- Check if parsed_documents table exists before creating trigger
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'parsed_documents') THEN
    DROP TRIGGER IF EXISTS parsed_documents_audit_trigger ON public.parsed_documents;
    CREATE TRIGGER parsed_documents_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.parsed_documents
    FOR EACH ROW EXECUTE FUNCTION log_table_changes();
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
BEGIN
  -- Insert permissions for admin role
  INSERT INTO public.role_permissions (role, permission_id)
  SELECT 'admin', id FROM public.permissions
  WHERE resource != 'system_settings' OR action != 'modify'
  ON CONFLICT (role, permission_id) DO NOTHING;

  -- Insert permissions for student role
  INSERT INTO public.role_permissions (role, permission_id)
  SELECT 'student', id FROM public.permissions
  WHERE 
    (resource = 'application' AND action IN ('create', 'read_own', 'update_own', 'delete_own')) OR
    (resource = 'student_profile' AND action IN ('create', 'read_own', 'update_own')) OR
    (resource = 'document' AND action IN ('upload_own', 'read_own', 'delete_own')) OR
    (resource = 'user' AND action = 'update_own') OR
    (resource = 'security_logs' AND action = 'read_own')
  ON CONFLICT (role, permission_id) DO NOTHING;
END
$$;