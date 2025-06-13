/*
  # University Matching System Database Schema

  1. New Tables
    - `universities`
      - `id` (uuid, primary key)
      - `name` (text)
      - `country` (text)
      - `logo` (text, optional)
      - `description` (text, optional)
      - `programs` (text array)
      - `tuition_range` (text, optional)
      - `acceptance_rate` (text, optional)
      - `application_deadline` (date, optional)
      - `scholarships_available` (boolean)
      - `requirements` (jsonb)
      - `created_at` (timestamp)

    - `applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `university_id` (uuid, foreign key)
      - `status` (text)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Universities are publicly viewable
    - Applications are private to users
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

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Universities are viewable by everyone"
  ON universities
  FOR SELECT
  TO public
  USING (true);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now()),
  CONSTRAINT applications_status_check CHECK (status IN ('pending', 'in-review', 'submitted', 'accepted', 'rejected'))
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applications are viewable by owner"
  ON applications
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Applications can be inserted by owner"
  ON applications
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Applications can be updated by owner"
  ON applications
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

-- Add foreign key constraint to link applications to profiles
ALTER TABLE applications 
ADD CONSTRAINT applications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;