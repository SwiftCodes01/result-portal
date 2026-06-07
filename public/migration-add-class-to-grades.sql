-- Migration: Add class_id to grades table
-- This migration adds a class_id field to track which class the student was in when grades were recorded
-- Run this in your Supabase SQL Editor if you already have an existing database

-- Add class_id column to grades table
ALTER TABLE grades ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_grades_class_id ON grades(class_id);

-- Backfill existing grades with student's current class
-- Note: This sets all existing grades to the student's CURRENT class
-- For historical accuracy, you may need to manually adjust grades from previous terms
UPDATE grades 
SET class_id = students.class_id 
FROM students 
WHERE grades.student_id = students.id 
AND grades.class_id IS NULL;
