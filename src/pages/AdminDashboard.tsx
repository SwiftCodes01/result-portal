import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as db from '../lib/database';
import { getSupabase } from '../lib/supabase';
import { getGradeColor, getGradeLetter } from '../types';
import {
  Users, GraduationCap, School, BookOpen, Calendar,
  Plus, Edit2, Trash2, Save, Loader2, X, Search, CheckCircle, Clock, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  currentPage: string;
}

export default function AdminDashboard({ currentPage }: Props) {
  if (currentPage === 'dashboard') return <DashboardView />;
  if (currentPage === 'students') return <StudentsView />;
  if (currentPage === 'teachers') return <TeachersView />;
  if (currentPage === 'classes') return <ClassesView />;
  if (currentPage === 'subjects') return <SubjectsView />;
  if (currentPage === 'terms') return <TermsView />;
  if (currentPage === 'promote') return <PromoteStudentsView />;
  if (currentPage === 'approve-grades') return <ApproveGradesView />;
  if (currentPage === 'all-reports') return <ReportsView />;
  if (currentPage === 'settings') return <SettingsView />;
  return <div className="p-8 text-center text-gray-500">Page not found</div>;
}

// ==================== DASHBOARD ====================
function DashboardView() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, subjects: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [students, teachers, classes, subjects] = await Promise.all([
        db.getStudents(),
        db.getTeachers(),
        db.getClasses(),
        db.getSubjects(),
      ]);

      setStats({
        students: students.length,
        teachers: teachers.length,
        classes: classes.length,
        subjects: subjects.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 lg:p-8 text-white"
      >
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Admin Dashboard 🏫</h1>
        <p className="text-slate-300">Complete overview of BrightPath Academy</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.students, icon: Users, color: 'bg-blue-500' },
          { label: 'Total Teachers', value: stats.teachers, icon: GraduationCap, color: 'bg-emerald-500' },
          { label: 'Classes', value: stats.classes, icon: School, color: 'bg-purple-500' },
          { label: 'Subjects', value: stats.subjects, icon: BookOpen, color: 'bg-amber-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ==================== STUDENTS ====================
function StudentsView() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, classesData] = await Promise.all([
        db.getStudents(),
        db.getClasses(),
      ]);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await db.deleteStudent(id);
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete student:', error);
      alert('Failed to delete student');
    }
  };

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.admission_number.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Students</h2>
          <p className="text-sm text-gray-500">{students.length} students enrolled</p>
        </div>
        <button
          onClick={() => { setEditStudent(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or admission number..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Admission No.</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Parent</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                        {student.full_name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{student.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500 font-mono">{student.admission_number}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{student.classes?.name || '-'}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{student.gender}</td>
                  <td className="px-6 py-3">
                    <p className="text-sm text-gray-600">{student.parent_name || '-'}</p>
                    {student.parent_email && <p className="text-xs text-gray-400">{student.parent_email}</p>}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditStudent(student); setShowModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <StudentModal
            student={editStudent}
            classes={classes}
            onClose={() => setShowModal(false)}
            onSave={async () => {
              await loadData();
              setShowModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StudentModal({ student, classes, onClose, onSave }: {
  student: any;
  classes: any[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    full_name: student?.full_name || '',
    admission_number: student?.admission_number || '',
    class_id: student?.class_id || classes[0]?.id || '',
    gender: student?.gender || 'Male',
    date_of_birth: student?.date_of_birth || '',
    parent_name: student?.parent_name || '',
    parent_email: student?.parent_email || '',
    email: '',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState({ email: '', password: '' });

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, password });
  };

  const handleSave = async () => {
    if (!form.full_name || !form.admission_number || !form.class_id) {
      setError('Please fill in all required fields');
      return;
    }

    if (!student && (!form.email || !form.password)) {
      setError('Email and password are required for new students');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (student) {
        // Update existing student
        await db.updateStudent(student.id, {
          full_name: form.full_name,
          admission_number: form.admission_number,
          class_id: form.class_id,
          gender: form.gender,
          date_of_birth: form.date_of_birth,
          parent_name: form.parent_name,
          parent_email: form.parent_email,
        });
        onSave();
      } else {
        // Create student record FIRST (before auth user to avoid RLS issues)
        const newStudent = await db.createStudent({
          full_name: form.full_name,
          admission_number: form.admission_number,
          class_id: form.class_id,
          gender: form.gender,
          date_of_birth: form.date_of_birth,
          parent_name: form.parent_name,
          parent_email: form.parent_email,
        });

        // Now create auth user
        try {
          const authUser = await db.createAuthUser(form.email, form.password, form.full_name, 'student');
          
          if (authUser) {
            // Update student record with user_id
            await db.updateStudent(newStudent.id, { user_id: authUser.id });
          }
        } catch (authError: any) {
          // If auth creation fails, delete the student record
          await db.deleteStudent(newStudent.id);
          throw authError;
        }

        // Show credentials
        setCreatedCredentials({ email: form.email, password: form.password });
        setShowCredentials(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save student');
    } finally {
      setSaving(false);
    }
  };

  const handleCredentialsClose = async () => {
    setShowCredentials(false);
    // Sign out the new user so admin can log back in
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    // Force reload to show login page
    window.location.reload();
  };

  const copyToClipboard = () => {
    const text = `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
  };

  if (showCredentials) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-md shadow-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Student Account Created!
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Please save these login credentials and share them with the student
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <p className="text-sm font-mono text-gray-900">{createdCredentials.email}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                <p className="text-sm font-mono text-gray-900">{createdCredentials.password}</p>
              </div>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full mb-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Copy Credentials
            </button>

            <button
              onClick={handleCredentialsClose}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Close & Sign In Again
            </button>

            <p className="mt-4 text-xs text-gray-500 text-center">
              You will need to sign in again with your admin credentials
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{student ? 'Edit Student' : 'Add New Student'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {!student && (
              <>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Login) *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="student@school.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admission No. *</label>
              <input
                type="text"
                value={form.admission_number}
                onChange={e => setForm({ ...form, admission_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
              <select
                value={form.class_id}
                onChange={e => setForm({ ...form, class_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
              <input
                type="text"
                value={form.parent_name}
                onChange={e => setForm({ ...form, parent_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email</label>
              <input
                type="email"
                value={form.parent_email}
                onChange={e => setForm({ ...form, parent_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {student ? 'Update' : 'Add Student'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== TEACHERS ====================
function TeachersView() {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teachersData, classesData, subjectsData] = await Promise.all([
        db.getTeachers(),
        db.getClasses(),
        db.getSubjects(),
      ]);
      setTeachers(teachersData);
      setClasses(classesData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      await db.deleteTeacher(id);
      setTeachers(teachers.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      alert('Failed to delete teacher');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Teachers</h2>
          <p className="text-sm text-gray-500">{teachers.length} teachers</p>
        </div>
        <button
          onClick={() => { setEditTeacher(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Teacher
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher) => {
          const teacherSubjects = subjects.filter(s => 
            teacher.teacher_subjects?.some((ts: any) => ts.subject_id === s.id)
          );
          const teacherClasses = classes.filter(c => 
            teacher.teacher_classes?.some((tc: any) => tc.class_id === c.id)
          );

          return (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {teacher.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{teacher.full_name}</h4>
                    <p className="text-xs text-gray-500">{teacher.department || 'No department'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditTeacher(teacher); setShowModal(true); }}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Subjects</p>
                  <div className="flex flex-wrap gap-1">
                    {teacherSubjects.map((s: any) => (
                      <span key={s.id} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                        {s.code}
                      </span>
                    ))}
                    {teacherSubjects.length === 0 && <span className="text-xs text-gray-400">None assigned</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Classes</p>
                  <div className="flex flex-wrap gap-1">
                    {teacherClasses.map((c: any) => (
                      <span key={c.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {c.name}
                      </span>
                    ))}
                    {teacherClasses.length === 0 && <span className="text-xs text-gray-400">None assigned</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showModal && (
          <TeacherModal
            teacher={editTeacher}
            classes={classes}
            subjects={subjects}
            onClose={() => setShowModal(false)}
            onSave={async () => {
              await loadData();
              setShowModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TeacherModal({ teacher, classes, subjects, onClose, onSave }: {
  teacher: any;
  classes: any[];
  subjects: any[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    full_name: teacher?.full_name || '',
    department: teacher?.department || '',
    email: '',
    password: '',
    selectedSubjects: teacher?.teacher_subjects?.map((ts: any) => ts.subject_id) || [],
    selectedClasses: teacher?.teacher_classes?.map((tc: any) => tc.class_id) || [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState({ email: '', password: '' });

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, password });
  };

  const handleSave = async () => {
    if (!form.full_name) {
      setError('Please enter teacher name');
      return;
    }

    if (!teacher && (!form.email || !form.password)) {
      setError('Email and password are required for new teachers');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let teacherId = teacher?.id;

      if (teacher) {
        await db.updateTeacher(teacher.id, {
          full_name: form.full_name,
          department: form.department,
        });
      } else {
        // Create teacher record FIRST (before auth user to avoid RLS issues)
        const newTeacher = await db.createTeacher({
          full_name: form.full_name,
          department: form.department,
        });
        teacherId = newTeacher.id;

        // Now create auth user
        try {
          const authUser = await db.createAuthUser(form.email, form.password, form.full_name, 'teacher');
          
          if (authUser) {
            // Update teacher record with user_id
            await db.updateTeacher(teacherId, { user_id: authUser.id });
          }
        } catch (authError: any) {
          // If auth creation fails, delete the teacher record
          await db.deleteTeacher(teacherId);
          throw authError;
        }

        // Update relationships
        await db.setTeacherSubjects(teacherId, form.selectedSubjects);
        await db.setTeacherClasses(teacherId, form.selectedClasses);

        // Show credentials
        setCreatedCredentials({ email: form.email, password: form.password });
        setShowCredentials(true);
        return;
      }

      // Update relationships for existing teacher
      await db.setTeacherSubjects(teacherId, form.selectedSubjects);
      await db.setTeacherClasses(teacherId, form.selectedClasses);

      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save teacher');
    } finally {
      setSaving(false);
    }
  };

  const handleCredentialsClose = async () => {
    setShowCredentials(false);
    // Sign out the new user so admin can log back in
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    // Force reload to show login page
    window.location.reload();
  };

  const copyToClipboard = () => {
    const text = `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
  };

  if (showCredentials) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-md shadow-xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Teacher Account Created!
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Please save these login credentials and share them with the teacher
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <p className="text-sm font-mono text-gray-900">{createdCredentials.email}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                <p className="text-sm font-mono text-gray-900">{createdCredentials.password}</p>
              </div>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full mb-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Copy Credentials
            </button>

            <button
              onClick={handleCredentialsClose}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Close & Sign In Again
            </button>

            <p className="mt-4 text-xs text-gray-500 text-center">
              You will need to sign in again with your admin credentials
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{teacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {!teacher && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Login) *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="teacher@school.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subjects</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
              {subjects.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setForm({ ...form, selectedSubjects: toggleArray(form.selectedSubjects, s.id) })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    form.selectedSubjects.includes(s.id)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classes</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
              {classes.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setForm({ ...form, selectedClasses: toggleArray(form.selectedClasses, c.id) })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    form.selectedClasses.includes(c.id)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-medium"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {teacher ? 'Update' : 'Add Teacher'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== CLASSES ====================
function ClassesView() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editClass, setEditClass] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classesData, studentsData] = await Promise.all([
        db.getClasses(),
        db.getStudents(),
      ]);
      setClasses(classesData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this class?')) return;
    
    try {
      await db.deleteClass(id);
      setClasses(classes.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete class:', error);
      alert('Failed to delete class');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Classes</h2>
          <p className="text-sm text-gray-500">{classes.length} classes</p>
        </div>
        <button
          onClick={() => { setEditClass(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Class
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map(cls => {
          const count = students.filter(s => s.class_id === cls.id).length;
          return (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  cls.level === 'Primary' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                }`}>
                  <School className="w-6 h-6" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditClass(cls); setShowModal(true); }}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h4 className="font-semibold text-gray-900">{cls.name}</h4>
              <p className="text-sm text-gray-500">{cls.level} • Section {cls.section}</p>
              <div className="mt-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{count} students</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showModal && (
          <ClassModal
            cls={editClass}
            onClose={() => setShowModal(false)}
            onSave={async () => {
              await loadData();
              setShowModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ClassModal({ cls, onClose, onSave }: {
  cls: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: cls?.name || '',
    level: cls?.level || 'Primary',
    grade: cls?.grade || 1,
    section: cls?.section || 'A',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.name) {
      setError('Please enter class name');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (cls) {
        await db.updateClass(cls.id, form);
      } else {
        await db.createClass(form);
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save class');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{cls ? 'Edit Class' : 'Add Class'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={form.level}
                onChange={e => setForm({ ...form, level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <input
                type="number"
                min="1"
                max="12"
                value={form.grade}
                onChange={e => setForm({ ...form, grade: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <input
                type="text"
                value={form.section}
                onChange={e => setForm({ ...form, section: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-medium"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== SUBJECTS ====================
function SubjectsView() {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const subjectsData = await db.getSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    
    try {
      await db.deleteSubject(id);
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete subject:', error);
      alert('Failed to delete subject');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Subjects</h2>
          <p className="text-sm text-gray-500">{subjects.length} subjects</p>
        </div>
        <button
          onClick={() => { setEditSubject(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map(subject => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{subject.name}</h4>
                <p className="text-xs text-gray-500">{subject.code} • {subject.level}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => { setEditSubject(subject); setShowModal(true); }}
                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(subject.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <SubjectModal
            subject={editSubject}
            onClose={() => setShowModal(false)}
            onSave={async () => {
              await loadData();
              setShowModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SubjectModal({ subject, onClose, onSave }: {
  subject: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: subject?.name || '',
    code: subject?.code || '',
    level: subject?.level || 'Both',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.name || !form.code) {
      setError('Please fill in all fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (subject) {
        await db.updateSubject(subject.id, form);
      } else {
        await db.createSubject(form);
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save subject');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{subject ? 'Edit Subject' : 'Add Subject'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <input
              type="text"
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select
              value={form.level}
              onChange={e => setForm({ ...form, level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Both">Both</option>
              <option value="Primary">Primary Only</option>
              <option value="Secondary">Secondary Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-medium"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== TERMS ====================
function TermsView() {
  const [loading, setLoading] = useState(true);
  const [terms, setTerms] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editTerm, setEditTerm] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const termsData = await db.getTerms();
      setTerms(termsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this term?')) return;
    
    try {
      await db.deleteTerm(id);
      setTerms(terms.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete term:', error);
      alert('Failed to delete term');
    }
  };

  const toggleActive = async (id: string) => {
    try {
      await db.setActiveTerm(id);
      await loadData();
    } catch (error) {
      console.error('Failed to set active term:', error);
      alert('Failed to set active term');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Academic Terms</h2>
          <p className="text-sm text-gray-500">{terms.length} terms configured</p>
        </div>
        <button
          onClick={() => { setEditTerm(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Term
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {terms.map(term => (
          <motion.div
            key={term.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl p-5 border shadow-sm ${term.is_active ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-gray-100'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                term.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'
              }`}>
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditTerm(term); setShowModal(true); }}
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(term.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900">{term.name}</h4>
            <p className="text-sm text-gray-500">Academic Year {term.year}</p>
            <p className="text-xs text-gray-400 mt-1">{term.start_date} → {term.end_date}</p>
            <div className="mt-3 flex items-center justify-between">
              {term.is_active ? (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Active
                </span>
              ) : (
                <button
                  onClick={() => toggleActive(term.id)}
                  className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  Set as Active
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <TermModal
            term={editTerm}
            onClose={() => setShowModal(false)}
            onSave={async () => {
              await loadData();
              setShowModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TermModal({ term, onClose, onSave }: {
  term: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: term?.name || '',
    year: term?.year || new Date().getFullYear(),
    start_date: term?.start_date || '',
    end_date: term?.end_date || '',
    is_active: term?.is_active || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.name || !form.start_date || !form.end_date) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (term) {
        await db.updateTerm(term.id, form);
      } else {
        await db.createTerm(form);
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save term');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{term ? 'Edit Term' : 'Add Term'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. First Term"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
            <input
              type="number"
              value={form.year}
              onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Set as active term</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-medium"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== APPROVE GRADES ====================
function ApproveGradesView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrades, setSelectedGrades] = useState<Set<string>>(new Set());
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [gradesData, studentsData, classesData, subjectsData, termsData, teachersData] = await Promise.all([
        db.getGrades({}),
        db.getStudents(),
        db.getClasses(),
        db.getSubjects(),
        db.getTerms(),
        db.getTeachers(),
      ]);
      setGrades(gradesData);
      setStudents(studentsData);
      setClasses(classesData);
      setSubjects(subjectsData);
      setTerms(termsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (gradeId: string) => {
    if (!user) return;
    try {
      await db.approveGrade(gradeId, user.id);
      setGrades(grades.map(g => g.id === gradeId ? { ...g, is_approved: true } : g));
      setSelectedGrades(prev => {
        const next = new Set(prev);
        next.delete(gradeId);
        return next;
      });
    } catch (error) {
      console.error('Failed to approve grade:', error);
      alert('Failed to approve grade');
    }
  };

  const handleBulkApprove = async () => {
    if (!user || selectedGrades.size === 0) return;
    setApproving(true);
    try {
      await db.bulkApproveGrades(Array.from(selectedGrades), user.id);
      setGrades(grades.map(g => selectedGrades.has(g.id) ? { ...g, is_approved: true } : g));
      setSelectedGrades(new Set());
    } catch (error) {
      console.error('Failed to approve grades:', error);
      alert('Failed to approve grades');
    } finally {
      setApproving(false);
    }
  };

  const toggleGradeSelection = (gradeId: string) => {
    setSelectedGrades(prev => {
      const next = new Set(prev);
      if (next.has(gradeId)) {
        next.delete(gradeId);
      } else {
        next.add(gradeId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Filter grades
  const filteredGrades = grades.filter(g => {
    const student = students.find(s => s.id === g.student_id);
    const matchClass = !selectedClass || student?.class_id === selectedClass;
    const matchTerm = !selectedTerm || g.term_id === selectedTerm;
    const matchSubject = !selectedSubject || g.subject_id === selectedSubject;
    return matchClass && matchTerm && matchSubject;
  });

  const pendingGrades = filteredGrades.filter(g => !g.is_approved);
  const approvedGrades = filteredGrades.filter(g => g.is_approved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Approve Grades</h2>
          <p className="text-sm text-gray-500">Review and approve grades uploaded by teachers</p>
        </div>
        {selectedGrades.size > 0 && (
          <button
            onClick={handleBulkApprove}
            disabled={approving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Approve Selected ({selectedGrades.size})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Terms</option>
          {terms.map(t => <option key={t.id} value={t.id}>{t.name} {t.year}</option>)}
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-900">{pendingGrades.length}</p>
              <p className="text-sm text-yellow-700">Pending Approval</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{approvedGrades.length}</p>
              <p className="text-sm text-green-700">Approved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Grades Table */}
      {pendingGrades.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-yellow-50">
            <h3 className="font-semibold text-gray-900">Pending Grades ({pendingGrades.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={pendingGrades.every(g => selectedGrades.has(g.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGrades(new Set([...selectedGrades, ...pendingGrades.map(g => g.id)]));
                        } else {
                          setSelectedGrades(new Set([...selectedGrades].filter(id => !pendingGrades.some(g => g.id === id))));
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Term</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Teacher</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingGrades.map(grade => {
                  const student = students.find(s => s.id === grade.student_id);
                  const subject = subjects.find(s => s.id === grade.subject_id);
                  const term = terms.find(t => t.id === grade.term_id);
                  const teacher = teachers.find(t => t.id === grade.teacher_id);

                  return (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedGrades.has(grade.id)}
                          onChange={() => toggleGradeSelection(grade.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {student?.full_name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{student?.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{student?.classes?.name || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{subject?.name || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{term?.name || '-'}</td>
                      <td className="px-6 py-3 text-center text-sm font-semibold text-gray-900">{grade.score}%</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getGradeColor(grade.grade_letter)}`}>
                          {grade.grade_letter}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{teacher?.full_name || '-'}</td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handleApprove(grade.id)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approved Grades Table */}
      {approvedGrades.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-green-50">
            <h3 className="font-semibold text-gray-900">Approved Grades ({approvedGrades.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Term</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Teacher</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {approvedGrades.map(grade => {
                  const student = students.find(s => s.id === grade.student_id);
                  const subject = subjects.find(s => s.id === grade.subject_id);
                  const term = terms.find(t => t.id === grade.term_id);
                  const teacher = teachers.find(t => t.id === grade.teacher_id);

                  return (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {student?.full_name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{student?.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{student?.classes?.name || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{subject?.name || '-'}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{term?.name || '-'}</td>
                      <td className="px-6 py-3 text-center text-sm font-semibold text-gray-900">{grade.score}%</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getGradeColor(grade.grade_letter)}`}>
                          {grade.grade_letter}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{teacher?.full_name || '-'}</td>
                      <td className="px-6 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredGrades.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Grades Found</h3>
          <p className="text-gray-600">No grades match your current filters.</p>
        </div>
      )}
    </div>
  );
}

// ==================== REPORTS ====================
function ReportsView() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [terms, setTerms] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, classesData, gradesData, termsData] = await Promise.all([
        db.getStudents(),
        db.getClasses(),
        db.getGrades({}),
        db.getTerms(),
      ]);
      setStudents(studentsData);
      setClasses(classesData);
      setGrades(gradesData);
      setTerms(termsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const filteredStudents = selectedClass
    ? students.filter(s => s.class_id === selectedClass)
    : students;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Reports</h2>
          <p className="text-sm text-gray-500">View all student grades</p>
        </div>
      </div>

      <div className="flex gap-4">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Terms</option>
          {terms.map(t => <option key={t.id} value={t.id}>{t.name} {t.year}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Average</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map(student => {
                const studentGrades = grades.filter(g =>
                  g.student_id === student.id &&
                  (!selectedTerm || g.term_id === selectedTerm)
                );
                const avg = studentGrades.length > 0
                  ? Math.round(studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length)
                  : 0;
                const grade = avg > 0 ? getGradeLetter(avg) : '-';

                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                          {student.full_name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{student.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{student.classes?.name || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{studentGrades.length}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{avg > 0 ? `${avg}%` : '-'}</td>
                    <td className="px-6 py-3">
                      {avg > 0 ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getGradeColor(grade)}`}>
                          {grade}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No students found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== PROMOTE STUDENTS ====================
function PromoteStudentsView() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedSourceClass, setSelectedSourceClass] = useState('');
  const [selectedDestinationClass, setSelectedDestinationClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [promoting, setPromoting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, classesData] = await Promise.all([
        db.getStudents(),
        db.getClasses(),
      ]);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sourceClassStudents = students.filter(s => s.class_id === selectedSourceClass);

  const handleSelectAll = () => {
    if (selectedStudents.length === sourceClassStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(sourceClassStudents.map(s => s.id));
    }
  };

  const handleSelectStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handlePromote = async () => {
    if (!selectedSourceClass || !selectedDestinationClass) {
      alert('Please select both source and destination classes');
      return;
    }

    if (selectedStudents.length === 0) {
      alert('Please select at least one student to promote');
      return;
    }

    if (selectedSourceClass === selectedDestinationClass) {
      alert('Source and destination classes cannot be the same');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to promote ${selectedStudents.length} student(s) to the selected class?`
    );

    if (!confirmed) return;

    setPromoting(true);
    try {
      await db.bulkPromoteStudents(selectedStudents, selectedDestinationClass);
      setSuccess(`Successfully promoted ${selectedStudents.length} student(s)!`);
      setSelectedStudents([]);
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to promote students:', error);
      alert('Failed to promote students');
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Promote Students</h2>
        <p className="text-sm text-gray-500">Move students to the next class (e.g., Primary 1 → Primary 2)</p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Class (Current)
            </label>
            <select
              value={selectedSourceClass}
              onChange={(e) => {
                setSelectedSourceClass(e.target.value);
                setSelectedStudents([]);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select current class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Class (Next)
            </label>
            <select
              value={selectedDestinationClass}
              onChange={(e) => setSelectedDestinationClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select next class</option>
              {classes
                .filter((cls) => cls.id !== selectedSourceClass)
                .map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.level}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {selectedSourceClass && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Students in {classes.find(c => c.id === selectedSourceClass)?.name}
              </h3>
              <button
                onClick={handleSelectAll}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {selectedStudents.length === sourceClassStudents.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {sourceClassStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students in this class
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedStudents.length === sourceClassStudents.length && sourceClassStudents.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Student Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Admission No.
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sourceClassStudents.map((student) => (
                        <tr
                          key={student.id}
                          className={selectedStudents.includes(student.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleSelectStudent(student.id)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {student.full_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {student.admission_number}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {selectedStudents.length} student(s) selected
              </div>
              <button
                onClick={handlePromote}
                disabled={promoting || selectedStudents.length === 0 || !selectedDestinationClass}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {promoting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Promoting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Promote Selected Students
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Student Promotion</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Use this feature at the end of an academic year to move students to the next class</li>
          <li>You can promote all students at once or select specific students</li>
          <li>Students who fail can be kept in the same class by not selecting them</li>
          <li>Review the selection carefully before promoting - this action cannot be undone easily</li>
          <li>Consider creating a backup of your database before bulk promotions</li>
        </ul>
      </div>
    </div>
  );
}

// ==================== SETTINGS ====================
function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Manage your school portal</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Database Configuration</h3>
        <p className="text-sm text-gray-600 mb-4">
          Your portal is connected to Supabase. To change the connection settings, clear your browser localStorage and reload the page.
        </p>
        <button
          onClick={() => {
            if (confirm('This will disconnect your database. You will need to re-enter your Supabase credentials. Continue?')) {
              localStorage.removeItem('supabase_url');
              localStorage.removeItem('supabase_anon_key');
              window.location.reload();
            }
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Disconnect Database
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">About</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>DAARUL LUGATUL AROBIYYAH School Portal</strong></p>
          <p>Version 1.0.0</p>
          <p>Developed by Swift Media</p>
        </div>
      </div>
    </div>
  );
}
