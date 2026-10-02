import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileText, BarChart3, MapPin, FolderTree, Users, Activity, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Mail, Building } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PlaceholderView from './PlaceholderView';

export const AdminDashboard = () => {
  const { user } = useAuth();

  const adminName = user?.name || 'Dr. Neha Patel';
  const adminDesignation = user?.designation || 'Municipal Commissioner & CEO';
  const adminEmail = user?.email || 'admin@civicsetu.gov.in';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Municipal Commissioner Console — ${adminName}`}
        subtitle={`${adminDesignation} • Citywide Executive Control`}
        badge={<Badge variant="purple">ADMIN</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/dashboard/admin/grievances">
              <Button variant="primary" size="sm" leftIcon={<FileText className="w-4 h-4" />}>
                All Grievances
              </Button>
            </Link>
            <Link to="/dashboard/admin/analytics">
              <Button variant="outline" size="sm" leftIcon={<BarChart3 className="w-4 h-4" />}>
                Analytics
              </Button>
            </Link>
          </div>
        }
      />

      {/* Admin Privilege Banner */}
      <Card className="p-5 border-l-4 border-l-purple-600 bg-gradient-to-r from-purple-50/40 via-white to-white dark:from-purple-950/20 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={adminName} size="lg" status="online" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {adminName}
                </h2>
                <Badge variant="purple" size="sm">
                  Commissioner Level
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {adminDesignation} &bull; {adminEmail}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <Building className="w-3.5 h-3.5 text-purple-600" />
              <span>9 Municipal Departments Active</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Full System Clearance</span>
            </span>
            <Link to="/dashboard/profile">
              <Button variant="outline" size="sm">
                Admin Settings
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          title="Total Complaints"
          value="1,428"
          subtitle="Current month volume"
          color="brand"
          trend={{ direction: 'up', value: '+8.4%', label: 'vs last month' }}
        />
        <StatCard
          icon={Clock}
          title="Avg Redressal Time"
          value="31.2h"
          subtitle="Citywide benchmark"
          color="amber"
          trend={{ direction: 'down', value: '-4.2h', label: 'faster response' }}
        />
        <StatCard
          icon={CheckCircle2}
          title="Resolution Rate"
          value="94.1%"
          subtitle="Completed within SLA"
          color="emerald"
          trend={{ direction: 'up', value: '+2.1%', label: 'improvement' }}
        />
        <StatCard
          icon={AlertTriangle}
          title="Active Escalations"
          value="7"
          subtitle="Requires commissioner review"
          color="rose"
        />
      </div>

      <EmptyState
        icon={Activity}
        title="Municipal Command & Control"
        description="Citywide department heatmap, live grievance triage stream, and officer load distribution will be activated in upcoming modules."
        actionLabel="Inspect All Grievances"
        onAction={() => window.location.href = '/dashboard/admin/grievances'}
      />
    </div>
  );
};

export const AdminGrievances = () => (
  <PlaceholderView
    title="All Municipal Grievances"
    subtitle="Global triage database with advanced filters by department, status, priority, and ward."
    icon={FileText}
    emptyTitle="Global Registry Ready"
    emptyDesc="Search, bulk re-assign, escalate, and export civic records across all municipal departments."
  />
);

export const AdminAnalytics = () => (
  <PlaceholderView
    title="City Redressal Analytics"
    subtitle="Statistical trends, category breakdowns, department SLA adherence, and citizen satisfaction."
    icon={BarChart3}
    emptyTitle="Recharts Visualizations"
    emptyDesc="High-density charts, category pie distributions, and monthly grievance flow timelines."
  />
);

export const AdminMap = () => (
  <PlaceholderView
    title="GIS Hotspot Map View"
    subtitle="Geographical clustering of complaints across city wards using Leaflet mapping."
    icon={MapPin}
    emptyTitle="Interactive GIS Map Engine"
    emptyDesc="Ward-boundary layers, heatmap density clusters, and marker popups showing live civic incidents."
  />
);

export const AdminDepartments = () => (
  <PlaceholderView
    title="Department Management"
    subtitle="Configure the 9 municipal departments, categories, SLA parameters, and nodal officers."
    icon={FolderTree}
    emptyTitle="Municipal Departments Config"
    emptyDesc="View department directory, adjust response deadlines, and manage routing rules."
  />
);

export const AdminUsers = () => (
  <PlaceholderView
    title="User & Officer Directory"
    subtitle="Role-based access management for citizens, department nodal officers, and supervisors."
    icon={Users}
    emptyTitle="Staff & Citizen Registry"
    emptyDesc="Manage user accounts, assign officer wards, and view citizen activity profiles."
  />
);
