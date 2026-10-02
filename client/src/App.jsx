import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

// Route Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';
import DashboardRedirect from './components/auth/DashboardRedirect';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import Track from './pages/Track';
import Login from './pages/Login';
import Register from './pages/Register';

// Common Authenticated Pages
import Profile from './pages/Profile';

// Dashboard Views - Citizen
import CitizenDashboard from './pages/dashboard/CitizenDashboard';
import {
  CitizenLodge,
  CitizenGrievances,
  CitizenTrack,
  CitizenNotifications,
} from './pages/dashboard/CitizenPages';

// Dashboard Views - Officer
import {
  OfficerDashboard,
  OfficerAssigned,
  OfficerStats,
  OfficerNotifications,
} from './pages/dashboard/OfficerPages';

// Dashboard Views - Admin
import {
  AdminDashboard,
  AdminGrievances,
  AdminAnalytics,
  AdminMap,
  AdminDepartments,
  AdminUsers,
} from './pages/dashboard/AdminPages';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Layout Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Landing />} />
                <Route path="track" element={<Track />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  {/* Smart Redirect to active user's role */}
                  <Route index element={<DashboardRedirect />} />

                  {/* Common Profile Page for all authenticated roles */}
                  <Route path="profile" element={<Profile />} />

                  {/* Citizen Routes (Citizen & Admin access) */}
                  <Route element={<RoleRoute allowedRoles={['citizen', 'admin']} />}>
                    <Route path="citizen" element={<CitizenDashboard />} />
                    <Route path="citizen/lodge" element={<CitizenLodge />} />
                    <Route path="citizen/grievances" element={<CitizenGrievances />} />
                    <Route path="citizen/track" element={<CitizenTrack />} />
                    <Route path="citizen/notifications" element={<CitizenNotifications />} />
                  </Route>

                  {/* Officer Routes (Officer & Admin access) */}
                  <Route element={<RoleRoute allowedRoles={['officer', 'admin']} />}>
                    <Route path="officer" element={<OfficerDashboard />} />
                    <Route path="officer/assigned" element={<OfficerAssigned />} />
                    <Route path="officer/stats" element={<OfficerStats />} />
                    <Route path="officer/notifications" element={<OfficerNotifications />} />
                  </Route>

                  {/* Admin Console Routes (Admin strictly) */}
                  <Route element={<RoleRoute allowedRoles={['admin']} />}>
                    <Route path="admin" element={<AdminDashboard />} />
                    <Route path="admin/grievances" element={<AdminGrievances />} />
                    <Route path="admin/analytics" element={<AdminAnalytics />} />
                    <Route path="admin/map" element={<AdminMap />} />
                    <Route path="admin/departments" element={<AdminDepartments />} />
                    <Route path="admin/users" element={<AdminUsers />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
