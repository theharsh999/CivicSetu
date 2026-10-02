import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import officerService from '../../services/officerService';
import { STATUSES, PRIORITIES, DEPARTMENTS } from '../../utils/constants';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import SlaBadge from '../../components/ui/SlaBadge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Pagination from '../../components/ui/Pagination';
import {
  Search,
  Filter,
  UserCheck,
  Building,
  ArrowRight,
  RotateCcw,
  Clock,
  Layers,
  MapPin,
} from 'lucide-react';

export const OfficerAssigned = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scope, setScope] = useState('mine'); // 'mine' | 'department'
  const [grievances, setGrievances] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('sla'); // Default to SLA due soonest
  const [currentPage, setCurrentPage] = useState(1);

  // Available categories for officer's department
  const userDeptCode = user?.department?.code;
  const deptObj = DEPARTMENTS.find((d) => d.code === userDeptCode);
  const availableCategories = deptObj ? deptObj.categories : [];

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        scope,
        page: currentPage,
        limit: 10,
        sort: selectedSort,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedPriority !== 'all') params.priority = selectedPriority;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const response = await officerService.getOfficerGrievances(params);
      setGrievances(response.data.grievances || []);
      setPagination(response.data.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assigned grievances roster.');
    } finally {
      setLoading(false);
    }
  }, [scope, currentPage, selectedSort, selectedStatus, selectedPriority, selectedCategory, searchTerm]);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchGrievances();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSelectedCategory('all');
    setSelectedSort('sla');
    setCurrentPage(1);
  };

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
        title="Assigned Grievances Queue"
        subtitle={`Department: ${user?.department?.name || 'Municipal Department'} • Manage, triage, and execute field resolution.`}
        actions={
          /* Scope Toggle */
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setScope('mine');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scope === 'mine'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Queue</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setScope('department');
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scope === 'department'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Department Queue</span>
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 shadow-subtle space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by ticket ID (GRV-...), headline, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
            <Button type="button" variant="outline" size="md" onClick={handleResetFilters}>
              Reset
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Status filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Priorities</option>
              {Object.values(PRIORITIES).map((pr) => (
                <option key={pr} value={pr}>
                  {pr}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort order */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sort Order</label>
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="sla">SLA Due Soonest</option>
              <option value="newest">Newest Lodged</option>
              <option value="oldest">Oldest Lodged</option>
              <option value="priority">By Severity/Priority</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Roster View */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" count={5} />
        </div>
      ) : error ? (
        <ErrorState title="Unable to Load Roster" message={error} onRetry={fetchGrievances} />
      ) : grievances.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={scope === 'mine' ? 'No Grievances in Your Queue' : 'No Department Grievances Found'}
          description={
            searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedCategory !== 'all'
              ? 'No grievances match the applied filter criteria. Try clearing filters.'
              : scope === 'mine'
              ? 'You have zero active grievances currently assigned to your personal queue.'
              : 'There are no complaints logged under this department.'
          }
          actionLabel="Reset Active Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Headline & Category</th>
                  <th className="py-3 px-4">Ward Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Clock</th>
                  {scope === 'department' && <th className="py-3 px-4">Assigned To</th>}
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {grievances.map((g) => (
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
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[130px]" title={g.location?.ward}>
                          {g.location?.ward || 'Central'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={g.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={g.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SlaBadge grievance={g} />
                    </td>
                    {scope === 'department' && (
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {g.assignedOfficer?.name ? (
                          <span className="font-medium">{g.assignedOfficer.name}</span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                    )}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono">
                      {formatDate(g.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                        Workbench
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {grievances.map((g) => (
              <Card
                key={g._id}
                hover
                onClick={() => navigate(`/dashboard/officer/workbench/${g._id}`)}
                className="p-4 space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded">
                    {g.trackingId}
                  </span>
                  <StatusBadge status={g.status} size="sm" />
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white leading-snug">
                    {g.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {g.category} &bull; {g.location?.ward}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <PriorityBadge priority={g.priority} size="sm" />
                  <SlaBadge grievance={g} />
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default OfficerAssigned;
