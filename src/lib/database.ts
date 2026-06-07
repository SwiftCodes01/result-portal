import { getSupabase } from './supabase';
import { getGradeLetter, getGradeRemark } from '../types';

// Helper to get Supabase client or throw error
function db() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

// ==================== PROFILES ====================
export async function getProfile(userId: string) {
  const { data, error } = await db()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllProfiles() {
  const { data, error } = await db()
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ==================== AUTH USER CREATION ====================
export async function createAuthUser(email: string, password: string, fullName: string, role: string) {
  const supabase = db();
  
  // Save current admin session
  const { data: { session: currentSession } } = await supabase.auth.getSession();
  
  // Create the new user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });

  if (error) throw error;
  
  // Restore admin session if it was switched
  if (currentSession && currentSession.user.id !== data.user?.id) {
    await supabase.auth.setSession({
      access_token: currentSession.access_token,
      refresh_token: currentSession.refresh_token,
    });
  }
  
  return data.user;
}

export async function resetPassword(email: string) {
  const { error } = await db().auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });

  if (error) throw error;
}

// ==================== CLASSES ====================
export async function getClasses() {
  const { data, error } = await db()
    .from('classes')
    .select('*')
    .order('grade', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createClass(cls: { name: string; level: string; grade: number; section: string }) {
  const { data, error } = await db()
    .from('classes')
    .insert(cls)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClass(id: string, cls: Partial<{ name: string; level: string; grade: number; section: string }>) {
  const { data, error } = await db()
    .from('classes')
    .update(cls)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClass(id: string) {
  const { error } = await db()
    .from('classes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ==================== SUBJECTS ====================
export async function getSubjects() {
  const { data, error } = await db()
    .from('subjects')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createSubject(subject: { name: string; code: string; level: string }) {
  const { data, error } = await db()
    .from('subjects')
    .insert(subject)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubject(id: string, subject: Partial<{ name: string; code: string; level: string }>) {
  const { data, error } = await db()
    .from('subjects')
    .update(subject)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubject(id: string) {
  const { error } = await db()
    .from('subjects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ==================== TERMS ====================
export async function getTerms() {
  const { data, error } = await db()
    .from('terms')
    .select('*')
    .order('year', { ascending: false })
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createTerm(term: { name: string; year: number; start_date: string; end_date: string; is_active: boolean }) {
  const { data, error } = await db()
    .from('terms')
    .insert(term)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTerm(id: string, term: Partial<{ name: string; year: number; start_date: string; end_date: string; is_active: boolean }>) {
  const { data, error } = await db()
    .from('terms')
    .update(term)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTerm(id: string) {
  const { error } = await db()
    .from('terms')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function setActiveTerm(id: string) {
  // First, deactivate all terms
  await db().from('terms').update({ is_active: false }).neq('id', id);
  // Then activate the selected term
  const { data, error } = await db()
    .from('terms')
    .update({ is_active: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==================== STUDENTS ====================
export async function getStudents() {
  const { data, error } = await db()
    .from('students')
    .select(`
      *,
      classes (*),
      profiles (email, full_name)
    `)
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getStudentByUserId(userId: string) {
  const { data, error } = await db()
    .from('students')
    .select(`
      *,
      classes (*)
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function createStudent(student: {
  user_id?: string;
  admission_number: string;
  full_name: string;
  class_id: string;
  parent_name?: string;
  parent_email?: string;
  date_of_birth?: string;
  gender?: string;
}) {
  const { data, error } = await db()
    .from('students')
    .insert(student)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStudent(id: string, student: Partial<{
  user_id?: string;
  admission_number: string;
  full_name: string;
  class_id: string;
  parent_name?: string;
  parent_email?: string;
  date_of_birth?: string;
  gender?: string;
}>) {
  const { data, error } = await db()
    .from('students')
    .update(student)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStudent(id: string) {
  const { error } = await db()
    .from('students')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function bulkPromoteStudents(studentIds: string[], newClassId: string) {
  const { error } = await db()
    .from('students')
    .update({ class_id: newClassId })
    .in('id', studentIds);

  if (error) throw error;
}

// ==================== TEACHERS ====================
export async function getTeachers() {
  const { data, error } = await db()
    .from('teachers')
    .select(`
      *,
      profiles (email, full_name),
      teacher_subjects (subject_id),
      teacher_classes (class_id)
    `)
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getTeacherByUserId(userId: string) {
  const { data, error } = await db()
    .from('teachers')
    .select(`
      *,
      teacher_subjects (subject_id),
      teacher_classes (class_id)
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function createTeacher(teacher: {
  user_id?: string;
  full_name: string;
  department?: string;
}) {
  const { data, error } = await db()
    .from('teachers')
    .insert(teacher)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTeacher(id: string, teacher: Partial<{
  user_id?: string;
  full_name: string;
  department?: string;
}>) {
  const { data, error } = await db()
    .from('teachers')
    .update(teacher)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTeacher(id: string) {
  const { error } = await db()
    .from('teachers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function setTeacherSubjects(teacherId: string, subjectIds: string[]) {
  // Delete existing relationships
  await db().from('teacher_subjects').delete().eq('teacher_id', teacherId);

  // Insert new relationships
  if (subjectIds.length > 0) {
    const relationships = subjectIds.map(subject_id => ({
      teacher_id: teacherId,
      subject_id,
    }));

    const { error } = await db().from('teacher_subjects').insert(relationships);
    if (error) throw error;
  }
}

export async function setTeacherClasses(teacherId: string, classIds: string[]) {
  // Delete existing relationships
  await db().from('teacher_classes').delete().eq('teacher_id', teacherId);

  // Insert new relationships
  if (classIds.length > 0) {
    const relationships = classIds.map(class_id => ({
      teacher_id: teacherId,
      class_id,
    }));

    const { error } = await db().from('teacher_classes').insert(relationships);
    if (error) throw error;
  }
}

// ==================== GRADES ====================
export async function getGrades(filters?: {
  student_id?: string;
  subject_id?: string;
  term_id?: string;
  teacher_id?: string;
  approved_only?: boolean;
}) {
  let query = db()
    .from('grades')
    .select(`
      *,
      students (full_name, admission_number),
      subjects (name, code),
      terms (name, year),
      classes (name, level, grade, section)
    `);

  if (filters?.student_id) {
    query = query.eq('student_id', filters.student_id);
  }
  if (filters?.subject_id) {
    query = query.eq('subject_id', filters.subject_id);
  }
  if (filters?.term_id) {
    query = query.eq('term_id', filters.term_id);
  }
  if (filters?.teacher_id) {
    query = query.eq('teacher_id', filters.teacher_id);
  }
  if (filters?.approved_only) {
    query = query.eq('is_approved', true);
  }

  const { data, error } = await query.order('date_uploaded', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function approveGrade(gradeId: string, adminId: string) {
  const { data, error } = await db()
    .from('grades')
    .update({
      is_approved: true,
      approved_by: adminId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', gradeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function bulkApproveGrades(gradeIds: string[], adminId: string) {
  const { data, error } = await db()
    .from('grades')
    .update({
      is_approved: true,
      approved_by: adminId,
      approved_at: new Date().toISOString(),
    })
    .in('id', gradeIds)
    .select();

  if (error) throw error;
  return data || [];
}

export async function createGrade(grade: {
  student_id: string;
  subject_id: string;
  term_id: string;
  class_id: string;
  teacher_id: string;
  score: number;
}) {
  const gradeLetter = getGradeLetter(grade.score);
  const remark = getGradeRemark(gradeLetter);

  const { data, error } = await db()
    .from('grades')
    .insert({
      ...grade,
      grade_letter: gradeLetter,
      remark,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGrade(id: string, grade: Partial<{
  score: number;
  grade_letter: string;
  remark: string;
}>) {
  const { data, error } = await db()
    .from('grades')
    .update(grade)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGrade(id: string) {
  const { error } = await db()
    .from('grades')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function upsertGrade(grade: {
  student_id: string;
  subject_id: string;
  term_id: string;
  class_id: string;
  teacher_id: string;
  score: number;
}) {
  const gradeLetter = getGradeLetter(grade.score);
  const remark = getGradeRemark(gradeLetter);

  const { data, error } = await db()
    .from('grades')
    .upsert({
      ...grade,
      grade_letter: gradeLetter,
      remark,
    }, {
      onConflict: 'student_id,subject_id,term_id'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function bulkUpsertGrades(grades: Array<{
  student_id: string;
  subject_id: string;
  term_id: string;
  class_id: string;
  teacher_id: string;
  score: number;
}>) {
  const gradesWithLetters = grades.map(grade => ({
    ...grade,
    grade_letter: getGradeLetter(grade.score),
    remark: getGradeRemark(getGradeLetter(grade.score)),
  }));

  const { data, error } = await db()
    .from('grades')
    .upsert(gradesWithLetters, {
      onConflict: 'student_id,subject_id,term_id'
    })
    .select();

  if (error) throw error;
  return data || [];
}
