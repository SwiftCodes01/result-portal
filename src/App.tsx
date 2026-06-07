import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isConfigured } from './lib/supabase';
import SetupPage from './pages/SetupPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [configured, setConfigured] = useState(isConfigured());

  useEffect(() => {
    setCurrentPage('dashboard');
  }, [user?.id]);

  // Show setup page if Supabase is not configured
  if (!configured) {
    return <SetupPage onComplete={() => setConfigured(true)} />;
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user || !profile) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (profile.role) {
      case 'student':
        return <StudentDashboard currentPage={currentPage} />;
      case 'teacher':
        return <TeacherDashboard currentPage={currentPage} />;
      case 'admin':
        return <AdminDashboard currentPage={currentPage} />;
      default:
        return null;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
