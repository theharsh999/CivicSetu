import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Bot,
  Sparkles,
  MapPin,
  BarChart3,
  Activity,
  Layers,
  FileCheck2,
  ChevronRight,
  Hammer,
  Droplets,
  Zap,
  Trash2,
  Waves,
  HeartPulse,
  Car,
  Trees,
  HelpCircle,
  Send,
  Users
} from 'lucide-react';
import { DEPARTMENTS } from '../utils/constants';
import api from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export const Landing = () => {
  const [trackingId, setTrackingId] = useState('');
  const [publicStats, setPublicStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    api.get('/public/stats')
      .then((res) => {
        if (isMounted) {
          setPublicStats(res.data?.data || res.data);
        }
      })
      .catch((err) => {
        // Fallback gracefully to default metrics
        console.warn('Could not load live public stats, using baseline values:', err.message);
      });
    return () => { isMounted = false; };
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingId.trim()) {
      navigate(`/track?id=${encodeURIComponent(trackingId.trim().toUpperCase())}`);
    } else {
      navigate('/track');
    }
  };

  const getDeptIcon = (iconName) => {
    const iconMap = {
      Hammer,
      Droplets,
      Zap,
      Trash2,
      Waves,
      HeartPulse,
      Car,
      Trees,
      HelpCircle
    };
    const IconComponent = iconMap[iconName] || HelpCircle;
    return <IconComponent className="w-6 h-6" />;
  };

  const lifecycleSteps = [
    {
      step: '01',
      title: 'Lodge Grievance',
      desc: 'Citizen submits civic complaint with issue description, photos, and geo-tagged location.',
      icon: Send,
      color: 'from-blue-500 to-sky-600',
    },
    {
      step: '02',
      title: 'AI Analysis',
      desc: 'Rule-based NLP engine analyzes text, extracts grievance category, and assigns priority SLA.',
      icon: Bot,
      color: 'from-indigo-500 to-purple-600',
      highlight: true
    },
    {
      step: '03',
      title: 'Auto-Routing',
      desc: 'Complaint is immediately dispatched to the specific municipal ward and nodal officer.',
      icon: Layers,
      color: 'from-amber-500 to-orange-600',
    },
    {
      step: '04',
      title: 'Officer Action',
      desc: 'Assigned field team inspects site, executes resolution, and uploads photographic proof.',
      icon: Activity,
      color: 'from-teal-500 to-emerald-600',
    },
    {
      step: '05',
      title: 'Resolution & Closure',
      desc: 'Citizen reviews redressed issue, verifies field report, and provides satisfaction feedback.',
      icon: FileCheck2,
      color: 'from-emerald-500 to-green-600',
    }
  ];

  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Triage & Categorization',
      desc: 'Intelligent keyword matching and entity recognition maps citizen grievances directly to municipal department categories with SLA timelines.',
      tag: 'Core Innovation'
    },
    {
      icon: Clock,
      title: 'Enforced SLA Monitoring',
      desc: 'Time-bound resolution clocks based on severity (Critical: 24h, High: 48h). Automated escalation flag when deadlines are breached.',
      tag: 'Accountability'
    },
    {
      icon: Search,
      title: 'Public Status Tracking',
      desc: 'Transparent public tracking with unique ticket identifiers. Citizens can monitor real-time audit logs without friction.',
      tag: 'Transparency'
    },
    {
      icon: MapPin,
      title: 'Interactive Geo-Tagging',
      desc: 'Precise map coordinates pinpoint grievance hotspots, pothole clusters, and waterlogging across urban municipal wards.',
      tag: 'GIS Mapping'
    },
    {
      icon: BarChart3,
      title: 'Departmental Analytics',
      desc: 'Comprehensive oversight for municipal commissioners: SLA breach metrics, volume distributions, and officer redressed velocity.',
      tag: 'Governance'
    },
    {
      icon: ShieldCheck,
      title: 'Verified Resolution Proof',
      desc: 'Two-stage closure protocol requiring officer photographic verification and citizen closure confirmation before ticket retirement.',
      tag: 'Quality Control'
    },
  ];

  const stats = [
    {
      value: publicStats ? `${publicStats.totalResolved}+` : '48+',
      label: 'Grievances Resolved',
      sub: 'Verified by nodal officers & citizens',
    },
    {
      value: publicStats ? `${publicStats.activeDepartments}` : '9',
      label: 'Active Departments',
      sub: 'Citywide municipal coverage',
    },
    {
      value: publicStats ? `< ${publicStats.avgResolutionHours} hrs` : '< 36 hrs',
      label: 'Average Resolution Time',
      sub: 'Within enforceable SLA targets',
    },
    {
      value: publicStats ? `${publicStats.citizensServed}+` : '60+',
      label: 'Citizens Served',
      sub: `${publicStats?.avgRating ? `${publicStats.avgRating} ★ satisfaction` : 'High citizen trust'}`,
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        {/* Background Decorative Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-brand-500/10 via-civic-teal-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle Prototype Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6 animate-fade-in shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>AI-Driven Municipal Redressal Prototype &bull; Sem 5 PBL</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Report it. Track it.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-civic-teal-600">
              Resolve it.
            </span>
          </h1>

          {/* Subline */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            CivicSetu bridges the gap between citizens and municipal authorities with automated AI classification, SLA-backed routing, and transparent real-time tracking.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto shadow-md hover:shadow-lg" leftIcon={<PlusCircle className="w-5 h-5" />}>
                Lodge a Grievance
              </Button>
            </Link>
            <Link to="/track" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto" leftIcon={<Search className="w-5 h-5" />}>
                Track Grievance Status
              </Button>
            </Link>
          </div>

          {/* Tracking-ID Quick Search Box */}
          <div className="mt-10 max-w-md mx-auto">
            <form onSubmit={handleTrackSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Enter Ticket ID (e.g. CIV-2026-8941)..."
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full pl-11 pr-28 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm backdrop-blur"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-brand-600 dark:hover:bg-brand-700 rounded-lg transition-colors"
              >
                Track Now
              </button>
            </form>
            <p className="text-[11px] text-slate-400 mt-2">
              Instant public lookup &bull; No login required for status checks
            </p>
          </div>
        </div>
      </section>

      {/* 5-Step Lifecycle Strip ("How it Works") */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="primary" size="md">
            Grievance Lifecycle
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            How CivicSetu Resolves Your Civic Complaints
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            From smart ingestion to on-ground verification, every step is transparent and SLA-bound.
          </p>
        </div>

        {/* 5-Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {lifecycleSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-subtle hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-700 font-display">
                      {step.step}
                    </span>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {step.highlight && (
                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Rule-based AI triage</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Municipal Departments Grid */}
      <section id="departments" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <Badge variant="teal" size="md">
              Municipal Directory
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              Covered Urban Departments
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              9 specialized municipal divisions ready to address civic grievances across the city.
            </p>
          </div>
          <Link to="/register">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Lodge Issue in Any Dept
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEPARTMENTS.map((dept) => (
            <Card key={dept.code} hover className="p-5 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${dept.color}15`, color: dept.color }}
                  >
                    {getDeptIcon(dept.icon)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                    {dept.code}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {dept.name}
                </h3>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {dept.categories.map((cat) => (
                    <span
                      key={cat}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{dept.categories.length} Issue Subcategories</span>
                <span className="text-brand-600 dark:text-brand-400 font-medium group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Key Innovation Features */}
      <section className="bg-slate-100/70 dark:bg-slate-900/50 py-16 border-y border-slate-200/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="purple" size="md">
              System Architecture
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              Engineered for Transparent Civic Redressal
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Combining algorithmic classification with municipal field workflows for rapid issue remediation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-card transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Band (Placeholder Numbers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                Live Municipal Impact & Redressal Metrics
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-white font-display">
                Driving Redressal Accountability
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
              {stats.map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-200 to-civic-teal-300 font-display">
                    {item.value}
                  </div>
                  <div className="font-semibold text-sm text-white mt-1">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {item.sub}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-[11px] text-slate-400 mt-6">
              * Metrics reflect simulated prototype telemetry for evaluation purposes.
            </p>
          </div>
        </div>
      </section>

      {/* Academic Prototype Transparency Note */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-left sm:flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-xl shrink-0 self-start sm:self-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Honest Architecture Notice: Rule-Based AI Prototype
            </h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1 leading-relaxed">
              In this academic prototype, AI classification uses an optimized rule-based keyword matching service (configurable via <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">AI_PROVIDER=rule</code>). It delivers instant, zero-latency categorization without external paid LLM dependencies, meeting college project evaluation criteria cleanly.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-civic-teal-700 text-white p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to lodge an issue in your neighborhood?
          </h2>
          <p className="mt-3 text-brand-100 text-sm sm:text-base max-w-xl mx-auto font-normal">
            Take 60 seconds to submit your civic concern. Watch our automated dispatch assign the correct department immediately.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-slate-100 border-none shadow-md">
                Lodge Grievance Now
              </Button>
            </Link>
            <Link to="/track">
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10">
                Check Existing Ticket
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
