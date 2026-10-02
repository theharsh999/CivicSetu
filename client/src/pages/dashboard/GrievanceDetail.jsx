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
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Textarea from '../../components/ui/Textarea';
import SlaBadge from '../../components/ui/SlaBadge';
import { formatExpectedDate } from '../../utils/dateUtils';
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
  Sparkles,
  Cpu,
  RotateCcw,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';

export const GrievanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  // Feedback and Reopen state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isReopening, setIsReopening] = useState(false);

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

  const handleSubmitFeedback = async () => {
    if (!feedbackRating) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      const res = await grievanceService.submitFeedback(grievance._id, {
        rating: feedbackRating,
        comment: feedbackComment.trim(),
      });
      setGrievance(res.data?.grievance || res.data);
      toast.success('Thank you! Your feedback has been recorded and this ticket is officially closed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleReopen = async () => {
    if (!reopenReason.trim()) {
      toast.error('A reason is required to dispute resolution and reopen this grievance.');
      return;
    }
    setIsReopening(true);
    try {
      const res = await grievanceService.reopenGrievance(grievance._id, reopenReason.trim());
      setGrievance(res.data?.grievance || res.data);
      setReopenModalOpen(false);
      setReopenReason('');
      toast.info('Grievance reopened. Status reverted to In Progress.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reopen grievance');
    } finally {
      setIsReopening(false);
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

          {/* Field Resolution Summary & Proof (Displayed when resolved or closed) */}
          {grievance.resolution?.summary ? (
            <Card className="p-5 border-l-4 border-l-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/10">
              <CardHeader className="p-0 pb-3 mb-3 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Municipal Resolution & Proof Report</span>
                </CardTitle>
                {grievance.resolution.resolvedAt && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatDate(grievance.resolution.resolvedAt)}
                  </span>
                )}
              </CardHeader>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {grievance.resolution.summary}
              </p>

              {grievance.resolution.proofImages && grievance.resolution.proofImages.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                    Official Work Execution Proof ({grievance.resolution.proofImages.length}):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {grievance.resolution.proofImages.map((imgUrl, i) => {
                      const fullProof = imgUrl.startsWith('http') ? imgUrl : `${backendBase}${imgUrl}`;
                      return (
                        <div
                          key={i}
                          onClick={() => setActiveImage(fullProof)}
                          className="cursor-pointer rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-700 relative group shadow-sm"
                        >
                          <img
                            src={fullProof}
                            alt="Resolution proof"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 className="w-5 h-5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            /* PROMPT 7 PLACEHOLDER: Field Resolution Proof */
            <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 text-xs text-slate-500 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-semibold text-slate-800 dark:text-slate-200">
                  Officer Field Resolution Proof (Awaiting Completion)
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Once field repair work is completed, before/after photographs and closing notes submitted by the assigned nodal officer will appear here.
                </p>
              </div>
            </div>
          )}
          {/* Citizen Feedback & Verification Section */}
          {grievance.feedback?.rating ? (
            /* Read-Only Citizen Satisfaction Feedback */
            <Card className="p-5 border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10">
              <CardHeader className="p-0 pb-3 mb-3 border-b border-emerald-100 dark:border-emerald-900/40">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                    <ThumbsUp className="w-4 h-4 text-emerald-600" />
                    <span>Citizen Satisfaction Feedback</span>
                  </div>
                  {grievance.feedback.submittedAt && (
                    <span className="text-[11px] font-normal text-slate-400">
                      Submitted on {formatDate(grievance.feedback.submittedAt)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= grievance.feedback.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {grievance.feedback.rating} out of 5 stars
                  </span>
                </div>

                {grievance.feedback.comment && (
                  <blockquote className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs italic text-slate-700 dark:text-slate-300">
                    "{grievance.feedback.comment}"
                  </blockquote>
                )}

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Resolution verified by citizen. Ticket permanently archived.</span>
                </div>
              </div>
            </Card>
          ) : grievance.status === 'Resolved' && user?.role === 'citizen' ? (
            /* Interactive Feedback Form (Resolved & Unrated) */
            <Card className="p-5 border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/30 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 shadow-md">
              <CardHeader className="p-0 pb-3 mb-3 border-b border-amber-100 dark:border-amber-900/40">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Resolution Verification & Rating</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                    Awaiting Citizen Sign-off
                  </span>
                </CardTitle>
              </CardHeader>

              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Field officers have completed the work and marked your grievance as{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">Resolved</strong>. Please review the
                  resolution proof above and rate your satisfaction.
                </p>

                {/* 5-Star Interactive Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    How satisfied are you with the redressal?
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => {
                        const activeVal = hoveredRating || feedbackRating;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setFeedbackRating(s)}
                            onMouseEnter={() => setHoveredRating(s)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                            title={`${s} Star${s > 1 ? 's' : ''}`}
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                s <= activeVal
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                  : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 min-w-[120px]">
                      {feedbackRating === 5 && '★★★★★ Excellent'}
                      {feedbackRating === 4 && '★★★★☆ Very Good'}
                      {feedbackRating === 3 && '★★★☆☆ Satisfactory'}
                      {feedbackRating === 2 && '★★☆☆☆ Below expectations'}
                      {feedbackRating === 1 && '★☆☆☆☆ Poor / Incomplete'}
                    </span>
                  </div>
                </div>

                {/* Optional Feedback Remark */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Comments or notes for the municipal department (optional):
                  </label>
                  <Textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="e.g. Footpath was fixed cleanly, thank you to the Roads squad!"
                    className="text-xs"
                  />
                </div>

                {/* Form Actions: Satisfied Close & Dispute Reopen */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={handleSubmitFeedback}
                    isLoading={isSubmittingFeedback}
                    leftIcon={<ThumbsUp className="w-4 h-4" />}
                  >
                    Satisfied — Accept & Close
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    onClick={() => setReopenModalOpen(true)}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Not Resolved — Dispute & Reopen
                  </Button>
                </div>
              </div>
            </Card>
          ) : grievance.status === 'Closed' ? (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs text-slate-500 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>This grievance has been officially closed and archived in municipal records.</span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 text-xs text-slate-500 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-semibold text-slate-800 dark:text-slate-200">
                  Citizen Satisfaction Rating
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Upon field completion and status change to "Resolved", you can rate resolution quality and confirm closure.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: SLA Target, Assigned Officer & Timeline (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Statutory SLA Target Card */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span>Statutory SLA Target</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {grievance.priority} Priority
                </span>
              </CardTitle>
            </CardHeader>

            <div className="space-y-3">
              <SlaBadge grievance={grievance} showProgress={true} className="w-full" />
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span>Resolution Target:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    {formatDate(grievance.sla?.dueAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span>Timeline Status:</span>
                  <span className="font-medium text-brand-600 dark:text-brand-400">
                    {formatExpectedDate(grievance.sla?.dueAt)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

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

          {/* AI Automated Routing Lifecycle Card */}
          {grievance.aiAnalysis && (
            <Card className="p-4 border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/20 dark:from-slate-900 dark:to-indigo-950/20">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>How We Routed Your Complaint</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {Math.round((grievance.aiAnalysis.confidence || 0) * 100)}% Match
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Department:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {grievance.department?.name || grievance.aiAnalysis.department}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Category:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {grievance.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Assigned SLA:</span>
                  <PriorityBadge priority={grievance.priority} size="sm" />
                </div>

                {grievance.aiAnalysis.reasoning && (
                  <div className="mt-2 pt-2 border-t border-indigo-100/70 dark:border-indigo-900/30 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-slate-800/60 p-2 rounded-lg">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-400">Analysis: </span>
                    {grievance.aiAnalysis.reasoning}
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Routing source: {grievance.categorySource === 'ai' ? 'AI Triage' : grievance.categorySource === 'officer' ? 'Officer Reassigned' : 'Citizen Choice'}</span>
                  <span className="font-mono">Rule-based NLP</span>
                </div>
              </div>
            </Card>
          )}

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

      {/* Citizen Dispute / Reopen Modal */}
      <Modal
        isOpen={reopenModalOpen}
        onClose={() => !isReopening && setReopenModalOpen(false)}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Dispute Resolution & Reopen Grievance
            </h3>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            <strong>7-Day Dispute Window:</strong> Grievance tickets may be reopened if field work was inadequate, incomplete, or the issue recurred.
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reason for disputing resolution <span className="text-rose-500">*</span>:
            </label>
            <Textarea
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Please provide specific details (e.g. Water is still muddy and pressure is low; potholes were only half covered)."
              className="text-xs"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReopenModalOpen(false)}
              disabled={isReopening}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleReopen}
              isLoading={isReopening}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Confirm Reopen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GrievanceDetail;
