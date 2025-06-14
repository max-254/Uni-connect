/*
  # Security and Access Control Schema

  1. New Tables
    - `audit_logs` - Tracks all system activity
    - `user_sessions` - Manages active user sessions
    - `permissions` - Defines available permissions
    - `role_permissions` - Maps permissions to roles
    - `security_logs` - Tracks security-related events
  
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Add audit logging triggers
*/

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add user_name and user_role columns for easier querying
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_name text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_role text;

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit_logs
CREATE POLICY "Super admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Admins can view audit logs except for super admin actions"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ) AND
    NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = audit_logs.user_id AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Institution admins can view audit logs for their institution"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      WHERE p1.id = auth.uid() AND p1.role = 'institution_admin'
    ) AND
    EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.id = audit_logs.user_id AND p2.institution_id = (
        SELECT institution_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- User Sessions Table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
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

CREATE POLICY "Only super admins can modify permissions"
  ON public.permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
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

CREATE POLICY "Only super admins can modify role permissions"
  ON public.role_permissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- Security Logs Table
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    )
  );

-- Add two_factor_enabled column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_secret text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS session_timeout_minutes integer DEFAULT 30;

-- Create function to update audit_logs user information
CREATE OR REPLACE FUNCTION update_audit_log_user_info()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_name := (SELECT full_name FROM public.profiles WHERE id = NEW.user_id);
  NEW.user_role := (SELECT role FROM public.profiles WHERE id = NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update audit_logs user information
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
  -- Get current user ID
  user_id := auth.uid();
  
  -- Skip if no authenticated user (system change)
  IF user_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Determine operation type and prepare data
  CASE TG_OP
    WHEN 'INSERT' THEN
      old_data := NULL;
      new_data := to_jsonb(NEW);
      changed_fields := new_data;
    WHEN 'UPDATE' THEN
      old_data := to_jsonb(OLD);
      new_data := to_jsonb(NEW);
      changed_fields := jsonb_object_agg(
        key,
        new_data->key
      ) FROM jsonb_each(new_data)
      WHERE new_data->key IS DISTINCT FROM old_data->key;
    WHEN 'DELETE' THEN
      old_data := to_jsonb(OLD);
      new_data := NULL;
      changed_fields := old_data;
  END CASE;
  
  -- Insert audit log
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
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit logging trigger to key tables
CREATE TRIGGER applications_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.applications
FOR EACH ROW EXECUTE FUNCTION log_table_changes();

CREATE TRIGGER profiles_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION log_table_changes();

CREATE TRIGGER universities_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.universities
FOR EACH ROW EXECUTE FUNCTION log_table_changes();

CREATE TRIGGER student_profiles_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.student_profiles
FOR EACH ROW EXECUTE FUNCTION log_table_changes();

CREATE TRIGGER parsed_documents_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.parsed_documents
FOR EACH ROW EXECUTE FUNCTION log_table_changes();

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
-- Super Admin
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'super_admin', id FROM public.permissions
ON CONFLICT (role, permission_id) DO NOTHING;

-- Admin
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions
WHERE resource != 'system_settings' OR action != 'modify'
ON CONFLICT (role, permission_id) DO NOTHING;

-- Institution Admin
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'institution_admin', id FROM public.permissions
WHERE 
  (resource = 'application' AND action IN ('read', 'update')) OR
  (resource = 'student_profile' AND action IN ('read', 'update')) OR
  (resource = 'document' AND action IN ('read')) OR
  (resource = 'user' AND action IN ('read')) OR
  (resource = 'university' AND action = 'read')
ON CONFLICT (role, permission_id) DO NOTHING;

-- Student
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'student', id FROM public.permissions
WHERE 
  (resource = 'application' AND action IN ('create', 'read_own', 'update_own', 'delete_own')) OR
  (resource = 'student_profile' AND action IN ('create', 'read_own', 'update_own')) OR
  (resource = 'document' AND action IN ('upload_own', 'read_own', 'delete_own')) OR
  (resource = 'user' AND action = 'update_own') OR
  (resource = 'security_logs' AND action = 'read_own')
ON CONFLICT (role, permission_id) DO NOTHING;