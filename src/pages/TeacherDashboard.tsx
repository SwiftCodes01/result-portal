import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as db from '../lib/database';
import { getGradeColor, getGradeLetter } from '../types';
import { BookOpen, Users, Save, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  currentPage: string;
}

export default function TeacherDashboard({ currentPage }: Props) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Load existing grades when selections change
  useEffect(() => {
    loadExistingGrades();
  }, [selectedClass, selectedSubject, selectedTerm, students]);

  const loadExistingGrades = async () => {
    if (!selectedClass || !selectedSubject || !selectedTerm) {
      setGradeInputs({});
      return;
    }

    try {
      // Load all grades for this subject and term
      const grades = await db.getGrades({
        subject_id: selectedSubject,
        term_id: selectedTerm,
      });

      // Build inputs map for students in the selected class
      const classStudentIds = students
        .filter((s: any) => s.class_id === selectedClass)
        .map((s: any) => s.id);

      const inputs: Record<string, string> = {};
      
      for (const grade of grades) {
        if (classStudentIds.includes(grade.student_id)) {
          inputs[grade.student_id] = grade.score.toString();
        }
      }

      setGradeInputs(inputs);
    } catch (error) {
      console.error('Failed to load existing grades:', error);
    }
  };

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [teacherData, classesData, subjectsData, studentsData, termsData] = await Promise.all([
        db.getTeacherByUserId(user.id),
        db.getClasses(),
        db.getSubjects(),
        db.getStudents(),
        db.getTerms(),
      ]);

      setTeacher(teacherData);
      setClasses(classesData);
      setSubjects(subjectsData);
      setStudents(studentsData);
      setTerms(termsData);

      if (teacherData) {
        const teacherClassIds = teacherData.teacher_classes?.map((tc: any) => tc.class_id) || [];
        const teacherSubjectIds = teacherData.teacher_subjects?.map((ts: any) => ts.subject_id) || [];

        if (teacherClassIds.length > 0) setSelectedClass(teacherClassIds[0]);
        if (teacherSubjectIds.length > 0) setSelectedSubject(teacherSubjectIds[0]);

        const activeTerm = termsData.find((t: any) => t.is_active);
        setSelectedTerm(activeTerm?.id || termsData[0]?.id || '');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!teacher || !selectedClass || !selectedSubject || !selectedTerm) return;

    const classStudents = students.filter((s: any) => s.class_id === selectedClass);
    const grades = [];

    for (const student of classStudents) {
      const scoreStr = gradeInputs[student.id];
      if (!scoreStr) continue;

      const score = parseInt(scoreStr);
      if (isNaN(score) || score < 0 || score > 100) continue;

      grades.push({
        student_id: student.id,
        subject_id: selectedSubject,
        term_id: selectedTerm,
        class_id: selectedClass,
        teacher_id: teacher.id,
        score,
      });
    }

    if (grades.length > 0) {
      try {
        await db.bulkUpsertGrades(grades);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        
        // Reload grades to confirm they were saved
        await loadExistingGrades();
      } catch (error) {
        console.error('Failed to save grades:', error);
        alert('Failed to save grades');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Teacher Record Not Found</h3>
        <p className="text-gray-600">Please contact your administrator to set up your teacher profile.</p>
      </div>
    );
  }

  const teacherClassIds = teacher.teacher_classes?.map((tc: any) => tc.class_id) || [];
  const teacherSubjectIds = teacher.teacher_subjects?.map((ts: any) => ts.subject_id) || [];
  const teacherClasses = classes.filter((c: any) => teacherClassIds.includes(c.id));
  const teacherSubjects = subjects.filter((s: any) => teacherSubjectIds.includes(s.id));
  const classStudents = students.filter((s: any) => s.class_id === selectedClass);

  if (currentPage === 'dashboard') {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 lg:p-8 text-white"
        >
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Hello, {profile?.full_name}! 📚</h1>
          <p className="text-teal-100 mb-4">{teacher.department} Department</p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-xs text-teal-200">My Classes</p>
              <p className="text-2xl font-bold">{teacherClasses.length}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-xs text-teal-200">Subjects</p>
              <p className="text-2xl font-bold">{teacherSubjects.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Grade Approval Process</h3>
              <p className="text-sm text-blue-700">
                All grades you upload will be reviewed by the admin before becoming visible to students. 
                You'll see a "Pending admin approval" confirmation after uploading grades.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teacherSubjects.map((subject: any, i: number) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
            >
              <BookOpen className="w-8 h-8 text-teal-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">{subject.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{subject.code}</p>
              <button
                onClick={() => { setSelectedSubject(subject.id); }}
                className="w-full px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium"
              >
                Upload Grades
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (currentPage === 'upload-grades') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Upload Grades</h2>
          <p className="text-sm text-gray-500">Enter scores for students</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl"
            >
              {teacherClasses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl"
            >
              {teacherSubjects.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl"
            >
              {terms.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name} {t.year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{classStudents.length} students</h3>
            {saveSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Grades saved! Pending admin approval.
              </div>
            )}
          </div>

          {classStudents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No students in this class.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classStudents.map((student: any) => {
                    const scoreStr = gradeInputs[student.id] || '';
                    const score = parseInt(scoreStr);
                    const hasScore = !isNaN(score) && score >= 0 && score <= 100;
                    const gradeLetter = hasScore ? getGradeLetter(score) : '';

                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-900 text-sm">{student.full_name}</td>
                        <td className="px-6 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={scoreStr}
                            onChange={(e) => setGradeInputs({ ...gradeInputs, [student.id]: e.target.value })}
                            className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg text-sm"
                            placeholder="--"
                          />
                        </td>
                        <td className="px-6 py-3 text-center">
                          {hasScore && (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getGradeColor(gradeLetter)}`}>
                              {gradeLetter}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {classStudents.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Save Grades
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // My Students page
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Students</h2>
        <p className="text-sm text-gray-500">Students in your assigned classes</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {teacherClasses.map((cls: any) => (
          <button
            key={cls.id}
            onClick={() => setSelectedClass(cls.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedClass === cls.id
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cls.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Admission No.</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Gender</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classStudents.map((student: any) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                        {student.full_name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{student.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500 font-mono">{student.admission_number}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{student.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {classStudents.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No students in this class.</p>
          </div>
        )}
      </div>
    </div>
  );
}
