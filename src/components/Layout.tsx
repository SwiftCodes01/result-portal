import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronDown,
  School,
  Settings,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import logo from "../assets/Darullogo.png"
interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({
  children,
  currentPage,
  onNavigate,
}: LayoutProps) {
  const { profile, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = profile ? { role: profile.role, name: profile.full_name } : null;

  const navigation = {
    student: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "reports", label: "Report Cards", icon: ClipboardList },
    ],
    teacher: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "upload-grades", label: "Upload Grades", icon: BookOpen },
      { id: "my-students", label: "My Students", icon: Users },
    ],
    admin: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "students", label: "Students", icon: Users },
      { id: "teachers", label: "Teachers", icon: GraduationCap },
      { id: "classes", label: "Classes", icon: School },
      { id: "subjects", label: "Subjects", icon: BookOpen },
      { id: "terms", label: "Terms", icon: Calendar },
      { id: "approve-grades", label: "Approve Grades", icon: CheckCircle },
      { id: "promote", label: "Promote Students", icon: TrendingUp },
      { id: "all-reports", label: "All Reports", icon: ClipboardList },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  };

  const navItems = navigation[user?.role || "student"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-indigo-900 to-indigo-950 text-white transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-800">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            {/* <School className="w-6 h-6 text-indigo-900" /> */}
            <img src={logo} alt="" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">
              DAARUL LUGATUL AROBIYYAH
            </h1>
            <p className="text-indigo-300 text-xs">School Portal</p>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/15 text-white shadow-lg shadow-indigo-900/20"
                    : "text-indigo-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-800">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-indigo-900 font-bold text-sm">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-indigo-300 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-indigo-200 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <div>
                <h2 className="font-semibold text-gray-900 capitalize">
                  {currentPage.replace(/-/g, " ")}
                </h2>
                {/* <p className="text-xs text-gray-500">Academic Year 2024/2025</p> */}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full">
                <ChevronDown className="w-3 h-3 text-indigo-600" />
                {/* <span className="text-xs font-medium text-indigo-700">
                  Third Term 2025
                </span> */}
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
