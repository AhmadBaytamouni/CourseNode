-- Carleton CS Prerequisite Visualizer Database Schema
-- Run this in your Supabase SQL Editor

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "COMP 1001"
  title TEXT NOT NULL,
  credits INTEGER NOT NULL,
  description TEXT,
  level INTEGER NOT NULL,            -- 1000, 2000, 3000, 4000
  department VARCHAR(10) NOT NULL,   -- "COMP" for now
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Prerequisites table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  prerequisite_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  is_corequisite BOOLEAN DEFAULT FALSE,
  is_exclusion BOOLEAN DEFAULT FALSE,
  logic_type VARCHAR(10),  -- 'AND', 'OR', 'ONE_OF', 'ALL_OF'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_prerequisites_course ON prerequisites(course_id);
CREATE INDEX IF NOT EXISTS idx_prerequisites_prereq ON prerequisites(prerequisite_id);

-- Enable Row Level Security (optional, for future user features)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prerequisites ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access on courses" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on prerequisites" ON prerequisites
  FOR SELECT USING (true);

