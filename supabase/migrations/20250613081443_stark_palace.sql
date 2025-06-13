/*
  # Create favorites and applications tables with proper constraints

  1. New Tables
    - `favorites` - User bookmarked universities/programs
    - `applications` - User application tracking
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
  
  3. Performance
    - Add indexes for efficient queries
    - Add trigger for automatic timestamp updates
  
  4. Data Integrity
    - Add constraints for status validation
    - Add constraints for progress percentage validation
*/

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id text NOT NULL,
  university_name text NOT NULL,
  university_country text NOT NULL,
  program_name text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Handle applications table creation and column additions
DO $$
BEGIN
  -- Create applications table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applications' AND table_schema = 'public') THEN
    CREATE TABLE applications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      university_id text NOT NULL,
      university_name text NOT NULL,
      program_name text NOT NULL,
      status text NOT NULL DEFAULT 'draft',
      progress_percentage integer DEFAULT 0,
      application_data jsonb DEFAULT '{}',
      submitted_at timestamptz,
      deadline date NOT NULL,
      notes text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  ELSE
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'applications' AND column_name = 'university_name'
    ) THEN
      ALTER TABLE applications ADD COLUMN university_name text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'applications' AND column_name = 'program_name'
    ) THEN
      ALTER TABLE applications ADD COLUMN program_name text;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'applications' AND column_name = 'progress_percentage'
    ) THEN
      ALTER TABLE applications ADD COLUMN progress_percentage integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'applications' AND column_name = 'application_data'
    ) THEN
      ALTER TABLE applications ADD COLUMN application_data jsonb DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'applications' AND column_name = 'submitted_at'
    ) THEN
      ALTER TABLE applications ADD COLUMN submitted_at timestamptz;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'applications' AND column_name = 'deadline'
    ) THEN
      ALTER TABLE applications ADD COLUMN deadline date;
    END IF;

    -- Update existing columns to NOT NULL where appropriate
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'applications' AND column_name = 'university_name'
      AND is_nullable = 'YES'
    ) THEN
      -- Set default value for existing NULL records
      UPDATE applications SET university_name = 'Unknown University' WHERE university_name IS NULL;
      ALTER TABLE applications ALTER COLUMN university_name SET NOT NULL;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'applications' AND column_name = 'program_name'
      AND is_nullable = 'YES'
    ) THEN
      -- Set default value for existing NULL records
      UPDATE applications SET program_name = 'Unknown Program' WHERE program_name IS NULL;
      ALTER TABLE applications ALTER COLUMN program_name SET NOT NULL;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'applications' AND column_name = 'deadline'
      AND is_nullable = 'YES'
    ) THEN
      -- Set default deadline for existing NULL records
      UPDATE applications SET deadline = CURRENT_DATE + INTERVAL '6 months' WHERE deadline IS NULL;
      ALTER TABLE applications ALTER COLUMN deadline SET NOT NULL;
    END IF;
  END IF;
END $$;

-- Add constraints only if they don't exist and columns exist
DO $$
BEGIN
  -- Check and add status constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'applications_status_check' 
    AND table_name = 'applications'
  ) THEN
    ALTER TABLE applications 
    ADD CONSTRAINT applications_status_check 
    CHECK (status IN ('draft', 'in-progress', 'submitted', 'under-review', 'accepted', 'rejected', 'waitlisted'));
  END IF;

  -- Check and add progress constraint (only if column exists)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'applications' AND column_name = 'progress_percentage'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'applications_progress_check' 
    AND table_name = 'applications'
  ) THEN
    ALTER TABLE applications 
    ADD CONSTRAINT applications_progress_check 
    CHECK (progress_percentage >= 0 AND progress_percentage <= 100);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can update their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON applications;
DROP POLICY IF EXISTS "Users can delete their own applications" ON applications;

-- Favorites policies
CREATE POLICY "Users can view their own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
  ON favorites
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Applications policies
CREATE POLICY "Users can view their own applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications"
  ON applications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_university_id ON favorites(university_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_deadline ON applications(deadline);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_updated_at ON applications(updated_at DESC);

-- Create or replace trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();