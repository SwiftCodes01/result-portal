import { User, Student, Teacher, SchoolClass, Subject, Term, Grade } from '../types';
import * as store from './store';
import { getGradeLetter, getGradeRemark } from '../types';

export function seedData(): void {
  if (store.isInitialized()) return;

  // Classes
  const classes: SchoolClass[] = [
    { id: 'cls-1', name: 'Primary 1A', level: 'Primary', grade: 1, section: 'A' },
    { id: 'cls-2', name: 'Primary 2A', level: 'Primary', grade: 2, section: 'A' },
    { id: 'cls-3', name: 'Primary 3A', level: 'Primary', grade: 3, section: 'A' },
    { id: 'cls-4', name: 'Primary 4A', level: 'Primary', grade: 4, section: 'A' },
    { id: 'cls-5', name: 'Primary 5A', level: 'Primary', grade: 5, section: 'A' },
    { id: 'cls-6', name: 'Primary 6A', level: 'Primary', grade: 6, section: 'A' },
    { id: 'cls-7', name: 'JSS 1A', level: 'Secondary', grade: 7, section: 'A' },
    { id: 'cls-8', name: 'JSS 2A', level: 'Secondary', grade: 8, section: 'A' },
    { id: 'cls-9', name: 'JSS 3A', level: 'Secondary', grade: 9, section: 'A' },
    { id: 'cls-10', name: 'SSS 1A', level: 'Secondary', grade: 10, section: 'A' },
    { id: 'cls-11', name: 'SSS 2A', level: 'Secondary', grade: 11, section: 'A' },
    { id: 'cls-12', name: 'SSS 3A', level: 'Secondary', grade: 12, section: 'A' },
  ];
  store.setClasses(classes);

  // Subjects
  const subjects: Subject[] = [
    { id: 'sub-1', name: 'Mathematics', code: 'MATH', level: 'Both' },
    { id: 'sub-2', name: 'English Language', code: 'ENG', level: 'Both' },
    { id: 'sub-3', name: 'Basic Science', code: 'BSC', level: 'Primary' },
    { id: 'sub-4', name: 'Social Studies', code: 'SST', level: 'Both' },
    { id: 'sub-5', name: 'Civic Education', code: 'CIV', level: 'Both' },
    { id: 'sub-6', name: 'Creative Arts', code: 'ART', level: 'Primary' },
    { id: 'sub-7', name: 'Physical Education', code: 'PHE', level: 'Both' },
    { id: 'sub-8', name: 'Computer Studies', code: 'CMP', level: 'Both' },
    { id: 'sub-9', name: 'Physics', code: 'PHY', level: 'Secondary' },
    { id: 'sub-10', name: 'Chemistry', code: 'CHM', level: 'Secondary' },
    { id: 'sub-11', name: 'Biology', code: 'BIO', level: 'Secondary' },
    { id: 'sub-12', name: 'Literature in English', code: 'LIT', level: 'Secondary' },
    { id: 'sub-13', name: 'Geography', code: 'GEO', level: 'Secondary' },
    { id: 'sub-14', name: 'Economics', code: 'ECO', level: 'Secondary' },
  ];
  store.setSubjects(subjects);

  // Terms
  const terms: Term[] = [
    { id: 'term-1', name: 'First Term', year: 2024, startDate: '2024-09-01', endDate: '2024-12-15', isActive: false },
    { id: 'term-2', name: 'Second Term', year: 2025, startDate: '2025-01-06', endDate: '2025-04-11', isActive: false },
    { id: 'term-3', name: 'Third Term', year: 2025, startDate: '2025-04-28', endDate: '2025-07-25', isActive: true },
  ];
  store.setTerms(terms);

  // Admin user
  const adminUser: User = {
    id: 'user-admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Mr. James Okonkwo',
    email: 'admin@brightpath.edu',
  };

  // Teacher users
  const teacherUsers: User[] = [
    { id: 'user-t1', username: 'teacher1', password: 'teacher123', role: 'teacher', name: 'Mrs. Amina Bello', email: 'amina@brightpath.edu' },
    { id: 'user-t2', username: 'teacher2', password: 'teacher123', role: 'teacher', name: 'Mr. David Adeyemi', email: 'david@brightpath.edu' },
    { id: 'user-t3', username: 'teacher3', password: 'teacher123', role: 'teacher', name: 'Ms. Grace Nnamdi', email: 'grace@brightpath.edu' },
  ];

  const teachers: Teacher[] = [
    { id: 'tch-1', userId: 'user-t1', name: 'Mrs. Amina Bello', subjects: ['sub-1', 'sub-2'], classes: ['cls-7', 'cls-8', 'cls-9'], department: 'Mathematics' },
    { id: 'tch-2', userId: 'user-t2', name: 'Mr. David Adeyemi', subjects: ['sub-9', 'sub-10', 'sub-3'], classes: ['cls-10', 'cls-11', 'cls-12'], department: 'Sciences' },
    { id: 'tch-3', userId: 'user-t3', name: 'Ms. Grace Nnamdi', subjects: ['sub-4', 'sub-5', 'sub-12'], classes: ['cls-1', 'cls-2', 'cls-3'], department: 'Humanities' },
  ];

  // Student users
  const studentUsers: User[] = [
    { id: 'user-s1', username: 'student1', password: 'student123', role: 'student', name: 'Chinedu Okafor', email: 'chinedu@brightpath.edu' },
    { id: 'user-s2', username: 'student2', password: 'student123', role: 'student', name: 'Fatima Yusuf', email: 'fatima@brightpath.edu' },
    { id: 'user-s3', username: 'student3', password: 'student123', role: 'student', name: 'Tunde Bakare', email: 'tunde@brightpath.edu' },
    { id: 'user-s4', username: 'student4', password: 'student123', role: 'student', name: 'Amara Eze', email: 'amara@brightpath.edu' },
    { id: 'user-s5', username: 'student5', password: 'student123', role: 'student', name: 'Ibrahim Musa', email: 'ibrahim@brightpath.edu' },
    { id: 'user-s6', username: 'student6', password: 'student123', role: 'student', name: 'Blessing Okafor', email: 'blessing@brightpath.edu' },
  ];

  const students: Student[] = [
    { id: 'std-1', userId: 'user-s1', admissionNumber: 'BPS/2020/001', name: 'Chinedu Okafor', classId: 'cls-7', parentName: 'Mr. Peter Okafor', parentEmail: 'peter.okafor@email.com', dateOfBirth: '2012-03-15', gender: 'Male' },
    { id: 'std-2', userId: 'user-s2', admissionNumber: 'BPS/2020/002', name: 'Fatima Yusuf', classId: 'cls-7', parentName: 'Mrs. Halima Yusuf', parentEmail: 'halima.yusuf@email.com', dateOfBirth: '2012-07-22', gender: 'Female' },
    { id: 'std-3', userId: 'user-s3', admissionNumber: 'BPS/2019/003', name: 'Tunde Bakare', classId: 'cls-8', parentName: 'Mr. Samuel Bakare', parentEmail: 'samuel.bakare@email.com', dateOfBirth: '2011-01-10', gender: 'Male' },
    { id: 'std-4', userId: 'user-s4', admissionNumber: 'BPS/2019/004', name: 'Amara Eze', classId: 'cls-10', parentName: 'Dr. Chukwu Eze', parentEmail: 'chukwu.eze@email.com', dateOfBirth: '2010-11-05', gender: 'Female' },
    { id: 'std-5', userId: 'user-s5', admissionNumber: 'BPS/2018/005', name: 'Ibrahim Musa', classId: 'cls-10', parentName: 'Alhaji Musa Ibrahim', parentEmail: 'musa.ibrahim@email.com', dateOfBirth: '2010-06-18', gender: 'Male' },
    { id: 'std-6', userId: 'user-s6', admissionNumber: 'BPS/2021/006', name: 'Blessing Okafor', classId: 'cls-4', parentName: 'Mrs. Ngozi Okafor', parentEmail: 'ngozi.okafor@email.com', dateOfBirth: '2014-09-30', gender: 'Female' },
  ];

  store.setUsers([adminUser, ...teacherUsers, ...studentUsers]);
  store.setTeachers(teachers);
  store.setStudents(students);

  // Generate sample grades
  const grades: Grade[] = [];
  const primarySubjects = ['sub-1', 'sub-2', 'sub-3', 'sub-4', 'sub-5', 'sub-6', 'sub-7', 'sub-8'];
  const secondarySubjects = ['sub-1', 'sub-2', 'sub-4', 'sub-5', 'sub-7', 'sub-8', 'sub-9', 'sub-10', 'sub-11', 'sub-12'];

  function randomScore(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Student 1 - Chinedu (JSS 1) - Term 1 & 2
  for (const termId of ['term-1', 'term-2']) {
    for (const subId of secondarySubjects) {
      const score = randomScore(45, 95);
      const gl = getGradeLetter(score);
      grades.push({
        id: `g-${grades.length + 1}`,
        studentId: 'std-1',
        subjectId: subId,
        termId,
        teacherId: 'tch-1',
        score,
        gradeLetter: gl,
        remark: getGradeRemark(gl),
        dateUploaded: termId === 'term-1' ? '2024-12-10' : '2025-04-05',
      });
    }
  }

  // Student 2 - Fatima (JSS 1) - Term 1 & 2
  for (const termId of ['term-1', 'term-2']) {
    for (const subId of secondarySubjects) {
      const score = randomScore(50, 98);
      const gl = getGradeLetter(score);
      grades.push({
        id: `g-${grades.length + 1}`,
        studentId: 'std-2',
        subjectId: subId,
        termId,
        teacherId: 'tch-1',
        score,
        gradeLetter: gl,
        remark: getGradeRemark(gl),
        dateUploaded: termId === 'term-1' ? '2024-12-10' : '2025-04-05',
      });
    }
  }

  // Student 3 - Tunde (JSS 2) - Term 1 & 2
  for (const termId of ['term-1', 'term-2']) {
    for (const subId of secondarySubjects) {
      const score = randomScore(40, 88);
      const gl = getGradeLetter(score);
      grades.push({
        id: `g-${grades.length + 1}`,
        studentId: 'std-3',
        subjectId: subId,
        termId,
        teacherId: 'tch-1',
        score,
        gradeLetter: gl,
        remark: getGradeRemark(gl),
        dateUploaded: termId === 'term-1' ? '2024-12-10' : '2025-04-05',
      });
    }
  }

  // Student 4 - Amara (SSS 1) - Term 1 & 2
  for (const termId of ['term-1', 'term-2']) {
    for (const subId of secondarySubjects) {
      const score = randomScore(55, 99);
      const gl = getGradeLetter(score);
      grades.push({
        id: `g-${grades.length + 1}`,
        studentId: 'std-4',
        subjectId: subId,
        termId,
        teacherId: 'tch-2',
        score,
        gradeLetter: gl,
        remark: getGradeRemark(gl),
        dateUploaded: termId === 'term-1' ? '2024-12-10' : '2025-04-05',
      });
    }
  }

  // Student 5 - Ibrahim (SSS 1) - Term 1 & 2
  for (const termId of ['term-1', 'term-2']) {
    for (const subId of secondarySubjects) {
      const score = randomScore(35, 85);
      const gl = getGradeLetter(score);
      grades.push({
        id: `g-${grades.length + 1}`,
        studentId: 'std-5',
        subjectId: subId,
        termId,
        teacherId: 'tch-2',
        score,
        gradeLetter: gl,
        remark: getGradeRemark(gl),
        dateUploaded: termId === 'term-1' ? '2024-12-10' : '2025-04-05',
      });
    }
  }

  // Student 6 - Blessing (Primary 4) - Term 1 & 2
  for (const termId of ['term-1', 'term-2']) {
    for (const subId of primarySubjects) {
      const score = randomScore(50, 96);
      const gl = getGradeLetter(score);
      grades.push({
        id: `g-${grades.length + 1}`,
        studentId: 'std-6',
        subjectId: subId,
        termId,
        teacherId: 'tch-3',
        score,
        gradeLetter: gl,
        remark: getGradeRemark(gl),
        dateUploaded: termId === 'term-1' ? '2024-12-10' : '2025-04-05',
      });
    }
  }

  store.setGrades(grades);
  store.markInitialized();
}
