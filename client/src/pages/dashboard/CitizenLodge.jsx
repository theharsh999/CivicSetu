import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DEPARTMENTS, PRIORITIES } from '../../utils/constants';
import grievanceService from '../../services/grievanceService';
import aiService from '../../services/aiService';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PriorityBadge from '../../components/ui/PriorityBadge';
import StatusBadge from '../../components/ui/StatusBadge';
import LocationPicker from '../../components/grievance/LocationPicker';
import FileUploader from '../../components/grievance/FileUploader';
import AiAnalysisCard from '../../components/ai/AiAnalysisCard';
import {
  FileText,
  MapPin,
  Camera,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Bot,
  Sparkles,
  Copy,
  Check,
  Send,
  Building,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const CitizenLodge = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [createdGrievance, setCreatedGrievance] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    category: '',
    priority: 'Medium',
    ward: user?.ward || 'Ward 1 - Central',
    address: user?.address || '',
    landmark: '',
    lat: 19.0760,
    lng: 72.8777,
  });

  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});

  // AI Preview & Similarity State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [similarComplaints, setSimilarComplaints] = useState([]);

  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (formData.description.trim().length < 15) {
      setAiAnalysis(null);
      setSimilarComplaints([]);
      setAiError(null);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsAiLoading(true);
      setAiError(null);
      try {
        const result = await aiService.analyze({
          title: formData.title,
          description: formData.description,
          location: {
            address: formData.address,
            ward: formData.ward,
            coordinates: {
              lat: formData.lat,
              lng: formData.lng,
            },
          },
        });
        if (result?.analysis) {
          setAiAnalysis(result.analysis);
          setSimilarComplaints(result.similarGrievances || []);
        }
      } catch (err) {
        console.warn('AI preview non-blocking error:', err);
        setAiError('AI preview temporarily unavailable. You can still submit manually.');
      } finally {
        setIsAiLoading(false);
      }
    }, 700);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData.description, formData.title, formData.lat, formData.lng]);

  const handleApplyAiSuggestion = () => {
    if (!aiAnalysis) return;
    setFormData((prev) => ({
      ...prev,
      department: aiAnalysis.department,
      category: aiAnalysis.category,
      priority: aiAnalysis.priority || prev.priority,
    }));
    toast.success(`Applied AI recommendation: ${aiAnalysis.category}`, 'AI Suggestion Applied');
  };

  const handleSelectAlternative = (alt) => {
    setFormData((prev) => ({
      ...prev,
      department: alt.department,
      category: alt.category,
    }));
    toast.info(`Selected alternative category: ${alt.category}`);
  };

  const wards = [
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

  // Available categories based on selected department
  const selectedDeptObj = DEPARTMENTS.find((d) => d.code === formData.department);
  const availableCategories = selectedDeptObj ? selectedDeptObj.categories : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset category if department changes
      if (name === 'department') {
        updated.category = '';
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLocationChange = (lat, lng) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  };

  // Validation per step
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Please enter a clear issue headline.';
      if (formData.title.trim().length < 5) newErrors.title = 'Title must be at least 5 characters.';
      if (!formData.description.trim()) newErrors.description = 'Please describe the problem.';
      if (formData.description.trim().length < 15) newErrors.description = 'Please provide at least 15 characters of detail.';
      if (!formData.category) newErrors.category = 'Please select a grievance category or "Not sure".';
    } else if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Street/Locality address is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('category', formData.category);
      if (formData.department) data.append('department', formData.department);
      data.append('priority', formData.priority);
      data.append('ward', formData.ward);
      data.append('address', formData.address.trim());
      data.append('landmark', formData.landmark.trim());
      data.append('lat', formData.lat);
      data.append('lng', formData.lng);

      // Append files
      files.forEach((file) => {
        data.append('images', file);
      });

      const response = await grievanceService.lodgeGrievance(data);
      const grievance = response.data.grievance;

      setCreatedGrievance(grievance);
      toast.success(`Complaint lodged with ID: ${grievance.trackingId}`, 'Ticket Generated');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit grievance. Please try again.';
      toast.error(msg, 'Submission Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (createdGrievance?.trackingId) {
      navigator.clipboard.writeText(createdGrievance.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.info('Tracking ID copied to clipboard');
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (createdGrievance) {
    return (
      <div className="max-w-2xl mx-auto py-10 animate-fade-in">
        <Card className="p-8 text-center border-2 border-emerald-500/30 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Grievance Successfully Lodged!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Your municipal concern has been accepted by the system and auto-routed for field resolution.
          </p>

          {/* Tracking ID Badge Box */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto flex items-center justify-between gap-3">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Grievance Reference Number
              </span>
              <div className="font-mono text-lg font-extrabold text-brand-600 dark:text-brand-400">
                {createdGrievance.trackingId}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyId}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>

          {/* Quick Routing Summary */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-left max-w-sm mx-auto text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400">Assigned Department</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {createdGrievance.department?.name || 'Municipal Services'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400">SLA Resolution Window</span>
              <p className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                48 Hours (High Priority)
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={`/dashboard/citizen/grievances/${createdGrievance._id}`} className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Ticket Details
              </Button>
            </Link>
            <Link to="/dashboard/citizen/grievances" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full sm:w-auto">
                Back to My Grievances
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Lodge Municipal Grievance"
        subtitle="Submit a localized civic complaint for automated department dispatch and SLA tracking."
      />

      {/* Step Progress Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { num: 1, label: 'Issue Details', icon: FileText },
            { num: 2, label: 'Location & Ward', icon: MapPin },
            { num: 3, label: 'Evidence Photos', icon: Camera },
            { num: 4, label: 'Review & Lodge', icon: CheckCircle2 },
          ].map((s) => {
            const Icon = s.icon;
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div key={s.num} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-colors mb-1.5 ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-brand-600 text-white shadow-md ring-4 ring-brand-100 dark:ring-brand-950/60'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[11px] font-semibold hidden sm:inline ${
                    isCurrent
                      ? 'text-brand-600 dark:text-brand-400'
                      : isDone
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: DESCRIBE ISSUE */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-5 animate-slide-up">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Step 1: Describe the Civic Issue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Provide clear details to ensure accurate municipal auto-routing.
            </p>
          </div>

          <div>
            <Input
              label="Issue Headline / Short Title"
              required
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Hazardous deep pothole outside City Center Metro"
              error={errors.title}
              helperText="Brief summary of the civic hazard or complaint"
            />
          </div>

          <div>
            <Textarea
              label="Comprehensive Description"
              required
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the condition, safety hazard, how long it has been present, and any landmarks..."
              error={errors.description}
              helperText="Minimum 15 characters. Be descriptive to aid field engineers."
            />
          </div>

          {/* Category & Department Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Department (Optional)
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Not sure (Auto-detect via Category)</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.code} value={dept.code}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Complaint Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full rounded-lg text-sm bg-white dark:bg-slate-900 border px-3.5 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.category ? 'border-rose-400' : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                <option value="">Select a Category...</option>
                <option value="Not sure">Not sure / Let the system decide</option>
                {formData.department
                  ? availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))
                  : DEPARTMENTS.flatMap((d) =>
                      d.categories.map((cat) => (
                        <option key={`${d.code}-${cat}`} value={cat}>
                          [{d.code}] {cat}
                        </option>
                      ))
                    )}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.category}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Urgency / Citizen Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { level: PRIORITIES.LOW, time: '168h' },
                { level: PRIORITIES.MEDIUM, time: '96h' },
                { level: PRIORITIES.HIGH, time: '48h' },
                { level: PRIORITIES.CRITICAL, time: '24h' },
              ].map(({ level, time }) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, priority: level }))}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    formData.priority === level
                      ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/60 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{level}</span>
                    <span className="text-[10px] font-mono text-slate-400">{time}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI REAL-TIME PREVIEW & DUPLICATE DETECTION */}
          <div className="space-y-3">
            {(isAiLoading || aiAnalysis || aiError) && (
              <AiAnalysisCard
                analysis={aiAnalysis}
                isLoading={isAiLoading}
                error={aiError}
                onApply={handleApplyAiSuggestion}
                onSelectAlternative={handleSelectAlternative}
                showApplyButton={Boolean(aiAnalysis && (formData.category !== aiAnalysis.category || formData.department !== aiAnalysis.department))}
              />
            )}

            {/* SIMILAR GRIEVANCES / DUPLICATE DETECTION WARNING */}
            {similarComplaints.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/60 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Similar issues already reported nearby (Possible Duplicate)</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  We found open complaints in this area with similar descriptions. If one matches your issue, track it instead to avoid duplicate work for field squads:
                </p>
                <div className="space-y-2 pt-1">
                  {similarComplaints.map((item) => (
                    <div
                      key={item._id}
                      className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-brand-600 dark:text-brand-400">
                            {item.trackingId}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                            {item.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{item.category}</span>
                          {item.distanceMeters !== null && (
                            <>
                              <span>•</span>
                              <span>~{item.distanceMeters}m away</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="font-medium text-amber-600 dark:text-amber-400">
                            {Math.round((item.similarityScore || 0) * 100)}% text similarity
                          </span>
                        </div>
                      </div>
                      <a
                        href={`/track?id=${item.trackingId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 shrink-0 self-start sm:self-center"
                      >
                        Track Issue <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 flex justify-end">
            <Button variant="primary" size="md" onClick={nextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Continue to Location
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: LOCATION */}
      {currentStep === 2 && (
        <Card className="p-6 space-y-5 animate-slide-up">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Step 2: Incident Geo-Location & Municipal Ward
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Drop a pin on the map or click 'Locate Me' so field squads can navigate directly to the site.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Municipal Ward
              </label>
              <select
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {wards.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="Prominent Landmark (Optional)"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="e.g. Opposite Post Office Pillar 42"
              />
            </div>
          </div>

          <div>
            <Input
              label="Street Address / Exact Location"
              required
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g. 14 Station Road, Near Metro Gate 3"
              error={errors.address}
            />
          </div>

          {/* Leaflet LocationPicker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Pinpoint Exact Coordinates
            </label>
            <LocationPicker
              lat={formData.lat}
              lng={formData.lng}
              onChange={handleLocationChange}
              height="280px"
            />
          </div>

          <div className="pt-3 flex items-center justify-between">
            <Button variant="outline" size="md" onClick={prevStep} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" size="md" onClick={nextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Continue to Evidence
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: EVIDENCE PHOTOS */}
      {currentStep === 3 && (
        <Card className="p-6 space-y-5 animate-slide-up">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Step 3: Attach Photographic Evidence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Photos significantly accelerate municipal dispatch and prevent ticket dismissal.
            </p>
          </div>

          <FileUploader files={files} onChange={setFiles} maxFiles={4} maxSizeMB={5} />

          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Photographs are optional but highly recommended for prompt engineer verification.</span>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <Button variant="outline" size="md" onClick={prevStep} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" size="md" onClick={nextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Review Complaint
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {currentStep === 4 && (
        <Card className="p-6 space-y-5 animate-slide-up">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Step 4: Review & Final Confirmation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review your complaint details before generating an official municipal tracking ticket.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Issue Summary</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {formData.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {formData.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[10px] text-slate-400">Category</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formData.category}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[10px] text-slate-400">Department</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formData.department || 'Auto-Routing'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[10px] text-slate-400">Priority Level</span>
                <div className="mt-0.5">
                  <PriorityBadge priority={formData.priority} size="sm" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[10px] text-slate-400">Attached Images</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {files.length} Photo{files.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400">Site Location</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {formData.address} ({formData.ward})
              </p>
              {formData.landmark && (
                <p className="text-slate-500 dark:text-slate-400">
                  Landmark: {formData.landmark}
                </p>
              )}
              <p className="text-[11px] text-slate-400 font-mono">
                Coordinates: {formData.lat}, {formData.lng}
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <Button variant="outline" size="md" onClick={prevStep} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Back to Evidence
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Lodge Grievance Now
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CitizenLodge;
