import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  UserCheck,
  Clock,
  AlertTriangle,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  HardHat,
  Copy,
  Check,
} from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';
import PriorityBadge from '../../../components/ui/PriorityBadge';
import SlaBadge from '../../../components/ui/SlaBadge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';
import StatusTimeline from '../../../components/grievance/StatusTimeline';
import AiAnalysisCard from '../../../components/ai/AiAnalysisCard';
import adminService from '../../../services/adminService';
import { useToast } from '../../../context/ToastContext';
import { STATUSES, PRIORITIES } from '../../../utils/constants';

export const AdminGrievanceDrawer = ({
  grievance,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentOfficers, setDepartmentOfficers] = useState([]);

  // Reassign modal state
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  // Status modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Priority modal state
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [targetPriority, setTargetPriority] = useState('');
  const [priorityNote, setPriorityNote] = useState('');
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);

  // Load department directory for reassignments
  useEffect(() => {
    if (isOpen) {
      adminService.getDepartments().then((data) => {
        setDepartments(data.departments || []);
      }).catch((err) => console.warn(err));
    }
  }, [isOpen]);

  // Load officers when department selection changes in reassign modal
  useEffect(() => {
    if (selectedDeptId) {
      adminService.getUsers({ department: selectedDeptId, role: 'officer' })
        .then((res) => {
          setDepartmentOfficers(res.users || []);
        })
        .catch(() => setDepartmentOfficers([]));
    } else {
      setDepartmentOfficers([]);
    }
  }, [selectedDeptId]);

  if (!isOpen || !grievance) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(grievance.trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info('Tracking ID copied to clipboard');
  };

  // Submit Reassignment
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeptId) {
      toast.error('Please select a target municipal department');
      return;
    }
    if (!reassignReason.trim()) {
      toast.error('A mandatory justification reason is required for administrative reassignment');
      return;
    }

    setIsReassigning(true);
    try {
      const res = await adminService.reassignGrievance(grievance._id, {
        departmentId: selectedDeptId,
        officerId: selectedOfficerId || null,
        reason: reassignReason.trim(),
      });
      toast.success('Grievance successfully reassigned', 'Department Transferred');
      setShowReassignModal(false);
      setReassignReason('');
      if (onUpdate) onUpdate(res.grievance);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reassign grievance');
    } finally {
      setIsReassigning(false);
    }
  };

  // Submit Status Override
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!targetStatus) return;

    setIsUpdatingStatus(true);
    try {
      const res = await adminService.updateGrievanceStatus(grievance._id, {
        status: targetStatus,
        note: statusNote.trim(),
      });
      toast.success(`Status updated to "${targetStatus}"`, 'Status Changed');
      setShowStatusModal(false);
      setStatusNote('');
      if (onUpdate) onUpdate(res.grievance);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Submit Priority Override
  const handlePrioritySubmit = async (e) => {
    e.preventDefault();
    if (!targetPriority) return;

    setIsUpdatingPriority(true);
    try {
      const res = await adminService.updateGrievancePriority(grievance._id, {
        priority: targetPriority,
        note: priorityNote.trim(),
      });
      toast.success(`Priority updated to "${targetPriority}"`, 'Priority Changed');
      setShowPriorityModal(false);
      setPriorityNote('');
      if (onUpdate) onUpdate(res.grievance);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update priority');
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col overflow-hidden animate-slide-left">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-800/40">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-base font-extrabold text-brand-600 dark:text-brand-400">
                  {grievance.trackingId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Copy Tracking ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <StatusBadge status={grievance.status} size="sm" />
                <PriorityBadge priority={grievance.priority} size="sm" />
                <SlaBadge grievance={grievance} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                {grievance.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Action Bar */}
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Executive Actions
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDeptId(grievance.department?._id || '');
                  setSelectedOfficerId(grievance.assignedOfficer?._id || '');
                  setShowReassignModal(true);
                }}
                leftIcon={<Building className="w-3.5 h-3.5" />}
              >
                Reassign Department
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTargetStatus(grievance.status);
                  setShowStatusModal(true);
                }}
                leftIcon={<Sliders className="w-3.5 h-3.5" />}
              >
                Override Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTargetPriority(grievance.priority);
                  setShowPriorityModal(true);
                }}
                leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
              >
                Adjust Priority
              </Button>
            </div>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
            
            {/* Department & Officer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-400 block mb-1">Assigned Department</span>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: grievance.department?.color || '#3b82f6' }}
                  />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {grievance.department?.name || 'Municipal Services'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ({grievance.department?.code || 'N/A'})
                  </span>
                </div>
                <div className="mt-1.5 text-xs text-slate-500">
                  Category: <strong className="text-slate-700 dark:text-slate-300">{grievance.category}</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-400 block mb-1">Assigned Officer</span>
                {grievance.assignedOfficer ? (
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {grievance.assignedOfficer.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {grievance.assignedOfficer.designation || 'Field Engineer'} • {grievance.assignedOfficer.phone || 'N/A'}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-amber-600 dark:text-amber-400 italic">
                    Unassigned / In department queue
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Full Description
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                {grievance.description}
              </p>
            </div>

            {/* Geo Location */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Location & Ward Jurisdiction
              </h4>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{grievance.location?.address || 'Street address not provided'}</span>
                </div>
                <div className="text-slate-500 pl-5">
                  Ward: <strong>{grievance.location?.ward || 'General'}</strong>
                  {grievance.location?.landmark && ` • Landmark: ${grievance.location.landmark}`}
                </div>
              </div>
            </div>

            {/* AI Automated Analysis Card */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                AI Classification Intelligence
              </h4>
              {grievance.aiAnalysis ? (
                <AiAnalysisCard analysis={grievance.aiAnalysis} isLoading={false} />
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  No automated AI classification metadata recorded.
                </div>
              )}
            </div>

            {/* Audit Status Timeline */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Redressal Audit Trail
              </h4>
              <StatusTimeline timeline={grievance.timeline || []} />
            </div>

          </div>
        </div>
      </div>

      {/* REASSIGN MODAL */}
      <Modal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        title="Administrative Department Reassignment"
      >
        <form onSubmit={handleReassignSubmit} className="space-y-4 text-xs sm:text-sm">
          <p className="text-xs text-slate-500">
            Reassign this grievance to another department or nodal officer. A mandatory reason is recorded in the permanent audit trail.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              required
              className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select Department...</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Specific Officer (Optional - leaves to least loaded if blank)
            </label>
            <select
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
            >
              <option value="">Auto-assign least loaded officer</option>
              {departmentOfficers.map((off) => (
                <option key={off._id} value={off._id}>
                  {off.name} ({off.designation || 'Officer'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Textarea
              label="Mandatory Justification Reason"
              required
              rows={3}
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              placeholder="e.g. Incident involves broken stormwater drainage rather than road maintenance..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowReassignModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isReassigning}>
              Confirm Reassignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* OVERRIDE STATUS MODAL */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Executive Status Override"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Target Status
            </label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Textarea
              label="Administrative Note"
              rows={3}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Reason for overriding state machine status..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isUpdatingStatus}>
              Apply Status
            </Button>
          </div>
        </form>
      </Modal>

      {/* OVERRIDE PRIORITY MODAL */}
      <Modal
        isOpen={showPriorityModal}
        onClose={() => setShowPriorityModal(false)}
        title="Executive Priority Recalibration"
      >
        <form onSubmit={handlePrioritySubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Priority Level
            </label>
            <select
              value={targetPriority}
              onChange={(e) => setTargetPriority(e.target.value)}
              className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
            >
              <option value="Low">Low (168h SLA)</option>
              <option value="Medium">Medium (96h SLA)</option>
              <option value="High">High (48h SLA)</option>
              <option value="Critical">Critical (24h SLA)</option>
            </select>
          </div>

          <div>
            <Textarea
              label="Recalibration Note"
              rows={3}
              value={priorityNote}
              onChange={(e) => setPriorityNote(e.target.value)}
              placeholder="e.g. Elevating priority due to proximity to school and hospital entrance..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowPriorityModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isUpdatingPriority}>
              Update Priority
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AdminGrievanceDrawer;
