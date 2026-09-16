import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isLogin && !termsAccepted) {
      setError('You must accept the terms and conditions to sign up.');
      return;
    }

    setIsLoading(true);

    // Mock authentication flow
    setTimeout(() => {
      setIsLoading(false);
      
      if (isLogin) {
        // Mock Login: In a real app, this would verify against a backend.
        // For now, any email/password combo works as a mock if they have local storage set
        const users = JSON.parse(localStorage.getItem('timegig_users') || '[]');
        const userExists = users.some((u: any) => u.email === email && u.password === password);
        
        if (userExists) {
          localStorage.setItem('timegig_auth_token', 'mock-token-123');
          onLoginSuccess();
        } else {
          setError('Invalid email or password. Please try again or sign up.');
        }
      } else {
        // Mock Signup
        const users = JSON.parse(localStorage.getItem('timegig_users') || '[]');
        const userExists = users.some((u: any) => u.email === email);
        
        if (userExists) {
          setError('An account with this email already exists.');
        } else {
          users.push({ email, password });
          localStorage.setItem('timegig_users', JSON.stringify(users));
          localStorage.setItem('timegig_auth_token', 'mock-token-123');
          onLoginSuccess();
        }
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-100/50 to-transparent pointer-events-none"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 font-black text-2xl shadow-xl shadow-black/10">TG</div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          {isLogin ? 'Sign in to access your gigs and profile' : 'Join TimeGiG to find work and hire talent'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start pt-2">
                    <div className="flex h-5 items-center">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="ml-3 text-xs">
                      <label htmlFor="terms" className="text-slate-600">
                        I accept the <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Terms and Conditions</a> and <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Privacy Policy</a>.
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  'Please wait...'
                ) : (
                  <>
                    {isLogin ? 'Sign in' : 'Create account'}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
