import { useState } from 'react';
import { saveSupabaseConfig, resetSupabaseClient } from '../lib/supabase';
import { School, Database, Key, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SetupPageProps {
  onComplete: () => void;
}

export default function SetupPage({ onComplete }: SetupPageProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSave = async () => {
    if (!url || !anonKey) {
      setError('Please fill in both fields');
      return;
    }

    if (!url.startsWith('https://')) {
      setError('URL must start with https://');
      return;
    }

    setError('');
    setLoading(true);

    try {
      saveSupabaseConfig({ url, anonKey });
      resetSupabaseClient();

      // Test connection
      const { getSupabase } = await import('../lib/supabase');
      const supabase = getSupabase();

      if (!supabase) {
        throw new Error('Failed to initialize Supabase client');
      }

      // Try a simple query to verify connection
      const { error: testError } = await supabase.from('profiles').select('id').limit(1);

      if (testError && testError.code !== 'PGRST116' && testError.code !== '42P01') {
        // PGRST116 = not found, 42P01 = table doesn't exist (which is OK for first setup)
        throw new Error(`Connection failed: ${testError.message}`);
      }

      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Supabase');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center">
                <School className="w-8 h-8 text-indigo-900" />
              </div>
             <div>
                <h1 className="text-2xl font-bold">DAARUL LUGATUL AROBIYYAH</h1>
                <p className="text-indigo-200">Database Setup</p>
              </div>
            </div>
            <p className="text-indigo-100">
              Connect your Supabase database to get started with the school portal.
            </p>
          </div>

          {/* Steps */}
          <div className="p-8">
            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-12 h-1 mx-2 rounded ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Step 1: Create a Supabase Project</h2>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-2">What is Supabase?</h3>
                      <p className="text-sm text-blue-800 mb-3">
                        Supabase is an open-source Firebase alternative that provides a PostgreSQL database,
                        authentication, and real-time subscriptions. It's free to start!
                      </p>
                      <a
                        href="https://supabase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Create Free Account
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Instructions:</h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="font-bold text-indigo-600">1.</span>
                      Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">supabase.com</a> and sign up (or log in)
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-indigo-600">2.</span>
                      Click "New Project" and fill in the details
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-indigo-600">3.</span>
                      Choose a strong database password (save it somewhere safe!)
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-indigo-600">4.</span>
                      Wait for your project to be created (takes ~2 minutes)
                    </li>
                  </ol>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                >
                  I've Created My Project →
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Step 2: Run the Database Schema</h2>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 mb-2">Important!</h3>
                      <p className="text-sm text-amber-800 mb-3">
                        You need to run the SQL schema to create the database tables. This only takes a minute.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Instructions:</h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="font-bold text-indigo-600">1.</span>
                      In your Supabase dashboard, go to <strong>SQL Editor</strong> (left sidebar)
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-indigo-600">2.</span>
                      Click <strong>"New Query"</strong>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-indigo-600">3.</span>
                      Download and open the schema file below
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-indigo-600">4.</span>
                      Copy the entire contents and paste into the SQL Editor
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-indigo-600">5.</span>
                      Click <strong>"Run"</strong> or press <strong>Ctrl+Enter</strong>
                    </li>
                  </ol>
                </div>

                <a
                  href="/schema.sql"
                  download
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                >
                  <Database className="w-5 h-5" />
                  Download schema.sql
                </a>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                  >
                    I've Run the Schema →
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Step 3: Connect Your Database</h2>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Find your credentials:</h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="font-bold text-indigo-600">1.</span>
                      In Supabase, go to <strong>Settings</strong> → <strong>API</strong>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-indigo-600">2.</span>
                      Copy the <strong>Project URL</strong> and <strong>anon/public key</strong>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-indigo-600">3.</span>
                      Paste them below
                    </li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Key className="w-4 h-4 inline mr-1" />
                      Project URL
                    </label>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://your-project.supabase.co"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Key className="w-4 h-4 inline mr-1" />
                      Anon/Public Key
                    </label>
                    <input
                      type="text"
                      value={anonKey}
                      onChange={(e) => setAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium transition-colors"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Connect Database
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Check the{' '}
          <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">
            Supabase documentation
          </a>
        </p>
      </motion.div>
    </div>
  );
}
