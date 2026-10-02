import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Download,
  Filter,
  RefreshCw,
  Building,
  MapPin,
  Calendar,
  AlertTriangle,
  Clock,
  Eye,
  ChevronDown,
} from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import StatusBadge from '../../../components/ui/StatusBadge';
import PriorityBadge from '../../../components/ui/PriorityBadge';
import SlaBadge from '../../../components/ui/SlaBadge';
import Pagination from '../../../components/ui/Pagination';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import AdminGrievanceDrawer from './AdminGrievanceDrawer';
import adminService from '../../../services/adminService';
import { DEPARTMENTS, STATUSES, PRIORITIES } from '../../../utils/constants';

const WARDS = [
  'Ward 1 - Central',
  'Ward 2 - North',
  'Ward 3 - East',
  'Ward 4 - South',
  'Ward 5 - West',
  'Ward 6 - Metro',
  'Ward 7 - Suburbs',
  'Ward 8 - Industrial',
  'Ward 9 - Heritage',
];

export const AdminGrievances = () => {
  const [grievances, setGrievances] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [ward, setWard] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [escalated, setEscalated] = useState(false);
  const [overdue, setOverdue] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Drawer state
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Department directory for filters
  const [deptList, setDeptList] = useState([]);

  useEffect(() => {
    adminService.getDepartments().then((res) => {
      setDeptList(res.departments || []);
    }).catch(() => {});
  }, []);

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllGrievances({
        search,
        department,
        status,
        priority,
        ward,
        dateRange,
        escalated: escalated ? 'true' : undefined,
        overdue: overdue ? 'true' : undefined,
        sort,
        page,
        limit,
      });

      setGrievances(res.grievances || []);
      setTotalCount(res.pagination?.total || 0);
      setTotalPages(res.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoading(false);
    }
  }, [search, department, status, priority, ward, dateRange, escalated, overdue, sort, page, limit]);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  // Client-Side Export to CSV
  const handleExportCSV = () => {
    if (grievances.length === 0) return;

    const headers = [
      'Tracking ID',
      'Title',
      'Category',
      'Department',
      'Status',
      'Priority',
      'Ward',
      'Address',
      'Citizen Name',
      'Citizen Email',
      'Assigned Officer',
      'SLA Due Date',
      'Lodged At',
    ];

    const rows = grievances.map((g) => [
      `"${g.trackingId}"`,
      `"${(g.title || '').replace(/"/g, '""')}"`,
      `"${g.category || ''}"`,
      `"${g.department?.name || 'N/A'}"`,
      `"${g.status || ''}"`,
      `"${g.priority || ''}"`,
      `"${g.location?.ward || ''}"`,
      `"${(g.location?.address || '').replace(/"/g, '""')}"`,
      `"${g.citizen?.name || 'N/A'}"`,
      `"${g.citizen?.email || 'N/A'}"`,
      `"${g.assignedOfficer?.name || 'Unassigned'}"`,
      `"${g.sla?.dueAt ? new Date(g.sla.dueAt).toISOString() : ''}"`,
      `"${new Date(g.createdAt).toISOString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `CivicSetu_Grievances_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRowClick = (g) => {
    setSelectedGrievance(g);
    setDrawerOpen(true);
  };

  const handleGrievanceUpdated = (updated) => {
    setSelectedGrievance(updated);
    fetchGrievances();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Municipal Grievance Registry"
        subtitle={`Managing ${totalCount} records across all city wards and departments`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGrievances}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* FILTER CONTROLS BAR */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by Tracking ID (GRV-...), title, description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Departments</option>
              {deptList.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Priority Filter */}
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Ward Filter */}
            <select
              value={ward}
              onChange={(e) => {
                setWard(e.target.value);
                setPage(1);
              }}
              className="rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Wards</option>
              {WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              className="rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            {/* Checkbox Quick Filters */}
            <label className="inline-flex items-center gap-1.5 font-medium cursor-pointer text-rose-600 dark:text-rose-400">
              <input
                type="checkbox"
                checked={escalated}
                onChange={(e) => {
                  setEscalated(e.target.checked);
                  setPage(1);
                }}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span>Escalated Only</span>
            </label>

            <label className="inline-flex items-center gap-1.5 font-medium cursor-pointer text-amber-600 dark:text-amber-400">
              <input
                type="checkbox"
                checked={overdue}
                onChange={(e) => {
                  setOverdue(e.target.checked);
                  setPage(1);
                }}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Overdue Only</span>
            </label>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
              <option value="sla">SLA Due Soon</option>
            </select>
          </div>
        </div>
      </Card>

      {/* GRIEVANCES DATA TABLE */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : grievances.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={FileText}
              title="No Grievances Found"
              description="No complaints matched your active query filters. Try clearing or expanding your search criteria."
              actionLabel="Reset All Filters"
              onAction={() => {
                setSearch('');
                setDepartment('all');
                setStatus('all');
                setPriority('all');
                setWard('all');
                setDateRange('all');
                setEscalated(false);
                setOverdue(false);
                setPage(1);
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Issue Title & Ward</th>
                  <th className="py-3.5 px-4">Department & Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Priority & SLA</th>
                  <th className="py-3.5 px-4">Assigned Officer</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {grievances.map((g) => (
                  <tr
                    key={g._id}
                    onClick={() => handleRowClick(g)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    {/* Tracking ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                      {g.trackingId}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Title & Location */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {g.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{g.location?.ward || 'General'}</span>
                        {g.location?.address && <span>• {g.location.address}</span>}
                      </div>
                    </td>

                    {/* Department & Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: g.department?.color || '#3b82f6' }}
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {g.department?.name || 'Municipal'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {g.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={g.status} size="sm" />
                    </td>

                    {/* Priority & SLA */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <PriorityBadge priority={g.priority} size="sm" />
                        {g.sla?.breached && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded border border-rose-200">
                            BREACH
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                        Due: {g.sla?.dueAt ? new Date(g.sla.dueAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>

                    {/* Assigned Officer */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                      {g.assignedOfficer ? (
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {g.assignedOfficer.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {g.assignedOfficer.designation || 'Field Officer'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 text-xs italic">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(g);
                        }}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} records
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </Card>

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

export default AdminGrievances;
