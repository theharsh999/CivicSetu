import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import officerService from '../../services/officerService';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Building,
  BarChart3,
  Calendar,
} from 'lucide-react';

const STATUS_COLORS = {
  Submitted: '#94a3b8',
  'AI Classified': '#818cf8',
  Assigned: '#38bdf8',
  'In Progress': '#fbbf24',
  'Awaiting Verification': '#c084fc',
  Resolved: '#34d399',
  Closed: '#71717a',
  Escalated: '#f43f5e',
};

const PRIORITY_COLORS = {
  Low: '#10b981',
  Medium: '#3b82f6',
  High: '#f59e0b',
  Critical: '#ef4444',
};

export const OfficerStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const departmentName = user?.department?.name || 'Department Analytics';
  const departmentCode = user?.department?.code || 'ROADS';

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await officerService.getOfficerStats();
        setStats(response.data.stats);
      } catch (err) {
        console.error('Failed to load department stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full" count={4} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  // Format status data for PieChart
  const statusChartData = stats?.byStatus
    ? Object.entries(stats.byStatus)
        .map(([status, count]) => ({ name: status, value: count }))
        .filter((d) => d.value > 0)
    : [];

  // Format priority data for BarChart
  const priorityChartData = stats?.byPriority
    ? Object.entries(stats.byPriority).map(([priority, count]) => ({
        priority,
        count,
      }))
    : [];

  // Format officer workload data
  const officerWorkloadData = stats?.officerWorkload
    ? stats.officerWorkload.map((off) => ({
        name: off.name.split(' ')[0] + ' ' + (off.name.split(' ')[1]?.[0] || ''),
        active: off.activeCount,
        resolved: off.resolvedCount,
      }))
    : [];

  // Trend data
  const trendData = stats?.trend30Days || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Department Performance & SLA Analytics`}
        subtitle={`${departmentName} (${departmentCode}) • Real-time redressal telemetry and resolution velocity.`}
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building}
          title="Total Workload"
          value={String(stats?.totalDepartment ?? 0)}
          subtitle="All grievances logged"
          color="brand"
        />
        <StatCard
          icon={Clock}
          title="Avg Redressal Speed"
          value={`${stats?.averageResolutionHours ?? 32}h`}
          subtitle="From lodge to closure"
          color="blue"
        />
        <StatCard
          icon={AlertTriangle}
          title="Overdue / SLA Alert"
          value={String(stats?.overdue ?? 0)}
          subtitle="Exceeded target window"
          color="rose"
        />
        <StatCard
          icon={CheckCircle2}
          title="Resolved (7 Days)"
          value={String(stats?.resolvedThisWeek ?? 0)}
          subtitle="Success this week"
          color="emerald"
        />
      </div>

      {/* Charts Grid Row 1: Intake Trend & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 30-Day Intake & Resolution Trend (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>30-Day Grievance Flow & Resolution Trend</span>
              </CardTitle>
              <span className="text-[11px] text-slate-400">Intake vs Resolved</span>
            </CardHeader>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorLodged" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area
                    type="monotone"
                    dataKey="lodged"
                    name="Complaints Lodged"
                    stroke="#0284c7"
                    fillOpacity={1}
                    fill="url(#colorLodged)"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    name="Issues Resolved"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorResolved)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Status Distribution Donut Chart (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-600" />
                <span>Lifecycle Status Distribution</span>
              </CardTitle>
            </CardHeader>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} tickets`, name]}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Charts Grid Row 2: Priority Breakdown & Officer Workload Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Priority Severity Breakdown (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm">Priority Breakdown</CardTitle>
            </CardHeader>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Tickets" radius={[4, 4, 0, 0]}>
                    {priorityChartData.map((entry) => (
                      <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Officer Workload Comparison (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" />
                <span>Nodal Officer Workload & Redressed Ratio</span>
              </CardTitle>
              <span className="text-[11px] text-slate-400">Within {departmentCode}</span>
            </CardHeader>

            <div className="h-60 w-full">
              {officerWorkloadData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No officer comparative data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={officerWorkloadData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="active" name="Active Open" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OfficerStats;
