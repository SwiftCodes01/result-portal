export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email: string;
  avatar?: string;
}

export interface Student {
  id: string;
  userId: string;
  admissionNumber: string;
  name: string;
  classId: string;
  parentName: string;
  parentEmail: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
}

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  subjects: string[];
  classes: string[];
  department: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  level: 'Primary' | 'Secondary';
  grade: number;
  section: string;
  classTeacherId?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  level: 'Primary' | 'Secondary' | 'Both';
}

export interface Term {
  id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  termId: string;
  teacherId: string;
  score: number;
  gradeLetter: string;
  remark: string;
  dateUploaded: string;
}

export interface ReportCard {
  studentId: string;
  studentName: string;
  className: string;
  termId: string;
  termName: string;
  grades: Grade[];
  totalScore: number;
  averageScore: number;
  position?: number;
  classTeacherRemark: string;
}

export function getGradeLetter(score: number): string {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  if (score >= 40) return 'E';
  return 'F';
}

export function getGradeRemark(grade: string): string {
  const remarks: Record<string, string> = {
    A: 'Excellent',
    B: 'Very Good',
    C: 'Good',
    D: 'Pass',
    E: 'Below Average',
    F: 'Fail',
  };
  return remarks[grade] || '';
}

export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    A: 'text-emerald-600 bg-emerald-50',
    B: 'text-blue-600 bg-blue-50',
    C: 'text-yellow-600 bg-yellow-50',
    D: 'text-orange-600 bg-orange-50',
    E: 'text-red-500 bg-red-50',
    F: 'text-red-700 bg-red-100',
  };
  return colors[grade] || 'text-gray-600 bg-gray-50';
}
