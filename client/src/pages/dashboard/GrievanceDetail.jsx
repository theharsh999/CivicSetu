import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import grievanceService from '../../services/grievanceService';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import Avatar from '../../components/ui/Avatar';
import Skeleton from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';
import StatusTimeline from '../../components/grievance/StatusTimeline';
import LocationPicker from '../../components/grievance/LocationPicker';
import {
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  Building,
  UserCheck,
  FileCheck2,
  Star,
  Maximize2,
  ExternalLink,
  ShieldAlert,
  HardHat,
  Phone,
  Mail,
} from 'lucide-react';

export const GrievanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await grievanceService.getGrievanceById(id);
      setGrievance(response.data.grievance);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load grievance details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleCopyId = () => {
    if (grievance?.trackingId) {
      navigator.clipboard.writeText(grievance.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !grievance) {
    return (
      <div className="py-12">
        <ErrorState
          title="Grievance Record Not Found"
          message={error || 'Unable to locate the requested municipal grievance ticket.'}
          onRetry={fetchDetail}
          retryLabel="Reload Ticket"
        />
        <div className="text-center mt-4">
          <Link to="/dashboard/citizen/grievances">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to My Grievances
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const backendBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5010';

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Banner */}
      <div>
        <Link
          to="/dashboard/citizen/grievances"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 font-semibold mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Complaints</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-black text-brand-600 dark:text-brand-400">
                {grievance.trackingId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                title="Copy tracking ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <StatusBadge status={grievance.status} size="md" />
              <PriorityBadge priority={grievance.priority} size="md" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {grievance.title}
            </h1>
          </div>

          <div className="text-right sm:text-right shrink-0">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Lodged On</span>
            <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              {formatDate(grievance.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Description, Location, Attachments, Resolution Proof (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Issue Description Card */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm">Complaint Description</CardTitle>
            </CardHeader>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {grievance.description}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400">Category</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {grievance.category}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Department</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {grievance.department?.name || 'Municipal Services'}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">SLA Target</span>
                <p className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5 font-mono">
                  {formatDate(grievance.sla?.dueAt)}
                </p>
              </div>
            </div>
          </Card>

          {/* Location & Mini-Map */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Geo-Location & Ward Jurisdiction</span>
              </CardTitle>
            </CardHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Ward:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {grievance.location?.ward || 'General'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Landmark:</span>{' '}
                  <span className="text-slate-700 dark:text-slate-300">
                    {grievance.location?.landmark || 'None specified'}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400">Address:</span>{' '}
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {grievance.location?.address}
                  </span>
                </div>
              </div>

              {/* ReadOnly Leaflet Map */}
              <LocationPicker
                lat={grievance.location?.coordinates?.lat || 19.0760}
                lng={grievance.location?.coordinates?.lng || 72.8777}
                readOnly={true}
                height="220px"
              />
            </div>
          </Card>

          {/* Photographic Evidence Gallery */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm">
                Photographic Evidence ({grievance.attachments?.length || 0})
              </CardTitle>
            </CardHeader>

            {grievance.attachments && grievance.attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {grievance.attachments.map((att, idx) => {
                  const fullUrl = att.url.startsWith('http') ? att.url : `${backendBase}${att.url}`;

                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveImage(fullUrl)}
                      className="group cursor-pointer rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800 relative shadow-sm"
                    >
                      <img
                        src={fullUrl}
                        alt={att.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No photographs were attached during lodging.
              </p>
            )}
          </Card>

          {/* PROMPT 7 PLACEHOLDER: Field Resolution Proof */}
          <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 text-xs text-slate-500 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-semibold text-slate-800 dark:text-slate-200">
                Officer Field Resolution Proof (Prompt 7 Verification Pipeline)
              </h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Once field work is executed, before/after photographs and closing notes submitted by the assigned engineer will be displayed here for citizen verification.
              </p>
            </div>
          </div>

          {/* PROMPT 7 PLACEHOLDER: Citizen Feedback */}
          <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 text-xs text-slate-500 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-semibold text-slate-800 dark:text-slate-200">
                Citizen Satisfaction & Rating (Prompt 7 Citizen Feedback)
              </h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upon ticket resolution, citizens can rate resolution quality (1 to 5 stars) and submit feedback before permanent archive.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Assigned Officer (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Assigned Officer Card */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <HardHat className="w-4 h-4 text-amber-600" />
                <span>Assigned Nodal Officer</span>
              </CardTitle>
            </CardHeader>

            {grievance.assignedOfficer ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar name={grievance.assignedOfficer.name} size="md" status="online" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {grievance.assignedOfficer.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {grievance.assignedOfficer.designation || 'Field Inspector'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{grievance.department?.name}</span>
                  </p>
                  {grievance.assignedOfficer.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{grievance.assignedOfficer.phone}</span>
                    </p>
                  )}
                  {grievance.assignedOfficer.email && (
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate font-mono text-[11px]">{grievance.assignedOfficer.email}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Awaiting nodal officer assignment from {grievance.department?.name || 'Department'}.
              </p>
            )}
          </Card>

          {/* Audit Lifecycle Timeline */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>Redressal Timeline</span>
              </CardTitle>
            </CardHeader>

            <StatusTimeline timeline={grievance.timeline} />
          </Card>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      <Modal isOpen={!!activeImage} onClose={() => setActiveImage(null)} maxWidth="2xl">
        <div className="flex flex-col items-center">
          {activeImage && (
            <img
              src={activeImage}
              alt="Enlarged grievance proof"
              className="max-h-[70vh] w-auto rounded-xl object-contain shadow-lg"
            />
          )}
          <div className="mt-3 flex justify-end w-full">
            <Button variant="outline" size="sm" onClick={() => setActiveImage(null)}>
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GrievanceDetail;
