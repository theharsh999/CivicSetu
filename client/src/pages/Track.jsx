import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  FileSearch,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  MapPin,
} from 'lucide-react';
import grievanceService from '../services/grievanceService';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Skeleton from '../components/ui/Skeleton';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import StatusTimeline from '../components/grievance/StatusTimeline';

export const Track = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { trackingId: routeTrackingId } = useParams();
  const navigate = useNavigate();

  const initialId = (routeTrackingId || searchParams.get('id') || '').trim().toUpperCase();
  const [ticketInput, setTicketInput] = useState(initialId);
  const [activeTrackingId, setActiveTrackingId] = useState(initialId);

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrackData = useCallback(async (idToTrack) => {
    if (!idToTrack) {
      setGrievance(null);
      setError('');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await grievanceService.trackGrievance(idToTrack);
      const data = response?.data?.grievance || response?.data || response?.grievance || response;
      setGrievance(data);
    } catch (err) {
      setGrievance(null);
      setError(
        err.response?.data?.message ||
          `No municipal record found for ticket "${idToTrack}". Please verify the reference ID and try again.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = (routeTrackingId || searchParams.get('id') || '').trim().toUpperCase();
    if (id) {
      setTicketInput(id);
      setActiveTrackingId(id);
      fetchTrackData(id);
    }
  }, [routeTrackingId, searchParams, fetchTrackData]);

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanId = ticketInput.trim().toUpperCase();
    if (!cleanId) return;

    setActiveTrackingId(cleanId);
    setSearchParams({ id: cleanId });
    fetchTrackData(cleanId);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Track Grievance Redressal
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Enter your unique municipal complaint reference ID (e.g., GRV-2026-000001) to view real-time department routing, SLA clocks, and progress audits.
        </p>
      </div>

      <Card className="p-6 mb-8 shadow-card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="e.g. GRV-2026-000001"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button type="submit" variant="primary" leftIcon={<Search className="w-4 h-4" />}>
            Search Ticket
          </Button>
        </form>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>
            Public access &bull; Format:{' '}
            <button
              type="button"
              onClick={() => {
                setTicketInput('GRV-2026-000001');
                setActiveTrackingId('GRV-2026-000001');
                setSearchParams({ id: 'GRV-2026-000001' });
                fetchTrackData('GRV-2026-000001');
              }}
              className="font-mono text-brand-600 dark:text-brand-400 hover:underline"
            >
              GRV-2026-000001
            </button>
          </span>
          <span className="hidden sm:inline">Updated in real-time</span>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : error ? (
        <div className="py-6">
          <ErrorState
            title="Ticket Not Found"
            message={error}
            retryLabel="Clear and Try Again"
            onRetry={() => {
              setTicketInput('');
              setActiveTrackingId('');
              setSearchParams({});
              setError('');
            }}
          />
        </div>
      ) : grievance ? (
        <div className="space-y-6 animate-fade-in">
          {/* Grievance Public Summary Card */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded">
                    {grievance.trackingId}
                  </span>
                  <StatusBadge status={grievance.status} />
                  <PriorityBadge priority={grievance.priority} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  {grievance.title}
                </h2>
              </div>
              <div className="text-right sm:text-right shrink-0">
                <span className="text-xs text-slate-400">Lodged On</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {formatDate(grievance.createdAt)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400">Department</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {grievance.department?.name || 'Municipal Department'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Category</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {grievance.category}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Jurisdiction Ward</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {grievance.location?.ward || 'Central Zone'}
                </p>
              </div>
            </div>

            {/* Lifecycle Timeline */}
            <div className="pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Redressal Audit Trail
              </h3>
              <StatusTimeline timeline={grievance.timeline || []} />
            </div>
          </Card>
        </div>
      ) : (
        <EmptyState
          icon={FileSearch}
          title="No Ticket Queried Yet"
          description="Enter a valid grievance reference ID above to track the complete resolution lifecycle, assigned department, and field progress."
        />
      )}
    </div>
  );
};

export default Track;
