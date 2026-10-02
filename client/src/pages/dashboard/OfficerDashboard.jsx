import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import officerService from '../../services/officerService';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import SlaBadge from '../../components/ui/SlaBadge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building,
  UserCheck,
  ArrowRight,
  TrendingUp,
  MapPin,
  Flame,
  ShieldCheck,
} from 'lucide-react';

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  const officerName = user?.name || 'Municipal Officer';
  const officerDesignation = user?.designation || 'Field Executive Engineer';
  const departmentName = user?.department?.name || 'Roads & Infrastructure';
  const departmentCode = user?.department?.code || 'ROADS';
  const officerWard = user?.ward || 'Ward 2 - North';

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, listRes] = await Promise.all([
          officerService.getOfficerStats().catch(() => ({ data: { stats: {} } })),
          officerService
            .getOfficerGrievances({ scope: 'department', limit: 6, sort: 'newest' })
            .catch(() => ({ data: { grievances: [] } })),
        ]);

        if (statsRes?.data?.stats) {
          setStats(statsRes.data.stats);
        }
        if (listRes?.data?.grievances) {
          setRecentGrievances(listRes.data.grievances);
        }
      } catch (err) {
        console.error('Failed to load officer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Officer Workbench — ${officerName}`}
        subtitle={`${officerDesignation} • ${departmentName} (${departmentCode}) • Jurisdiction: ${officerWard}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/dashboard/officer/stats">
              <Button variant="outline" size="sm" leftIcon={<TrendingUp className="w-4 h-4" />}>
                Department Analytics
              </Button>
            </Link>
            <Link to="/dashboard/officer/assigned">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Assigned Grievances
              </Button>
            </Link>
          </div>
        }
      />

      {/* Officer Department Profile Banner */}
      <Card className="p-5 border-l-4 border-l-amber-600 bg-gradient-to-r from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={officerName} size="lg" status="online" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {officerName}
                </h2>
                <Badge variant="amber" size="sm">
                  {departmentCode} Nodal Officer
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {officerDesignation} &bull; {user?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <Building className="w-3.5 h-3.5 text-amber-600" />
              <span>{departmentName}</span>
            </span>
            <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{officerWard}</span>
            </span>
          </div>
        </div>
      </Card>

      {/* Core StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={UserCheck}
          title="Assigned to Me"
          value={loading ? '...' : String(stats?.assignedToMe ?? 0)}
          subtitle="My active queue"
          color="brand"
        />
        <StatCard
          icon={Clock}
          title="In Progress"
          value={loading ? '...' : String(stats?.inProgress ?? 0)}
          subtitle="Field squads deployed"
          color="amber"
        />
        <StatCard
          icon={AlertTriangle}
          title="Overdue SLA"
          value={loading ? '...' : String(stats?.overdue ?? 0)}
          subtitle="Breached target resolution"
          color="rose"
        />
        <StatCard
          icon={CheckCircle2}
          title="Resolved (7 Days)"
          value={loading ? '...' : String(stats?.resolvedThisWeek ?? 0)}
          subtitle="Redressed this week"
          color="emerald"
        />
      </div>

      {/* Needs Attention & Priority Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Urgent / Critical Needs Attention (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Needs Immediate Attention
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              High Severity &amp; Approaching Breach
            </span>
          </div>

          {loading ? (
            <Skeleton className="h-44 w-full" />
          ) : !stats?.needsAttention || stats.needsAttention.length === 0 ? (
            <Card className="p-6 text-center text-xs text-slate-400">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>No overdue or critical grievances currently pending in this queue. Great job!</span>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {stats.needsAttention.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/dashboard/officer/workbench/${item._id}`)}
                  className="p-3.5 rounded-xl border border-rose-200/80 dark:border-rose-950/60 bg-white dark:bg-slate-900 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 cursor-pointer transition-all shadow-subtle flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                        {item.trackingId}
                      </span>
                      <PriorityBadge priority={item.priority} size="sm" />
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate mt-1.5" title={item.title}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.location?.ward} &bull; {item.category}
                    </p>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <SlaBadge dueAt={item.sla?.dueAt} status={item.status} />
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                      Act
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Department Priority & Status Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Queue Severity Distribution
            </h3>

            {loading ? (
              <Skeleton className="h-36 w-full" />
            ) : (
              <div className="space-y-3 text-xs">
                {[
                  { label: 'Critical Severity', key: 'Critical', color: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
                  { label: 'High Priority', key: 'High', color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
                  { label: 'Medium Priority', key: 'Medium', color: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
                  { label: 'Low Priority', key: 'Low', color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
                ].map(({ label, key, color, text }) => {
                  const count = stats?.byPriority?.[key] || 0;
                  const total = stats?.totalDepartment || 1;
                  const pct = Math.round((count / total) * 100);

                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
                        <span className={`font-bold font-mono ${text}`}>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">
                  Avg Redressal Speed
                </span>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {stats?.averageResolutionHours ?? 32} Hours
                </p>
              </div>
              <Link to="/dashboard/officer/stats">
                <Button variant="outline" size="sm">
                  View Full Analytics
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Department Activity Table */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Department Activity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest complaints routed to {departmentName}.
            </p>
          </div>
          <Link
            to="/dashboard/officer/assigned"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 inline-flex items-center gap-1"
          >
            <span>View Full Roster ({stats?.totalDepartment ?? recentGrievances.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <Skeleton className="h-32 w-full" count={2} />
        ) : recentGrievances.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Grievances Found"
            description="There are currently no grievances recorded in this department."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Issue Title & Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Clock</th>
                  <th className="py-3 px-4">Assigned Officer</th>
                  <th className="py-3 px-4 text-right">Workbench</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentGrievances.map((g) => (
                  <tr
                    key={g._id}
                    onClick={() => navigate(`/dashboard/officer/workbench/${g._id}`)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                      {g.trackingId}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-white truncate" title={g.title}>
                        {g.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{g.category}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={g.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={g.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SlaBadge dueAt={g.sla?.dueAt} status={g.status} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {g.assignedOfficer?.name || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
