import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, CheckSquare, BarChart3, Bell, CheckCircle2, Clock, AlertTriangle, Building, MapPin, HardHat, Mail, Phone } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PlaceholderView from './PlaceholderView';

export const OfficerDashboard = () => {
  const { user } = useAuth();

  const officerName = user?.name || 'Er. Rajesh Verma';
  const officerDesignation = user?.designation || 'Executive Engineer';
  const officerDept = user?.department?.name || 'Roads & Infrastructure';
  const deptCode = user?.department?.code || 'ROADS';
  const officerWard = user?.ward || 'Ward 2 - North';
  const officerEmail = user?.email || 'roads.officer1@civicsetu.gov.in';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Officer Resolution Desk — ${officerName}`}
        subtitle={`${officerDept} (${deptCode}) • ${officerDesignation}`}
        badge={<Badge variant="warning">{deptCode}</Badge>}
        actions={
          <Link to="/dashboard/officer/assigned">
            <Button variant="primary" size="sm" leftIcon={<CheckSquare className="w-4 h-4" />}>
              View Work Queue
            </Button>
          </Link>
        }
      />

      {/* Officer Department Credentials Card */}
      <Card className="p-5 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={officerName} size="lg" status="online" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {officerName}
                </h2>
                <Badge variant="warning" size="sm">
                  {deptCode} Officer
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {officerDesignation} &bull; {officerEmail}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <Building className="w-3.5 h-3.5 text-amber-600" />
              <span>{officerDept}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{officerWard}</span>
            </span>
            <Link to="/dashboard/profile">
              <Button variant="outline" size="sm">
                Account Settings
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckSquare}
          title="Assigned to Me"
          value="5"
          subtitle="Pending site action"
          color="brand"
        />
        <StatCard
          icon={Clock}
          title="Near SLA Breach"
          value="1"
          subtitle="< 6 hrs remaining"
          color="amber"
        />
        <StatCard
          icon={CheckCircle2}
          title="Resolved This Week"
          value="18"
          subtitle="Verification approved"
          color="emerald"
        />
        <StatCard
          icon={AlertTriangle}
          title="Escalated Tasks"
          value="0"
          subtitle="Breached targets"
          color="rose"
        />
      </div>

      <EmptyState
        icon={CheckSquare}
        title="Assigned Grievances Queue"
        description="Field complaints assigned by automated routing or department supervisors will display here with triage priority."
        actionLabel="Inspect Assigned Grievances"
        onAction={() => window.location.href = '/dashboard/officer/assigned'}
      />
    </div>
  );
};

export const OfficerAssigned = () => (
  <PlaceholderView
    title="Assigned Grievances"
    subtitle="Actionable municipal tasks requiring field inspection, work execution, and proof uploads."
    icon={CheckSquare}
    emptyTitle="No Pending Field Inspections"
    emptyDesc="All assigned complaints for your beat/ward are currently up-to-date within SLA bounds."
  />
);

export const OfficerStats = () => (
  <PlaceholderView
    title="Department Redressal Statistics"
    subtitle="Individual and ward-level resolution velocity, response times, and citizen satisfaction ratings."
    icon={BarChart3}
    emptyTitle="Telemetry Aggregating"
    emptyDesc="Resolution velocity analytics and SLA compliance distributions will populate with live grievance data."
  />
);

export const OfficerNotifications = () => (
  <PlaceholderView
    title="Officer Priority Alerts"
    subtitle="Immediate notifications for critical high-priority tickets, citizen escalations, and ward broadcasts."
    icon={Bell}
    emptyTitle="All Clear"
    emptyDesc="No critical SLA breach warnings at this moment."
  />
);
