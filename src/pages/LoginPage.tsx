import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { resetPassword } from '../lib/database';
import { School, Eye, EyeOff, LogIn, AlertCircle, UserPlus, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from "../assets/Darullogo.png"
export default function LoginPage() {
  const { login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await signup(email, password, fullName, role);
    if (result.success) {
      setSuccess('Account created! Please check your email to verify, then log in.');
      setIsSignUp(false);
      setEmail('');
      setPassword('');
      setFullName('');
    } else {
      setError(result.error || 'Signup failed');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetEmail);
      setSuccess('Password reset link sent! Check your email.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="/images/school-hero.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-indigo-800/80 to-purple-900/90" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center">
                {/* <School className="w-8 h-8 text-indigo-900" /> */}
                <img src={logo} alt="" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">DAARUL LUGATUL AROBIYYAH</h1>
                <p className="text-indigo-200">School Management Portal</p>
              </div>
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              COLLEGE OF ARABIC AND <br />
              <span className="text-amber-400">ISLAMIC STUDIES</span>
            </h2>
            <p className="text-indigo-200 text-2xl leading-relaxed max-w-md">
              دار اللغة العربية للدراسات العربية والإسلامية
            </p>
            <p className="text-indigo-200 text-lg leading-relaxed max-w-md mt-30">
              Developed by Swift Media
            </p>
           
          </motion.div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
               <img src={logo} alt="" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DAARUL LUGATUL AROBIYYAH</h1>
              <p className="text-gray-500 text-sm">School Portal</p>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-gray-200 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !isSignUp ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isSignUp ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Account
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!isSignUp ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
                <p className="text-gray-500 mb-6">Sign in to access your portal</p>

                {error && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {success}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-200"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Sign In
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(true); setError(''); setSuccess(''); }}
                    className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Forgot your password?
                  </button>
                </form>
                          <p className=" w-full text-center text-sm leading-relaxed mt-10 font-medium">
              Developed by Swift Media
            </p>
              </motion.div>
            ) : showForgotPassword ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                <p className="text-gray-500 mb-6">Enter your email to receive a password reset link</p>

                {error && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {success}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-200"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Send Reset Link
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setError(''); setSuccess(''); }}
                    className="w-full text-center text-sm text-gray-600 hover:text-gray-700 font-medium"
                  >
                    ← Back to Sign In
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-500 mb-6">Register for the school portal</p>

                {error && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Min 6 characters"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-200"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Create Account
                      </>
                    )}
                  </button>
                </form>
                  <p className=" w-full text-center text-sm leading-relaxed mt-10 font-medium">
              Developed by Swift Media
            </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
