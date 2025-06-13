/*
  # Document Parsing and Student Profile Tables

  1. New Tables
    - `parsed_documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `document_id` (text, reference to uploaded document)
      - `document_type` (text, type of document)
      - `parsed_data` (jsonb, extracted information)
      - `confidence_score` (integer, AI confidence score)
      - `processing_status` (text, processing status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `student_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `academic_background` (jsonb, education and academic info)
      - `skills` (jsonb, technical and soft skills)
      - `preferences` (jsonb, study preferences and goals)
      - `experience` (jsonb, work experience)
      - `contact_info` (jsonb, contact information)
      - `profile_completion` (integer, completion percentage)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own data
    - Add policies for authenticated users to read/write their profiles

  3. Indexes
    - Add indexes for efficient querying by user_id
    - Add indexes for document_type and processing_status
*/

-- Create parsed_documents table
CREATE TABLE IF NOT EXISTS parsed_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('cv', 'transcript', 'statement', 'recommendation', 'certificate', 'other')),
  parsed_data jsonb NOT NULL DEFAULT '{}',
  confidence_score integer NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  processing_status text NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  academic_background jsonb NOT NULL DEFAULT '{
    "highest_education": "",
    "gpa": 0,
    "institutions": [],
    "test_scores": []
  }',
  skills jsonb NOT NULL DEFAULT '{
    "technical": [],
    "languages": [],
    "soft_skills": []
  }',
  preferences jsonb NOT NULL DEFAULT '{
    "study_fields": [],
    "preferred_countries": [],
    "career_goals": [],
    "scholarship_required": false
  }',
  experience jsonb NOT NULL DEFAULT '[]',
  contact_info jsonb NOT NULL DEFAULT '{}',
  profile_completion integer NOT NULL DEFAULT 0 CHECK (profile_completion >= 0 AND profile_completion <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE parsed_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for parsed_documents
CREATE POLICY "Users can view their own parsed documents"
  ON parsed_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own parsed documents"
  ON parsed_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parsed documents"
  ON parsed_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own parsed documents"
  ON parsed_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for student_profiles
CREATE POLICY "Users can view their own profile"
  ON student_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON student_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON student_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parsed_documents_user_id ON parsed_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_parsed_documents_document_type ON parsed_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_parsed_documents_processing_status ON parsed_documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_parsed_documents_created_at ON parsed_documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_completion ON student_profiles(profile_completion DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_parsed_documents_updated_at
  BEFORE UPDATE ON parsed_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();