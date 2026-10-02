import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Building2,
  LayoutDashboard,
  PlusCircle,
  FileText,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CheckSquare,
  BarChart3,
  MapPin,
  FolderTree,
  Users,
  LogOut,
  Shield,
  UserCheck,
  User,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';

export const ROLE_NAV_CONFIG = {
  citizen: {
    title: 'Citizen Portal',
    badgeVariant: 'primary',
    items: [
      { label: 'Dashboard', path: '/dashboard/citizen', icon: LayoutDashboard },
      { label: 'Lodge Grievance', path: '/dashboard/citizen/lodge', icon: PlusCircle },
      { label: 'My Grievances', path: '/dashboard/citizen/grievances', icon: FileText },
      { label: 'Track', path: '/dashboard/citizen/track', icon: Search },
      { label: 'Notifications', path: '/dashboard/citizen/notifications', icon: Bell, badge: '2' },
    ]
  },
  officer: {
    title: 'Officer Desk',
    badgeVariant: 'warning',
    items: [
      { label: 'Dashboard', path: '/dashboard/officer', icon: LayoutDashboard },
      { label: 'Assigned Grievances', path: '/dashboard/officer/assigned', icon: CheckSquare, badge: '5' },
      { label: 'Department Stats', path: '/dashboard/officer/stats', icon: BarChart3 },
      { label: 'Notifications', path: '/dashboard/officer/notifications', icon: Bell },
    ]
  },
  admin: {
    title: 'Admin Console',
    badgeVariant: 'purple',
    items: [
      { label: 'Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
      { label: 'All Grievances', path: '/dashboard/admin/grievances', icon: FileText },
      { label: 'Analytics', path: '/dashboard/admin/analytics', icon: BarChart3 },
      { label: 'Map View', path: '/dashboard/admin/map', icon: MapPin },
      { label: 'Departments', path: '/dashboard/admin/departments', icon: FolderTree },
      { label: 'Users', path: '/dashboard/admin/users', icon: Users },
    ]
  }
};

export const DashboardLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Derive active role from URL path or user role
  let currentRole = user?.role || 'citizen';
  if (location.pathname.includes('/dashboard/officer')) {
    currentRole = 'officer';
  } else if (location.pathname.includes('/dashboard/admin')) {
    currentRole = 'admin';
  } else if (location.pathname.includes('/dashboard/citizen')) {
    currentRole = 'citizen';
  }

  const roleConfig = ROLE_NAV_CONFIG[currentRole] || ROLE_NAV_CONFIG.citizen;

  // Active user data (fallback to realistic demo if directly browsing)
  const currentUser = user || {
    name: currentRole === 'admin' ? 'Dr. Neha Patel' : currentRole === 'officer' ? 'Er. Rajesh Verma' : 'Aarav Sharma',
    email: currentRole === 'admin' ? 'admin@civicsetu.gov.in' : currentRole === 'officer' ? 'roads.officer1@civicsetu.gov.in' : 'citizen1@example.com',
    role: currentRole,
    designation: currentRole === 'officer' ? 'Municipal Officer (PWD)' : currentRole === 'admin' ? 'Municipal Commissioner' : 'Citizen',
  };

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out of CivicSetu.', 'Logged Out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 lg:static ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-brand-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base text-slate-900 dark:text-white truncate font-display">
                  Civic<span className="text-brand-600 dark:text-brand-400">Setu</span>
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {roleConfig.title}
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prototype Role Switcher Badge */}
        {!sidebarCollapsed && (
          <div className="p-3 mx-3 my-3 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Active Portal
              </span>
              <Badge variant={roleConfig.badgeVariant} size="sm">
                {currentRole}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1">
              <button
                type="button"
                onClick={() => navigate('/dashboard/citizen')}
                className={`py-1 text-[11px] rounded font-medium transition-colors ${
                  currentRole === 'citizen'
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/officer')}
                className={`py-1 text-[11px] rounded font-medium transition-colors ${
                  currentRole === 'officer'
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Officer
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/admin')}
                className={`py-1 text-[11px] rounded font-medium transition-colors ${
                  currentRole === 'admin'
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        )}

        {/* Sidebar Nav Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {roleConfig.items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileDrawerOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                />
                {!sidebarCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!sidebarCollapsed && item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer with Collapse Toggle */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 py-1.5 px-2 rounded-lg"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Public Portal</span>}
          </Link>

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 glass-nav sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
          {/* Left section: mobile hamburger & breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Portal</span>
              <span>/</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {currentRole}
              </span>
            </div>
          </div>

          {/* Right section: theme toggle, notification bell PLACEHOLDER, user menu PLACEHOLDER */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notification Bell PLACEHOLDER */}
            <div className="relative">
              <button
                type="button"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                title="Notifications (Placeholder - wired in Prompt 2)"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              </button>
            </div>

            {/* User Menu PLACEHOLDER */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-expanded={userMenuOpen}
              >
                <Avatar name={currentUser.name} size="sm" status="online" />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {currentRole}
                  </span>
                </div>
              </button>

              {/* User Dropdown Menu PLACEHOLDER */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-slide-up"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.email}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <Badge variant="primary" size="sm">
                        {currentUser.role}
                      </Badge>
                      {currentUser.department && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
                          {currentUser.department.code || currentUser.department.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Profile & Settings</span>
                    </Link>
                  </div>

                  <div className="py-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="px-3 py-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Switch Role View (Prototype):
                    </div>
                    <button
                      onClick={() => navigate('/dashboard/citizen')}
                      className="w-full text-left px-4 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Citizen Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/dashboard/officer')}
                      className="w-full text-left px-4 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Officer Resolution Desk
                    </button>
                    <button
                      onClick={() => navigate('/dashboard/admin')}
                      className="w-full text-left px-4 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Admin Analytics Console
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
