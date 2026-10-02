import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import grievanceService from '../../services/grievanceService';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import {
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  const citizenName = user?.name || 'Citizen';
  const citizenWard = user?.ward || 'Central Municipal Ward';
  const citizenEmail = user?.email || '';
  const citizenPhone = user?.phone || '';

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, listRes] = await Promise.all([
          grievanceService.getMyStats().catch(() => ({ data: { stats: {} } })),
          grievanceService.getMyGrievances({ limit: 5, sort: 'newest' }).catch(() => ({ data: { grievances: [] } })),
        ]);

        if (statsRes?.data?.stats) {
          setStats(statsRes.data.stats);
        }
        if (listRes?.data?.grievances) {
          setRecentGrievances(listRes.data.grievances);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
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
      year: 'numeric',
    });
  };

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
            {citizenPhone && (
              <span className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <Phone className="w-3.5 h-3.5 text-brand-600" />
                <span>{citizenPhone}</span>
              </span>
            )}
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
          value={loading ? '...' : String(stats.total ?? 0)}
          subtitle="All-time complaints"
          color="brand"
        />
        <StatCard
          icon={Clock}
          title="In Progress"
          value={loading ? '...' : String(stats.inProgress ?? 0)}
          subtitle="Assigned & in field"
          color="amber"
        />
        <StatCard
          icon={CheckCircle2}
          title="Resolved"
          value={loading ? '...' : String(stats.resolved ?? 0)}
          subtitle="Successfully redressed"
          color="emerald"
        />
        <StatCard
          icon={AlertTriangle}
          title="Pending Triage"
          value={loading ? '...' : String(stats.pending ?? 0)}
          subtitle="Submitted / Unresolved"
          color="rose"
        />
      </div>

      {/* Recent Grievances Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Grievance Activities
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest municipal complaints submitted through your account.
            </p>
          </div>
          {recentGrievances.length > 0 && (
            <Link
              to="/dashboard/citizen/grievances"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 inline-flex items-center gap-1"
            >
              <span>View All ({stats.total ?? recentGrievances.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" count={3} />
          </div>
        ) : recentGrievances.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Grievances Submitted Yet"
            description="You haven't lodged any municipal complaints yet. When you submit a civic concern with photos and location details, its real-time audit trail and field officer actions will appear here."
            actionLabel="Lodge Your First Grievance"
            onAction={() => navigate('/dashboard/citizen/lodge')}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Issue Title & Category</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Lodged Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentGrievances.map((g) => (
                  <tr
                    key={g._id}
                    onClick={() => navigate(`/dashboard/citizen/grievances/${g._id}`)}
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
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: g.department?.color || '#0284c7' }}
                        />
                        <span>{g.department?.name || 'Municipal'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={g.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={g.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono">
                      {formatDate(g.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                        View
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

export default CitizenDashboard;
