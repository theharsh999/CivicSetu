import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Building2,
  Sun,
  Moon,
  Menu,
  X,
  Search,
  PlusCircle,
  FileSearch,
  ShieldCheck,
  Heart,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const PublicLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Departments', path: '/#departments' },
    { label: 'Track Status', path: '/track' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Top Banner Notice for Prototype */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-civic-teal-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
        <span>CivicSetu PBL Prototype &bull; Automated Municipal Grievance Redressal Platform</span>
        <Link to="/dashboard/citizen" className="underline hover:text-brand-100 hidden sm:inline ml-2 text-[11px]">
          Explore Prototype Dashboards &rarr;
        </Link>
      </div>

      {/* Sticky Navbar */}
      <header className="sticky top-0 z-40 glass-nav transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-civic-teal-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white font-display">
                    Civic<span className="text-brand-600 dark:text-brand-400">Setu</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                    AI-Gov
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">
                  Municipal Redressal Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
                    location.pathname === item.path
                      ? 'text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Action Buttons & Theme Toggle */}
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Theme"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {isAuthenticated ? (
                <>
                  <Link to={`/dashboard/${user?.role || 'citizen'}`}>
                    <Button variant="primary" size="sm" leftIcon={<Building2 className="w-4 h-4" />}>
                      Dashboard ({user?.role})
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout();
                      toast.info('Signed out of CivicSetu', 'Session Closed');
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                      Lodge Issue
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger & Theme Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-3 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link to={`/dashboard/${user?.role || 'citizen'}`} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Go to Dashboard ({user?.role})
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      toast.info('Signed out of CivicSetu', 'Session Closed');
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Lodge Grievance
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-base text-slate-900 dark:text-white font-display">
                  CivicSetu
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                An intelligent municipal grievance resolution bridge connecting citizens with city departments through automated classification and SLA-bound tracking.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 text-[11px] font-medium">
                <span>Rule-Based AI Prototype v1.0</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Citizen Services
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/register" className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
                    Lodge New Grievance
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
                    Track Grievance Status
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
                    SLA Guidelines & Timelines
                  </a>
                </li>
                <li>
                  <a href="#departments" className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
                    Municipal Departments
                  </a>
                </li>
              </ul>
            </div>

            {/* Dashboards (Prototype Switcher) */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Prototype Portals
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/dashboard/citizen" className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 flex items-center gap-1">
                    Citizen Portal <span className="text-[10px] text-brand-600 dark:text-brand-400">&rarr;</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/officer" className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 flex items-center gap-1">
                    Officer Resolution Desk <span className="text-[10px] text-brand-600 dark:text-brand-400">&rarr;</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/admin" className="text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 flex items-center gap-1">
                    Municipal Admin Console <span className="text-[10px] text-brand-600 dark:text-brand-400">&rarr;</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Transparency / Academic Note */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                PBL Academic Notice
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Developed for Project-Based Learning (PBL) Semester 5. Built with MERN Stack + Tailwind CSS. Designed to demonstrate automated civic triage without complex enterprise overhead.
              </p>
              <div className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <span>Crafted with</span>
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                <span>for transparent urban governance</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} CivicSetu PBL Project. Open prototype for civic empowerment.</p>
            <p className="mt-2 sm:mt-0">Node v24 &bull; React 18 &bull; Express &bull; MongoDB</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
