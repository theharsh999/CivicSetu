import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import grievanceService from '../../services/grievanceService';
import officerService from '../../services/officerService';
import aiService from '../../services/aiService';
import { ALLOWED_TRANSITIONS, DEPARTMENTS } from '../../utils/constants';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import SlaBadge from '../../components/ui/SlaBadge';
import Avatar from '../../components/ui/Avatar';
import Skeleton from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatusTimeline from '../../components/grievance/StatusTimeline';
import LocationPicker from '../../components/grievance/LocationPicker';
import FileUploader from '../../components/grievance/FileUploader';
import AiAnalysisCard from '../../components/ai/AiAnalysisCard';
import {
  ArrowLeft,
  Copy,
  Check,
  MapPin,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Sparkles,
  Phone,
  Mail,
  Building,
  HardHat,
  MessageSquare,
  Lock,
  Unlock,
  Send,
  Maximize2,
  FileCheck2,
  RotateCcw,
  CheckSquare,
} from 'lucide-react';

export const GrievanceWorkbench = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [grievance, setGrievance] = useState(null);
  const [departmentOfficers, setDepartmentOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [similarComplaints, setSimilarComplaints] = useState([]);

  // Status transition form state
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [confirmStatusModal, setConfirmStatusModal] = useState(false);

  // Remark form state
  const [remarkText, setRemarkText] = useState('');
  const [isInternalRemark, setIsInternalRemark] = useState(true);
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);

  // Reassignment form state
  const [reassignOfficerId, setReassignOfficerId] = useState('');
  const [reassignNote, setReassignNote] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  // Category correction form state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [correctedDeptCode, setCorrectedDeptCode] = useState('');
  const [correctedCategory, setCorrectedCategory] = useState('');
  const [categoryNote, setCategoryNote] = useState('');
  const [isCorrectingCategory, setIsCorrectingCategory] = useState(false);

  // Resolution modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [proofFiles, setProofFiles] = useState([]);
  const [isResolving, setIsResolving] = useState(false);

  // Fetch Grievance & Department Officers
  const fetchGrievanceData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await grievanceService.getGrievanceById(id);
      const g = response.data.grievance;
      setGrievance(g);

      // Initialize default next status if transitions available
      const nextOptions = ALLOWED_TRANSITIONS[g.status] || [];
      if (nextOptions.length > 0) {
        setTargetStatus(nextOptions[0]);
      } else {
        setTargetStatus('');
      }

      // Fetch officers in the same department
      if (g.department?._id || g.department) {
        const deptId = g.department._id || g.department;
        const offRes = await officerService.getDepartmentOfficers({ departmentId: deptId });
        setDepartmentOfficers(offRes.data.officers || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load grievance workbench.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGrievanceData();
  }, [fetchGrievanceData]);

  // Proactively check for potential duplicate complaints in vicinity
  useEffect(() => {
    if (grievance?.title && grievance?.description) {
      aiService
        .getSimilar({
          title: grievance.title,
          description: grievance.description,
          departmentCode: grievance.department?.code,
          lat: grievance.location?.coordinates?.lat,
          lng: grievance.location?.coordinates?.lng,
          excludeId: grievance._id,
        })
        .then((res) => {
          setSimilarComplaints(res.similarGrievances || []);
        })
        .catch((err) => {
          console.warn('Could not fetch similar complaints:', err);
        });
    }
  }, [grievance?._id, grievance?.title, grievance?.description, grievance?.department?.code]);

  const handleCopyId = () => {
    if (grievance?.trackingId) {
      navigator.clipboard.writeText(grievance.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.info('Tracking ID copied to clipboard');
    }
  };

  // 1. Submit Status Transition
  const handleStatusSubmit = async () => {
    if (!targetStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await officerService.updateGrievanceStatus(id, {
        status: targetStatus,
        note: statusNote.trim(),
      });
      setGrievance(res.data.grievance);
      setStatusNote('');
      setConfirmStatusModal(false);

      const nextOptions = ALLOWED_TRANSITIONS[res.data.grievance.status] || [];
      setTargetStatus(nextOptions[0] || '');

      toast.success(res.data.message || `Status updated to ${targetStatus}`, 'Transition Recorded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status', 'Transition Error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 2. Submit Remark
  const handleRemarkSubmit = async (e) => {
    e.preventDefault();
    if (!remarkText.trim()) return;

    setIsSubmittingRemark(true);
    try {
      const res = await officerService.addRemark(id, {
        text: remarkText.trim(),
        isInternal: isInternalRemark,
      });
      setGrievance(res.data.grievance);
      setRemarkText('');
      toast.success(
        isInternalRemark ? 'Internal department note recorded' : 'Public remark added to citizen timeline',
        'Remark Saved'
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add remark', 'Error');
    } finally {
      setIsSubmittingRemark(false);
    }
  };

  // 3. Submit Reassignment
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!reassignOfficerId) {
      toast.error('Please select an officer from the department', 'Required');
      return;
    }

    setIsReassigning(true);
    try {
      const res = await officerService.reassignOfficer(id, {
        officerId: reassignOfficerId,
        note: reassignNote.trim(),
      });
      setGrievance(res.data.grievance);
      setReassignNote('');
      setReassignOfficerId('');
      toast.success(res.data.message || 'Officer reassigned successfully', 'Reassigned');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reassign officer', 'Error');
    } finally {
      setIsReassigning(false);
    }
  };

  // 4. Submit Category / Department Correction
  const handleCategoryCorrection = async () => {
    if (!correctedCategory) {
      toast.error('Please choose a valid category', 'Required');
      return;
    }

    setIsCorrectingCategory(true);
    try {
      // Find department doc matching correctedDeptCode if changed
      let targetDeptId = null;
      if (correctedDeptCode) {
        const found = DEPARTMENTS.find((d) => d.code === correctedDeptCode);
        // If department changed, find its DB department ID from departmentOfficers or API
        targetDeptId = grievance.department?._id;
      }

      const res = await officerService.correctCategory(id, {
        category: correctedCategory,
        departmentId: targetDeptId,
        note: categoryNote.trim(),
      });

      setGrievance(res.data.grievance);
      setShowCategoryModal(false);
      setCategoryNote('');
      toast.success('Category and routing information updated', 'Classification Adjusted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to correct category', 'Error');
    } finally {
      setIsCorrectingCategory(false);
    }
  };

  // 5. Submit Resolution with Proof Images
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionSummary.trim()) {
      toast.error('Please enter a comprehensive resolution summary', 'Required');
      return;
    }

    setIsResolving(true);
    try {
      const data = new FormData();
      data.append('summary', resolutionSummary.trim());
      if (resolutionNote.trim()) data.append('note', resolutionNote.trim());

      proofFiles.forEach((file) => {
        data.append('proofImages', file);
      });

      const res = await officerService.resolveGrievance(id, data);
      setGrievance(res.data.grievance);
      setShowResolveModal(false);
      setResolutionSummary('');
      setResolutionNote('');
      setProofFiles([]);

      toast.success('Grievance marked as Resolved and recorded in municipal registry!', 'Resolved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit resolution', 'Resolution Failed');
    } finally {
      setIsResolving(false);
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !grievance) {
    return (
      <div className="py-12">
        <ErrorState
          title="Workbench Record Not Found"
          message={error || 'Unable to locate grievance ticket.'}
          onRetry={fetchGrievanceData}
        />
        <div className="text-center mt-4">
          <Link to="/dashboard/officer/assigned">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Assigned Queue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const backendBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5010';

  const allowedNextStatuses = ALLOWED_TRANSITIONS[grievance.status] || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div>
        <Link
          to="/dashboard/officer/assigned"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 font-semibold mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assigned Queue</span>
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
              <SlaBadge dueAt={grievance.sla?.dueAt} status={grievance.status} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
              {grievance.title}
            </h1>
          </div>

          {/* Quick Primary Resolution CTA */}
          {!['Resolved', 'Closed'].includes(grievance.status) && (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowResolveModal(true)}
                leftIcon={<FileCheck2 className="w-4 h-4" />}
                className="shadow-sm bg-emerald-600 hover:bg-emerald-700"
              >
                Mark as Resolved
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Details, Map, Evidence, AI Panel, Remarks (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Issue Details Card */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <CardTitle className="text-sm">Complaint Specifications</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCorrectedCategory(grievance.category);
                  setCorrectedDeptCode(grievance.department?.code || '');
                  setShowCategoryModal(true);
                }}
                className="text-[11px]"
              >
                Correct Category
              </Button>
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
                <span className="text-[10px] text-slate-400">
                  Source: <strong className="capitalize">{grievance.categorySource || 'citizen'}</strong>
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Department</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {grievance.department?.name || 'Municipal Services'}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">SLA Due Target</span>
                <p className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5 font-mono">
                  {formatDate(grievance.sla?.dueAt)}
                </p>
              </div>
            </div>
          </Card>

          {/* Citizen Contact Card */}
          <Card className="p-4 bg-slate-50/70 dark:bg-slate-850 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={grievance.citizen?.name || 'Citizen'} size="md" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {grievance.citizen?.name || 'Anonymous Citizen'}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Resident of {grievance.location?.ward || 'Municipal Ward'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                {grievance.citizen?.phone && (
                  <a
                    href={`tel:${grievance.citizen.phone}`}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-brand-600 font-medium"
                  >
                    <Phone className="w-3.5 h-3.5 text-brand-600" />
                    <span>{grievance.citizen.phone}</span>
                  </a>
                )}
                {grievance.citizen?.email && (
                  <a
                    href={`mailto:${grievance.citizen.email}`}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-brand-600 font-medium truncate max-w-[200px]"
                  >
                    <Mail className="w-3.5 h-3.5 text-brand-600" />
                    <span className="truncate">{grievance.citizen.email}</span>
                  </a>
                )}
              </div>
            </div>
          </Card>

          {/* Location & Mini-Map */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>Geographic Site Location</span>
              </CardTitle>
            </CardHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Ward:</span>{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {grievance.location?.ward}
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

              <LocationPicker
                lat={grievance.location?.coordinates?.lat || 19.0760}
                lng={grievance.location?.coordinates?.lng || 72.8777}
                readOnly={true}
                height="220px"
              />
            </div>
          </Card>

          {/* Citizen Photographic Evidence */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm">
                Photographic Evidence ({grievance.attachments?.length || 0})
              </CardTitle>
            </CardHeader>

            {grievance.attachments && grievance.attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
              <p className="text-xs text-slate-400 italic">No evidence photos were attached.</p>
            )}
          </Card>

          {/* AI ANALYSIS CARD & DUPLICATE CANDIDATE PANEL */}
          <div className="space-y-3">
            {grievance.aiAnalysis ? (
              <AiAnalysisCard
                analysis={grievance.aiAnalysis}
                isLoading={false}
              />
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                No automated AI classification metadata recorded for this ticket.
              </div>
            )}

            {/* DUPLICATE CANDIDATES DETECTED */}
            {similarComplaints.length > 0 && (
              <Card className="p-4 border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200 dark:border-amber-900/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Potential Duplicate Complaints Detected ({similarComplaints.length})</span>
                  </div>
                  <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                    Within 500m / Same Dept
                  </span>
                </div>
                <div className="space-y-2">
                  {similarComplaints.map((dup) => (
                    <div
                      key={dup._id}
                      className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                            {dup.trackingId}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                            {dup.title}
                          </span>
                          <StatusBadge status={dup.status} size="sm" />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{dup.category}</span>
                          {dup.distanceMeters !== null && (
                            <>
                              <span>•</span>
                              <span>~{dup.distanceMeters}m away</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="font-medium text-amber-600 dark:text-amber-400">
                            {Math.round((dup.similarityScore || 0) * 100)}% match
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/dashboard/officer/workbench/${dup._id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 shrink-0"
                      >
                        Inspect &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Resolution Proof Card (If Resolved or Closed) */}
          {grievance.resolution?.summary && (
            <Card className="p-5 border-l-4 border-l-emerald-600">
              <CardHeader className="p-0 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Field Resolution Summary</span>
                </CardTitle>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatDate(grievance.resolution.resolvedAt)}
                </span>
              </CardHeader>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {grievance.resolution.summary}
              </p>

              {grievance.resolution.proofImages && grievance.resolution.proofImages.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                    Work Execution Photographs ({grievance.resolution.proofImages.length}):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {grievance.resolution.proofImages.map((imgUrl, i) => {
                      const fullProof = imgUrl.startsWith('http') ? imgUrl : `${backendBase}${imgUrl}`;
                      return (
                        <div
                          key={i}
                          onClick={() => setActiveImage(fullProof)}
                          className="cursor-pointer rounded-lg overflow-hidden aspect-video border border-slate-200 dark:border-slate-700 relative group"
                        >
                          <img src={fullProof} alt="Resolution proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Remarks Thread (Public & Internal) */}
          <Card className="p-5 space-y-4">
            <CardHeader className="p-0 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-brand-600" />
                <span>Remarks & Field Coordination ({grievance.remarks?.length || 0})</span>
              </CardTitle>
            </CardHeader>

            {/* Remark Submission Form */}
            <form onSubmit={handleRemarkSubmit} className="space-y-3">
              <Textarea
                placeholder="Write an internal operational note or public citizen update..."
                rows={2}
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                required
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isInternalRemark}
                    onChange={(e) => setIsInternalRemark(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <span className="flex items-center gap-1">
                    {isInternalRemark ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-semibold text-amber-700 dark:text-amber-400">
                          Internal Only (Hidden from citizen)
                        </span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          Public Remark (Visible on citizen tracker)
                        </span>
                      </>
                    )}
                  </span>
                </label>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingRemark}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Post Remark
                </Button>
              </div>
            </form>

            {/* Remarks History */}
            {grievance.remarks && grievance.remarks.length > 0 ? (
              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                {grievance.remarks.map((r) => (
                  <div
                    key={r._id}
                    className={`p-3 rounded-xl border text-xs ${
                      r.isInternal
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40'
                        : 'bg-slate-50/70 dark:bg-slate-850 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {r.author?.name || 'Officer'}
                        </span>
                        {r.isInternal ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Internal Note
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Public
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {r.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic pt-2">No remarks posted yet.</p>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: Actions, Reassignment & Audit Timeline (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Action Card: Status Transition Engine */}
          <Card className="p-5 border-t-4 border-t-brand-600 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Workflow Status Actions
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Current State: <strong className="text-brand-600">{grievance.status}</strong>
              </p>
            </div>

            {allowedNextStatuses.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Valid Next Transition:
                  </label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {allowedNextStatuses.map((st) => (
                      <option key={st} value={st}>
                        Transition to: {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Action Explanation Note (Optional)"
                    placeholder="e.g. Field inspection completed, contractor assigned..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setConfirmStatusModal(true)}
                  className="w-full"
                >
                  Execute Transition to {targetStatus}
                </Button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 text-center">
                This grievance has reached a terminal or closed lifecycle stage. No further transitions permitted.
              </div>
            )}
          </Card>

          {/* Action Card: Reassign Officer within Department */}
          <Card className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>Reassign Nodal Officer</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Delegate this complaint to a colleague in {grievance.department?.name}.
              </p>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-3">
              <div>
                <select
                  value={reassignOfficerId}
                  onChange={(e) => setReassignOfficerId(e.target.value)}
                  className="w-full text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                >
                  <option value="">Select Ward Officer...</option>
                  {departmentOfficers.map((off) => (
                    <option key={off._id} value={off._id}>
                      {off.name} ({off.designation || 'Officer'}) — {off.activeCount} active
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Input
                  placeholder="Delegation memo / reason..."
                  value={reassignNote}
                  onChange={(e) => setReassignNote(e.target.value)}
                  className="text-xs"
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="w-full"
                isLoading={isReassigning}
              >
                Confirm Officer Reassignment
              </Button>
            </form>
          </Card>

          {/* Audit Lifecycle Timeline */}
          <Card className="p-5">
            <CardHeader className="p-0 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>Full Audit Timeline ({grievance.timeline?.length || 0})</span>
              </CardTitle>
            </CardHeader>

            <StatusTimeline timeline={grievance.timeline || []} />
          </Card>
        </div>
      </div>

      {/* CONFIRMATION DIALOG FOR STATUS TRANSITION */}
      <ConfirmDialog
        isOpen={confirmStatusModal}
        onClose={() => setConfirmStatusModal(false)}
        onConfirm={handleStatusSubmit}
        title={`Confirm Status Transition`}
        message={`Are you sure you want to transition ticket "${grievance.trackingId}" from "${grievance.status}" to "${targetStatus}"? This will be permanently recorded in the municipal audit trail.`}
        confirmText={`Update to ${targetStatus}`}
        variant="primary"
        isLoading={isUpdatingStatus}
      />

      {/* MODAL: MARK AS RESOLVED */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        maxWidth="lg"
        title="Execute Grievance Resolution"
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submit final rectification details and photographic proof of the repaired civic asset before closing.
          </p>

          <div>
            <Textarea
              label="Field Resolution Summary"
              required
              rows={3}
              placeholder="Describe the physical work executed, contractor details, materials used, and rectification outcome..."
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              helperText="This summary will be visible to the citizen and municipal auditors."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Upload Photographic Proof (Up to 3 images)
            </label>
            <FileUploader files={proofFiles} onChange={setProofFiles} maxFiles={3} maxSizeMB={5} />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowResolveModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isResolving}
              className="bg-emerald-600 hover:bg-emerald-700"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm and Resolve Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CATEGORY & ROUTING CORRECTION */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        maxWidth="md"
        title="Correct Classification & Routing"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            If the citizen selected the wrong category, adjust it here. This updates the dataset and feeds the AI model retraining loop in Prompt 5.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Correct Category
            </label>
            <select
              value={correctedCategory}
              onChange={(e) => setCorrectedCategory(e.target.value)}
              className="w-full text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
            >
              {DEPARTMENTS.flatMap((d) =>
                d.categories.map((c) => (
                  <option key={`${d.code}-${c}`} value={c}>
                    [{d.code}] {c}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <Input
              label="Correction Justification Note"
              placeholder="e.g. Issue was logged as road pothole, but is an open drainage culvert."
              value={categoryNote}
              onChange={(e) => setCategoryNote(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCategoryModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCategoryCorrection}
              isLoading={isCorrectingCategory}
            >
              Save Classification
            </Button>
          </div>
        </div>
      </Modal>

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

export default GrievanceWorkbench;
