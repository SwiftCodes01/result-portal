import { User, Student, Teacher, SchoolClass, Subject, Term, Grade } from '../types';

const STORAGE_KEYS = {
  users: 'school_portal_users',
  students: 'school_portal_students',
  teachers: 'school_portal_teachers',
  classes: 'school_portal_classes',
  subjects: 'school_portal_subjects',
  terms: 'school_portal_terms',
  grades: 'school_portal_grades',
  initialized: 'school_portal_initialized',
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Users
export function getUsers(): User[] { return getItem<User[]>(STORAGE_KEYS.users, []); }
export function setUsers(users: User[]): void { setItem(STORAGE_KEYS.users, users); }
export function addUser(user: User): void { const users = getUsers(); users.push(user); setUsers(users); }
export function updateUser(id: string, data: Partial<User>): void {
  const users = getUsers().map(u => u.id === id ? { ...u, ...data } : u);
  setUsers(users);
}
export function deleteUser(id: string): void {
  setUsers(getUsers().filter(u => u.id !== id));
}

// Students
export function getStudents(): Student[] { return getItem<Student[]>(STORAGE_KEYS.students, []); }
export function setStudents(students: Student[]): void { setItem(STORAGE_KEYS.students, students); }
export function addStudent(student: Student): void { const s = getStudents(); s.push(student); setStudents(s); }
export function updateStudent(id: string, data: Partial<Student>): void {
  const students = getStudents().map(s => s.id === id ? { ...s, ...data } : s);
  setStudents(students);
}
export function deleteStudent(id: string): void {
  setStudents(getStudents().filter(s => s.id !== id));
}

// Teachers
export function getTeachers(): Teacher[] { return getItem<Teacher[]>(STORAGE_KEYS.teachers, []); }
export function setTeachers(teachers: Teacher[]): void { setItem(STORAGE_KEYS.teachers, teachers); }
export function addTeacher(teacher: Teacher): void { const t = getTeachers(); t.push(teacher); setTeachers(t); }
export function updateTeacher(id: string, data: Partial<Teacher>): void {
  const teachers = getTeachers().map(t => t.id === id ? { ...t, ...data } : t);
  setTeachers(teachers);
}
export function deleteTeacher(id: string): void {
  setTeachers(getTeachers().filter(t => t.id !== id));
}

// Classes
export function getClasses(): SchoolClass[] { return getItem<SchoolClass[]>(STORAGE_KEYS.classes, []); }
export function setClasses(classes: SchoolClass[]): void { setItem(STORAGE_KEYS.classes, classes); }
export function addClass(cls: SchoolClass): void { const c = getClasses(); c.push(cls); setClasses(c); }
export function updateClass(id: string, data: Partial<SchoolClass>): void {
  const classes = getClasses().map(c => c.id === id ? { ...c, ...data } : c);
  setClasses(classes);
}
export function deleteClass(id: string): void {
  setClasses(getClasses().filter(c => c.id !== id));
}

// Subjects
export function getSubjects(): Subject[] { return getItem<Subject[]>(STORAGE_KEYS.subjects, []); }
export function setSubjects(subjects: Subject[]): void { setItem(STORAGE_KEYS.subjects, subjects); }
export function addSubject(subject: Subject): void { const s = getSubjects(); s.push(subject); setSubjects(s); }
export function updateSubject(id: string, data: Partial<Subject>): void {
  const subjects = getSubjects().map(s => s.id === id ? { ...s, ...data } : s);
  setSubjects(subjects);
}
export function deleteSubject(id: string): void {
  setSubjects(getSubjects().filter(s => s.id !== id));
}

// Terms
export function getTerms(): Term[] { return getItem<Term[]>(STORAGE_KEYS.terms, []); }
export function setTerms(terms: Term[]): void { setItem(STORAGE_KEYS.terms, terms); }
export function addTerm(term: Term): void { const t = getTerms(); t.push(term); setTerms(t); }
export function updateTerm(id: string, data: Partial<Term>): void {
  const terms = getTerms().map(t => t.id === id ? { ...t, ...data } : t);
  setTerms(terms);
}
export function deleteTerm(id: string): void {
  setTerms(getTerms().filter(t => t.id !== id));
}

// Grades
export function getGrades(): Grade[] { return getItem<Grade[]>(STORAGE_KEYS.grades, []); }
export function setGrades(grades: Grade[]): void { setItem(STORAGE_KEYS.grades, grades); }
export function addGrade(grade: Grade): void { const g = getGrades(); g.push(grade); setGrades(g); }
export function addGrades(grades: Grade[]): void {
  const existing = getGrades();
  const newGrades = [...existing];
  for (const grade of grades) {
    const idx = newGrades.findIndex(
      g => g.studentId === grade.studentId && g.subjectId === grade.subjectId && g.termId === grade.termId
    );
    if (idx >= 0) {
      newGrades[idx] = grade;
    } else {
      newGrades.push(grade);
    }
  }
  setGrades(newGrades);
}
export function deleteGrade(id: string): void {
  setGrades(getGrades().filter(g => g.id !== id));
}

// Auth
export function authenticateUser(username: string, password: string): User | null {
  const users = getUsers();
  return users.find(u => u.username === username && u.password === password) || null;
}

export function isInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEYS.initialized) === 'true';
}

export function markInitialized(): void {
  localStorage.setItem(STORAGE_KEYS.initialized, 'true');
}
