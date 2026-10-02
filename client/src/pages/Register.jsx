import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import Button from '../components/ui/Button';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    ward: 'Ward 1 - Central',
    address: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const wards = [
    'Ward 1 - Central',
    'Ward 2 - North',
    'Ward 3 - East',
    'Ward 4 - South',
    'Ward 5 - West',
    'Ward 6 - Metro',
    'Ward 7 - Suburbs',
    'Ward 8 - Industrial',
    'Ward 9 - Heritage',
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await register(formData);
      toast.success(`Account created! Welcome, ${user.name}!`, 'Registration Complete');
      navigate('/dashboard/citizen', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setErrorMessage(msg);
      toast.error(msg, 'Registration Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        
        {/* Left Side: Illustration / Brand Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-civic-teal-700 via-brand-700 to-brand-800 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight font-display">
                  CivicSetu
                </span>
                <p className="text-[10px] text-teal-200 uppercase tracking-wider font-semibold">
                  Citizen Empowerment
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-3">
              Direct Redressal for Your Neighborhood
            </h2>
            <p className="text-xs text-teal-100 leading-relaxed mb-6">
              Create your citizen profile in seconds. Submit issues directly to ward engineers and verify when work is completed.
            </p>

            <div className="space-y-3.5 text-xs text-teal-50">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-teal-200" />
                </div>
                <span>One-click complaint logging with photos & GPS</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <span>Direct notification on officer dispatch & actions</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <span>Citizen verification required before ticket closure</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/15 mt-8">
            <div className="flex items-center gap-2 text-[11px] text-teal-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Official Citizen Portal &bull; CivicSetu Corporation</span>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Register Citizen Profile
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your details to lodge and track municipal complaints
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 font-medium animate-fade-in flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-10 pr-3.5 py-2 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="citizen@example.com"
                      className="w-full pl-10 pr-3.5 py-2 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98000 00000"
                      className="w-full pl-10 pr-3.5 py-2 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password <span className="text-rose-500">*</span> (min 6 characters)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a secure password"
                    className="w-full pl-10 pr-10 py-2 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Municipal Ward
                  </label>
                  <select
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {wards.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Street / Locality
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. 42 MG Road"
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-3"
                isLoading={isSubmitting}
              >
                Create Citizen Account
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Sign In here &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
