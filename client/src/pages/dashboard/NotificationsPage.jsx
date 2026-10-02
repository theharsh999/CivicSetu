import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  RefreshCw,
  Star,
  Info,
  Filter,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import notificationService from '../../services/notificationService';
import { formatRelativeTime, formatDateTime } from '../../utils/dateUtils';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';

const TYPE_CONFIG = {
  status_update: {
    icon: RefreshCw,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
    label: 'Status Update',
  },
  resolution: {
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    label: 'Resolved',
  },
  assignment: {
    icon: UserCheck,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    label: 'Assignment',
  },
  escalation: {
    icon: AlertTriangle,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    label: 'SLA Escalation',
  },
  sla_warning: {
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    label: 'SLA Warning',
  },
  feedback_request: {
    icon: Star,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    label: 'Citizen Feedback',
  },
  system: {
    icon: Info,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800',
    label: 'System Notice',
  },
};

export const NotificationsPage = () => {
  const { user } = useAuth();
  const { unreadCount, markAsRead, markAllAsRead, deleteNotification, fetchUnreadCount } = useNotifications();
  const toast = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchList = async (pageNum = 1) => {
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        limit: 15,
        unread: onlyUnread ? 'true' : undefined,
        type: filterType !== 'all' ? filterType : undefined,
      };

      const res = await notificationService.getNotifications(params);
      const data = res?.data || {};
      setNotifications(data.notifications || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
      setPage(pageNum);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1);
  }, [filterType, onlyUnread]);

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
    }

    const grievanceId = notif.grievance?._id || notif.grievance || notif.data?.grievanceId;

    if (grievanceId) {
      const role = user?.role || 'citizen';
      if (role === 'citizen') {
        navigate(`/dashboard/citizen/grievances/${grievanceId}`);
      } else if (role === 'officer') {
        navigate(`/dashboard/officer/workbench/${grievanceId}`);
      } else {
        navigate(`/dashboard/admin/grievances?search=${notif.data?.trackingId || ''}`);
      }
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.info('Notification removed');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Notifications & Alerts"
        subtitle="Real-time alerts on ticket transitions, officer dispatches, and SLA escalation events."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchList(page)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleMarkAll}
              disabled={unreadCount === 0}
              leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
            >
              Mark all as read
            </Button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'status_update', label: 'Status Updates' },
            { id: 'assignment', label: 'Assignments' },
            { id: 'escalation', label: 'Escalations' },
            { id: 'sla_warning', label: 'SLA Warnings' },
            { id: 'feedback_request', label: 'Feedback' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === tab.id
                  ? 'bg-brand-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={onlyUnread}
            onChange={(e) => setOnlyUnread(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:bg-slate-800"
          />
          <span>Unread only ({unreadCount})</span>
        </label>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4 flex items-start gap-4">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Bell}
            title={onlyUnread ? 'No unread notifications' : 'No notifications found'}
            description={
              onlyUnread
                ? "You're all caught up! Switch to 'All Alerts' to review historical updates."
                : 'Activity logs, officer assignments, and SLA triggers will be listed here.'
            }
            action={
              onlyUnread ? (
                <Button variant="outline" size="sm" onClick={() => setOnlyUnread(false)}>
                  Show all notifications
                </Button>
              ) : null
            }
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
            const Icon = config.icon;
            const hasGrievance = !!notif.grievance;

            return (
              <div
                key={notif._id}
                onClick={() => handleItemClick(notif)}
                className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                  notif.isRead
                    ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'bg-brand-50/40 dark:bg-brand-950/20 border-brand-200/80 dark:border-brand-900/60 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Type Icon Badge */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${config.bg} ${config.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {config.label}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400 animate-pulse" />
                    )}
                    {notif.grievance?.trackingId && (
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        {notif.grievance.trackingId}
                      </Badge>
                    )}
                    <span className="text-[11px] text-slate-400 ml-auto">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  <h4
                    className={`text-sm font-semibold leading-snug ${
                      notif.isRead
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-900 dark:text-white font-bold'
                    }`}
                  >
                    {notif.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Grievance Link CTA */}
                  {hasGrievance && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Inspect ticket</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, notif._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages} ({totalCount} notifications)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => fetchList(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => fetchList(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
