import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as db from '../lib/database';
import { getGradeColor, getGradeLetter } from '../types';
import {
  TrendingUp, Award, BookOpen, Calendar, ChevronRight,
  Printer, BarChart3, Target, Star, School, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import logo from "../assets/Darullogo.png"
interface Props {
  currentPage: string;
}

export default function StudentDashboard({ currentPage }: Props) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedTerm, setSelectedTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [studentData, classesData, subjectsData, termsData] = await Promise.all([
        db.getStudentByUserId(user.id),
        db.getClasses(),
        db.getSubjects(),
        db.getTerms(),
      ]);

      setStudent(studentData);
      setClasses(classesData);
      setSubjects(subjectsData);
      setTerms(termsData);

      // Filter grades for this student (only approved grades)
      if (studentData) {
        const studentGrades = await db.getGrades({ 
          student_id: studentData.id,
          approved_only: true 
        });
        setGrades(studentGrades);
      }

      // Restore selected term from localStorage or set default
      const savedTermId = localStorage.getItem('selectedTermId');
      if (savedTermId && termsData.find((t: any) => t.id === savedTermId)) {
        setSelectedTerm(savedTermId);
      } else {
        const activeTerm = termsData.find((t: any) => t.is_active);
        const defaultTerm = activeTerm?.id || termsData[termsData.length - 1]?.id || '';
        setSelectedTerm(defaultTerm);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save selected term to localStorage whenever it changes
  useEffect(() => {
    if (selectedTerm) {
      localStorage.setItem('selectedTermId', selectedTerm);
    }
  }, [selectedTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Record Not Found</h3>
        <p className="text-gray-600">Please contact your administrator to set up your student profile.</p>
      </div>
    );
  }

  const studentClass = student.classes;
  const termGrades = grades.filter((g: any) => g.term_id === selectedTerm);
  const selectedTermData = terms.find((t: any) => t.id === selectedTerm);

  const average = termGrades.length > 0
    ? Math.round(termGrades.reduce((sum: number, g: any) => sum + g.score, 0) / termGrades.length)
    : 0;

  const totalScore = termGrades.reduce((sum: number, g: any) => sum + g.score, 0);

  // Calculate position (simplified - would need all students in class for accurate position)
  const position = 1; // Placeholder - would calculate from all students in class

  if (currentPage === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative z-10">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back, {profile?.full_name?.split(' ')[0]}! 👋</h1>
            <p className="text-indigo-100 mb-4">
              {studentClass?.name} • Admission No: {student.admission_number}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                <p className="text-xs text-indigo-200">Current Average</p>
                <p className="text-2xl font-bold">{average}%</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                <p className="text-xs text-indigo-200">Class Position</p>
                <p className="text-2xl font-bold">{position}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                <p className="text-xs text-indigo-200">Subjects</p>
                <p className="text-2xl font-bold">{termGrades.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Term selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {terms.map((term: any) => (
            <button
              key={term.id}
              onClick={() => setSelectedTerm(term.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedTerm === term.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {term.name} {term.year}
              {term.is_active && <span className="ml-2 w-2 h-2 bg-emerald-400 rounded-full inline-block" />}
            </button>
          ))}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Score', value: totalScore.toString(), icon: Target, color: 'bg-blue-500' },
            { label: 'Average', value: `${average}%`, icon: TrendingUp, color: 'bg-emerald-500' },
            { label: 'Highest Score', value: termGrades.length > 0 ? `${Math.max(...termGrades.map((g: any) => g.score))}%` : '-', icon: Star, color: 'bg-amber-500' },
            { label: 'Lowest Score', value: termGrades.length > 0 ? `${Math.min(...termGrades.map((g: any) => g.score))}%` : '-', icon: BarChart3, color: 'bg-red-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
            >
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Subject grades */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Subject Results</h3>
              <p className="text-sm text-gray-500">{selectedTermData?.name} {selectedTermData?.year}</p>
            </div>
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          {termGrades.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No grades available for this term yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {termGrades.map((grade: any, i: number) => {
                return (
                  <motion.div
                    key={grade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${getGradeColor(grade.grade_letter)}`}>
                        {grade.grade_letter}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{grade.subjects?.name}</p>
                        <p className="text-xs text-gray-500">{grade.subjects?.code} • {grade.remark}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{grade.score}%</p>
                      <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            grade.score >= 70 ? 'bg-emerald-500' : grade.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${grade.score}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Reports page
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Report Cards</h2>
          <p className="text-sm text-gray-500">View your academic performance across all terms</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {terms.map((term: any, i: number) => {
          const tGrades = grades.filter((g: any) => g.term_id === term.id);
          const tAvg = tGrades.length > 0 ? Math.round(tGrades.reduce((s: number, g: any) => s + g.score, 0) / tGrades.length) : 0;
          const hasGrades = tGrades.length > 0;

          return (
            <motion.div
              key={term.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className={`p-6 ${hasGrades ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-4">
                  <Calendar className={`w-8 h-8 ${hasGrades ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {term.is_active && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">{term.name}</h3>
                <p className="text-sm text-gray-500">{term.year}</p>
              </div>
              <div className="p-6">
                {hasGrades ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Average Score</p>
                        <p className="text-3xl font-bold text-gray-900">{tAvg}%</p>
                      </div>
                      <div className={`text-4xl font-bold ${getGradeColor(getGradeLetter(tAvg)).split(' ')[0]}`}>
                        {getGradeLetter(tAvg)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{tGrades.length} subjects graded</p>
                    <button
                      onClick={() => setSelectedTerm(term.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No grades uploaded yet</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Printable Report Card */}
      {selectedTerm && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-lg">
              Report Card — {terms.find((t: any) => t.id === selectedTerm)?.name} {terms.find((t: any) => t.id === selectedTerm)?.year}
            </h3>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors print:hidden"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden print:shadow-none print:border-none print:rounded-none" id="report-card">
            {/* School Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 print:bg-white print:text-black print:border-b-2 print:border-indigo-600">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center print:bg-indigo-100">
                    {/* <School className="w-10 h-10 text-indigo-900" /> */}
                    <img src={logo} alt="" />
                  </div>
                   <div>
                    <h1 className="text-2xl font-bold print:text-indigo-900">DAARUL LUGATUL AROBIYYAH</h1>
                    <p className="text-sm text-indigo-100 print:text-gray-600">COLLEGE OF ARABIC AND ISLAMIC STUDIES</p>
                    <p className="text-xs text-indigo-200 print:text-gray-500 mt-1">
                      Ago Molaba, Igboho, Oyo State • 09157272588, 08051889176, 07035706454 • daarullugatularobiyyah@gmail.com
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {/* <p className="text-xs text-indigo-200 print:text-gray-500">Academic Year</p>
                  <p className="text-lg font-bold print:text-indigo-900">2024/2025</p> */}
                </div>
              </div>
            </div>

            {/* Report Title */}
            <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 print:bg-gray-100">
              <h2 className="text-center text-xl font-bold text-indigo-900">
                STUDENT ACADEMIC REPORT
              </h2>
              <p className="text-center text-sm text-indigo-700 print:text-gray-700">
                {terms.find((t: any) => t.id === selectedTerm)?.name} — {terms.find((t: any) => t.id === selectedTerm)?.year}
              </p>
            </div>

            {/* Student Information */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Student Name</p>
                  <p className="font-semibold text-gray-900">{student.full_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Admission No.</p>
                  <p className="font-semibold text-gray-900">{student.admission_number}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Class</p>
                  <p className="font-semibold text-gray-900">
                    {termGrades.length > 0 && termGrades[0].classes?.name 
                      ? termGrades[0].classes.name 
                      : studentClass?.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Gender</p>
                  <p className="font-semibold text-gray-900">{student.gender}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Date of Birth</p>
                  <p className="font-semibold text-gray-900">{student.date_of_birth}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Parent/Guardian</p>
                  <p className="font-semibold text-gray-900">{student.parent_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Term</p>
                  <p className="font-semibold text-gray-900">{terms.find((t: any) => t.id === selectedTerm)?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Position in Class</p>
                  <p className="font-semibold text-gray-900">{position}</p>
                </div>
              </div>
            </div>

            {/* Grades Table */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Academic Performance</h3>
              {grades.filter((g: any) => g.term_id === selectedTerm).length === 0 ? (
                <p className="text-center text-gray-500 py-8">No grades available for this term</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Subject</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Score (%)</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Grade</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {grades.filter((g: any) => g.term_id === selectedTerm).map((grade: any) => {
                        return (
                          <tr key={grade.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{grade.subjects?.name}</td>
                            <td className="px-4 py-3 text-center font-semibold text-gray-900">{grade.score}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getGradeColor(grade.grade_letter)}`}>
                                {grade.grade_letter}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{grade.remark}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-indigo-50 border-t-2 border-indigo-200 font-semibold">
                        <td className="px-4 py-3 text-indigo-900">TOTAL</td>
                        <td className="px-4 py-3 text-center text-indigo-900">{totalScore}</td>
                        <td colSpan={2} className="px-4 py-3 text-right text-indigo-900">
                          Average: <span className="text-lg">{average}%</span> ({getGradeLetter(average)})
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Summary and Remarks */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 print:bg-white">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Performance Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Subjects:</span>
                      <span className="font-semibold">{grades.filter((g: any) => g.term_id === selectedTerm).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Score:</span>
                      <span className="font-semibold">{totalScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Score:</span>
                      <span className="font-semibold">{average}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overall Grade:</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getGradeColor(getGradeLetter(average))}`}>
                        {getGradeLetter(average)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Class Position:</span>
                      <span className="font-semibold">{position}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Grading Scale</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { grade: 'A', range: '80-100', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                      { grade: 'B', range: '70-79', bg: 'bg-blue-50', text: 'text-blue-700' },
                      { grade: 'C', range: '60-69', bg: 'bg-yellow-50', text: 'text-yellow-700' },
                      { grade: 'D', range: '50-59', bg: 'bg-orange-50', text: 'text-orange-700' },
                      { grade: 'E', range: '40-49', bg: 'bg-red-50', text: 'text-red-600' },
                      { grade: 'F', range: '0-39', bg: 'bg-red-100', text: 'text-red-700' },
                    ].map((g) => (
                      <div key={g.grade} className={`${g.bg} p-2 rounded text-center`}>
                        <div className={`font-bold ${g.text}`}>{g.grade}</div>
                        <div className="text-gray-600">{g.range}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Teacher's Remark */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Class Teacher's Remark</h4>
                <div className="bg-white p-4 rounded-lg border border-gray-200 min-h-[80px]">
                  <p className="text-gray-700 italic">
                    {average >= 70 
                      ? "Excellent performance! Keep up the great work and continue to strive for excellence."
                      : average >= 60
                      ? "Good performance. With more dedication and effort, you can achieve even better results."
                      : average >= 50
                      ? "Satisfactory performance. More focus and consistent study habits are needed to improve."
                      : "Below average performance. Requires immediate attention and additional support in weak areas."}
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="mt-8 grid grid-cols-2 gap-8 pt-6 border-t border-gray-300">
                <div>
                  <div className="border-b-2 border-gray-400 mb-2 h-12"></div>
                  <p className="text-sm text-gray-600 text-center">Class Teacher's Signature</p>
                </div>
                <div>
                  <div className="border-b-2 border-gray-400 mb-2 h-12"></div>
                  <p className="text-sm text-gray-600 text-center">Principal's Signature</p>
                </div>
              </div>

              {/* Footer */}
             <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>This is an official academic report from DAARUL LUGATUL AROBIYYAH</p>
                <p>Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className='mt-10'>Developed by Swift Media</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
