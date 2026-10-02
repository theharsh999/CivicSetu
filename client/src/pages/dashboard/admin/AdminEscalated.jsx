import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Clock,
  Building,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import StatusBadge from '../../../components/ui/StatusBadge';
import PriorityBadge from '../../../components/ui/PriorityBadge';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import AdminGrievanceDrawer from './AdminGrievanceDrawer';
import adminService from '../../../services/adminService';

export const AdminEscalated = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'escalated', 'overdue', 'critical'
  const [search, setSearch] = useState('');

  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchEscalatedData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch both escalated and overdue
      const res = await adminService.getAllGrievances({
        limit: 100,
        sort: 'priority',
      });

      const all = res.grievances || [];
      const now = new Date();

      // Filter to only tickets requiring executive intervention
      const urgent = all.filter((g) => {
        const isResolved = ['Resolved', 'Closed'].includes(g.status);
        if (isResolved) return false;

        const isEscalated = g.status === 'Escalated' || (g.sla?.escalationLevel || 0) > 0;
        const isOverdue = g.sla?.breached || (g.sla?.dueAt && new Date(g.sla.dueAt) < now);
        const isCritical = g.priority === 'Critical';

        return isEscalated || isOverdue || isCritical;
      });

      setGrievances(urgent);
    } catch (err) {
      console.error('Failed to load escalated grievances:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEscalatedData();
  }, [fetchEscalatedData]);

  const now = new Date();

  // Filter by tab
  const filteredGrievances = grievances.filter((g) => {
    const isEscalated = g.status === 'Escalated' || (g.sla?.escalationLevel || 0) > 0;
    const isOverdue = g.sla?.breached || (g.sla?.dueAt && new Date(g.sla.dueAt) < now);
    const isCritical = g.priority === 'Critical';

    if (activeTab === 'escalated' && !isEscalated) return false;
    if (activeTab === 'overdue' && !isOverdue) return false;
    if (activeTab === 'critical' && !isCritical) return false;

    if (search.trim()) {
      const s = search.toLowerCase();
      return (
        g.trackingId.toLowerCase().includes(s) ||
        g.title.toLowerCase().includes(s) ||
        (g.department?.name && g.department.name.toLowerCase().includes(s))
      );
    }

    return true;
  });

  const handleOpenDrawer = (g) => {
    setSelectedGrievance(g);
    setDrawerOpen(true);
  };

  const handleGrievanceUpdated = () => {
    fetchEscalatedData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Attention: Escalated & Overdue"
        subtitle="Critical civic incidents requiring municipal intervention, departmental reassignment, or fast-track resolution."
        badge={<span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">PRIORITY ALERT</span>}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEscalatedData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        }
      />

      {/* TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold w-full sm:w-auto">
          {[
            { id: 'all', label: `All Urgent (${grievances.length})` },
            { id: 'escalated', label: 'Escalated' },
            { id: 'overdue', label: 'Overdue SLA' },
            { id: 'critical', label: 'Critical Severity' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search urgent tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      {/* TICKETS LIST */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : filteredGrievances.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No Escalated Tickets"
          description="All municipal grievances are currently running within their designated SLA time windows."
        />
      ) : (
        <div className="space-y-3">
          {filteredGrievances.map((item) => {
            const isBreached = item.sla?.breached || (item.sla?.dueAt && new Date(item.sla.dueAt) < now);

            return (
              <Card
                key={item._id}
                className="p-5 border-l-4 border-l-rose-500 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
                        {item.trackingId}
                      </span>
                      <PriorityBadge priority={item.priority} size="sm" />
                      <StatusBadge status={item.status} size="sm" />
                      {isBreached && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">
                          SLA EXCEEDED
                        </span>
                      )}
                      {item.sla?.escalationLevel > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Tier {item.sla.escalationLevel} Escalation
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.department?.name || 'Department'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.location?.ward || 'General'}</span>
                      </span>
                      <span>•</span>
                      <span>
                        Officer: <strong>{item.assignedOfficer?.name || 'Unassigned'}</strong>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                        SLA Target: {item.sla?.dueAt ? new Date(item.sla.dueAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenDrawer(item)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Reassign / Intervene
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Slide-over Inspection Drawer */}
      <AdminGrievanceDrawer
        grievance={selectedGrievance}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={handleGrievanceUpdated}
      />
    </div>
  );
};

export default AdminEscalated;
