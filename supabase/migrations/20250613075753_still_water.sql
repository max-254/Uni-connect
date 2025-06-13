/*
  # Fix University Matching System Migration

  1. New Tables
    - `universities` - Store university information with programs and requirements
    - `applications` - Track student applications to universities
  
  2. Security
    - Enable RLS on both tables
    - Add policies for public university viewing and user-owned applications
  
  3. Constraints
    - Add proper foreign key relationships
    - Add status validation for applications
*/

-- Universities table
CREATE TABLE IF NOT EXISTS universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  logo text,
  description text,
  programs text[],
  tuition_range text,
  acceptance_rate text,
  application_deadline date,
  scholarships_available boolean DEFAULT false,
  requirements jsonb,
  created_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on universities if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'universities' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create universities policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'universities' 
    AND policyname = 'Universities are viewable by everyone'
  ) THEN
    CREATE POLICY "Universities are viewable by everyone"
      ON universities
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  university_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  -- Add university_id foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'applications_university_id_fkey'
    AND table_name = 'applications'
  ) THEN
    ALTER TABLE applications 
    ADD CONSTRAINT applications_university_id_fkey 
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE;
  END IF;

  -- Add user_id foreign key to profiles if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'applications_user_id_fkey'
    AND table_name = 'applications'
  ) THEN
    ALTER TABLE applications 
    ADD CONSTRAINT applications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add status check constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'applications_status_check'
  ) THEN
    ALTER TABLE applications 
    ADD CONSTRAINT applications_status_check 
    CHECK (status IN ('pending', 'in-review', 'submitted', 'accepted', 'rejected'));
  END IF;
END $$;

-- Enable RLS on applications if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'applications' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create applications policies if they don't exist
DO $$
BEGIN
  -- SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'applications' 
    AND policyname = 'Applications are viewable by owner'
  ) THEN
    CREATE POLICY "Applications are viewable by owner"
      ON applications
      FOR SELECT
      TO public
      USING (auth.uid() = user_id);
  END IF;

  -- INSERT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'applications' 
    AND policyname = 'Applications can be inserted by owner'
  ) THEN
    CREATE POLICY "Applications can be inserted by owner"
      ON applications
      FOR INSERT
      TO public
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- UPDATE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'applications' 
    AND policyname = 'Applications can be updated by owner'
  ) THEN
    CREATE POLICY "Applications can be updated by owner"
      ON applications
      FOR UPDATE
      TO public
      USING (auth.uid() = user_id);
  END IF;
END $$;