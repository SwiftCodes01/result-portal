-- BrightPath Academy School Portal Database Schema
-- Run this in your Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Primary', 'Secondary')),
  grade INTEGER NOT NULL,
  section TEXT NOT NULL DEFAULT 'A',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL CHECK (level IN ('Primary', 'Secondary', 'Both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Terms table
CREATE TABLE terms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admission_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  parent_name TEXT,
  parent_email TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teachers table
CREATE TABLE teachers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teacher-Subject relationship
CREATE TABLE teacher_subjects (
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, subject_id)
);

-- Teacher-Class relationship
CREATE TABLE teacher_classes (
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, class_id)
);

-- Grades table
CREATE TABLE grades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  term_id UUID REFERENCES terms(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  grade_letter TEXT NOT NULL,
  remark TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  date_uploaded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, subject_id, term_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_term_id ON grades(term_id);
CREATE INDEX idx_grades_subject_id ON grades(subject_id);
CREATE INDEX idx_grades_teacher_id ON grades(teacher_id);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Classes policies (readable by all authenticated users)
CREATE POLICY "Classes are viewable by authenticated users" ON classes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify classes" ON classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Subjects policies
CREATE POLICY "Subjects are viewable by authenticated users" ON subjects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify subjects" ON subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Terms policies
CREATE POLICY "Terms are viewable by authenticated users" ON terms
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify terms" ON terms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Students policies
CREATE POLICY "Students are viewable by authenticated users" ON students
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Students can view own record" ON students
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Only admins can modify students" ON students
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Teachers policies
CREATE POLICY "Teachers are viewable by authenticated users" ON teachers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Teachers can view own record" ON teachers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Only admins can modify teachers" ON teachers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Teacher relationships policies
CREATE POLICY "Teacher relationships are viewable by authenticated users" ON teacher_subjects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify teacher relationships" ON teacher_subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Teacher class relationships are viewable by authenticated users" ON teacher_classes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify teacher class relationships" ON teacher_classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Grades policies
CREATE POLICY "Grades are viewable by authenticated users" ON grades
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Students can view own approved grades" ON grades
  FOR SELECT USING (
    is_approved = TRUE AND
    EXISTS (SELECT 1 FROM students WHERE id = student_id AND user_id = auth.uid())
  );

CREATE POLICY "Teachers can insert/update grades" ON grades
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid())
  );

CREATE POLICY "Teachers can update own grades" ON grades
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid() AND id = teacher_id)
  );

CREATE POLICY "Admins can manage all grades" ON grades
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - run this after creating admin user)
-- You'll need to create users first through the app, then run these inserts

-- Sample Classes
INSERT INTO classes (name, level, grade, section) VALUES
  ('Primary 1A', 'Primary', 1, 'A'),
  ('Primary 2A', 'Primary', 2, 'A'),
  ('Primary 3A', 'Primary', 3, 'A'),
  ('Primary 4A', 'Primary', 4, 'A'),
  ('Primary 5A', 'Primary', 5, 'A'),
  ('Primary 6A', 'Primary', 6, 'A'),
  ('JSS 1A', 'Secondary', 7, 'A'),
  ('JSS 2A', 'Secondary', 8, 'A'),
  ('JSS 3A', 'Secondary', 9, 'A'),
  ('SSS 1A', 'Secondary', 10, 'A'),
  ('SSS 2A', 'Secondary', 11, 'A'),
  ('SSS 3A', 'Secondary', 12, 'A');

-- Sample Subjects
INSERT INTO subjects (name, code, level) VALUES
  ('Mathematics', 'MATH', 'Both'),
  ('English Language', 'ENG', 'Both'),
  ('Basic Science', 'BSC', 'Primary'),
  ('Social Studies', 'SST', 'Both'),
  ('Civic Education', 'CIV', 'Both'),
  ('Creative Arts', 'ART', 'Primary'),
  ('Physical Education', 'PHE', 'Both'),
  ('Computer Studies', 'CMP', 'Both'),
  ('Physics', 'PHY', 'Secondary'),
  ('Chemistry', 'CHM', 'Secondary'),
  ('Biology', 'BIO', 'Secondary'),
  ('Literature in English', 'LIT', 'Secondary'),
  ('Geography', 'GEO', 'Secondary'),
  ('Economics', 'ECO', 'Secondary');

-- Sample Terms
INSERT INTO terms (name, year, start_date, end_date, is_active) VALUES
  ('First Term', 2024, '2024-09-01', '2024-12-15', false),
  ('Second Term', 2025, '2025-01-06', '2025-04-11', false),
  ('Third Term', 2025, '2025-04-28', '2025-07-25', true);
