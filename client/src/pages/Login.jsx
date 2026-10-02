import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Bot,
  User,
  HardHat,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back, ${user.name}!`, 'Signed In');

      // Navigate to intended destination or role dashboard
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        navigate(`/dashboard/${user.role}`, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please verify credentials.';
      setErrorMessage(msg);
      toast.error(msg, 'Sign In Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        
        {/* Left Side: Brand & Feature Illustration Panel (Desktop) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-brand-700 via-brand-600 to-civic-teal-700 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Background Decorative Gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-civic-teal-400/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight font-display">
                  CivicSetu
                </span>
                <p className="text-[10px] text-brand-100 uppercase tracking-wider font-semibold">
                  Urban Grievance Redressal
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-3">
              One Unified Portal for Municipal Redressal
            </h2>
            <p className="text-xs text-brand-100 leading-relaxed mb-6">
              Connect directly with 9 urban departments. Track issues transparently with automated SLA escalation clocks.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-3.5 text-xs text-brand-50">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-brand-200" />
                </div>
                <span>Automated rule-based grievance categorization</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <span>Strict 24h to 168h department SLA targets</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <span>Verified field completion proofs & photo logs</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/15 mt-8">
            <div className="flex items-center gap-2 text-[11px] text-brand-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>PBL Prototype &bull; Sem 5 Municipal Redressal System</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form & Quick Demo Logins */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Sign In to Your Account
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your municipal credentials to access your dashboard
              </p>
            </div>

            {/* Inline Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 font-medium animate-fade-in flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. citizen1@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={isSubmitting}
              >
                Sign In
              </Button>
            </form>

            {/* Quick Demo Accounts Selection Panel */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  One-Click Demo Credentials
                </span>
                <span className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">
                  Instant Evaluator Testing
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Demo Citizen */}
                <button
                  type="button"
                  onClick={() => handleFillDemo('citizen1@example.com', 'Citizen@123')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 bg-slate-50/70 dark:bg-slate-800/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white mb-0.5">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      Citizen
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    citizen1@...
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Citizen@123</p>
                </button>

                {/* Demo Officer */}
                <button
                  type="button"
                  onClick={() => handleFillDemo('roads.officer1@civicsetu.gov.in', 'Officer@123')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 bg-slate-50/70 dark:bg-slate-800/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white mb-0.5">
                    <span className="flex items-center gap-1.5">
                      <HardHat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Officer (PWD)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    roads.officer1@...
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Officer@123</p>
                </button>

                {/* Demo Admin */}
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin@civicsetu.gov.in', 'Admin@123')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 bg-slate-50/70 dark:bg-slate-800/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white mb-0.5">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    admin@...
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Admin@123</p>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have a citizen account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Register as Citizen &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
