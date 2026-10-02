import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { PlusCircle, FileText, CheckCircle2, Clock, AlertTriangle, MapPin, Mail, Phone, Calendar, UserCheck } from 'lucide-react';

export const CitizenDashboard = () => {
  const { user } = useAuth();

  const citizenName = user?.name || 'Aarav Sharma';
  const citizenWard = user?.ward || 'Ward 1 - Central';
  const citizenEmail = user?.email || 'citizen1@example.com';
  const citizenPhone = user?.phone || '+91 98111 00001';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Citizen Portal — Welcome, ${citizenName}`}
        subtitle={`Jurisdiction: ${citizenWard} • Account: Active Citizen Resident`}
        actions={
          <Link to="/dashboard/citizen/lodge">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Lodge New Grievance
            </Button>
          </Link>
        }
      />

      {/* Citizen Profile Banner */}
      <Card className="p-5 border-l-4 border-l-brand-600 bg-gradient-to-r from-brand-50/40 via-white to-white dark:from-brand-950/20 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={citizenName} size="lg" status="online" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {citizenName}
                </h2>
                <Badge variant="primary" size="sm">
                  Citizen
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                CivicSetu Citizen Member &bull; {citizenEmail}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>{citizenWard}</span>
            </span>
            <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <Phone className="w-3.5 h-3.5 text-brand-600" />
              <span>{citizenPhone}</span>
            </span>
            <Link to="/dashboard/profile">
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          title="Total Lodged"
          value="4"
          subtitle="All-time complaints"
          color="brand"
        />
        <StatCard
          icon={Clock}
          title="In Progress"
          value="2"
          subtitle="Active department tasks"
          color="amber"
        />
        <StatCard
          icon={CheckCircle2}
          title="Resolved"
          value="2"
          subtitle="Successfully redressed"
          color="emerald"
        />
        <StatCard
          icon={AlertTriangle}
          title="Escalated"
          value="0"
          subtitle="SLA breaches"
          color="rose"
        />
      </div>

      {/* Main Content Area */}
      <EmptyState
        icon={FileText}
        title="Recent Grievance Activities"
        description="Your recent grievance history will appear here once you lodge complaints with photos and location details."
        actionLabel="Lodge a Grievance Now"
        onAction={() => window.location.href = '/dashboard/citizen/lodge'}
      />
    </div>
  );
};

export default CitizenDashboard;
