import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Bot,
  Layers,
  Activity,
  Bell,
  Clock,
  ShieldCheck,
  Star,
  BarChart3,
  UserCheck,
  Cpu,
  RefreshCw,
  Code2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export const HowItWorks = () => {
  useEffect(() => {
    document.title = 'How It Works & AI Architecture — CivicSetu';
    window.scrollTo(0, 0);
  }, []);

  const lifecycleSteps = [
    {
      num: '01',
      title: 'Citizen Grievance Submission',
      role: 'Citizen',
      desc: 'The citizen submits a structured grievance with a detailed description, localized address, ward selection, GPS coordinates, and photo evidence attachments.',
      icon: Send,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      num: '02',
      title: 'AI Analysis & Entity Triage',
      role: 'AI Engine',
      desc: 'Our deterministic NLP triage engine inspects text tokens and urgency indicators, extracting category, confidence level, and priority rating (Low to Critical).',
      icon: Bot,
      color: 'from-purple-500 to-violet-600',
      highlight: true,
    },
    {
      num: '03',
      title: 'Automated Department Routing',
      role: 'System',
      desc: 'The routing engine maps the classified category to the municipal department (Roads, Water, Sanitation, etc.) and auto-assigns the least-loaded ward officer.',
      icon: Layers,
      color: 'from-sky-500 to-cyan-600',
    },
    {
      num: '04',
      title: 'Multichannel Notifications',
      role: 'Notification Service',
      desc: 'Instant notifications are dispatched: the citizen is notified of routing, the officer receives assignment alerts, and admins get visibility.',
      icon: Bell,
      color: 'from-amber-500 to-orange-600',
    },
    {
      num: '05',
      title: 'Officer Investigation & Remarks',
      role: 'Municipal Officer',
      desc: 'Field teams inspect the site, log progress updates, record internal coordination remarks, and transition tickets into "In Progress".',
      icon: Activity,
      color: 'from-teal-500 to-emerald-600',
    },
    {
      num: '06',
      title: 'Continuous SLA & Escalation Engine',
      role: 'Background Cron',
      desc: 'A 15-minute background job continuously evaluates SLA due dates. Overdue tickets escalate to Tier 1 and Tier 2 (Critical priority for Commissioners).',
      icon: Clock,
      color: 'from-rose-500 to-red-600',
    },
    {
      num: '07',
      title: 'Verified Resolution with Photo Proof',
      role: 'Officer & Crew',
      desc: 'Once repairs are complete, the officer provides a resolution summary and uploads photographic evidence, transitioning the ticket to "Resolved".',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-green-600',
    },
    {
      num: '08',
      title: 'Citizen Feedback or Dispute Reopen',
      role: 'Citizen',
      desc: 'The citizen inspects resolution proof. They can rate the redressal (1-5 stars) and close the ticket, or dispute within 7 days to reopen for re-investigation.',
      icon: Star,
      color: 'from-yellow-500 to-amber-600',
    },
    {
      num: '09',
      title: '7-Day Auto-Close Safeguard',
      role: 'System Actor',
      desc: 'If a resolved grievance receives no citizen response within 7 calendar days, the SLA engine automatically archives it with an audit note.',
      icon: RefreshCw,
      color: 'from-indigo-500 to-blue-600',
    },
    {
      num: '10',
      title: 'Executive Analytics & GIS Mapping',
      role: 'Municipal Admin',
      desc: 'Redressal times, citizen satisfaction scores, and spatial grievance densities feed live dashboards, interactive heatmaps, and department leaderboards.',
      icon: BarChart3,
      color: 'from-slate-700 to-slate-900',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Header Banner */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Platform Lifecycle & AI Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            How CivicSetu Resolves Grievances
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            A transparent walkthrough of our 10-stage end-to-end municipal grievance redressal workflow, automated SLA escalation engine, and AI classification layer.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <Button variant="primary" size="md">
                Lodge a Complaint
              </Button>
            </Link>
            <Link to="/track">
              <Button variant="outline" size="md">
                Public Ticket Tracker
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 10-Step Interactive Lifecycle */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <Badge variant="primary" size="sm">End-to-End Workflow</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
            The 10-Stage Grievance Journey
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Every step is recorded in an immutable audit timeline visible to citizens and officers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {lifecycleSteps.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.num}
                className={`p-5 flex flex-col justify-between hover:shadow-card-hover transition-all duration-200 ${
                  step.highlight ? 'ring-2 ring-brand-500/50 bg-brand-50/20 dark:bg-brand-950/20' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                      STAGE {step.num}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {step.role}
                    </span>
                  </div>

                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center mb-3 shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* AI Architecture & Prototype Transparency Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/40 uppercase tracking-wider">
                Academic & Engineering Transparency
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              About the CivicSetu AI Layer
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              In this PBL Prototype, the AI component operates via a high-performance, <strong>rule-based NLP analysis engine</strong> designed with an enterprise-ready, swappable provider abstraction pattern.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white">How the Current Prototype Works</h4>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 mt-3 list-disc list-inside">
                  <li>Tokenizes grievance text and matches municipal civic vocabulary.</li>
                  <li>Extracts department affinities and categorizes with a calibrated confidence score.</li>
                  <li>Detects urgency signals (e.g. "sparking", "flooding", "collapsed") to elevate priority.</li>
                  <li>Performs geo-spatial duplicate detection within a 200m radius.</li>
                  <li>Guarantees 100% deterministic, instant responses with zero API costs.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Pluggable LLM / ML Interface</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  The AI architecture conforms to an abstract contract:
                </p>
                <div className="mt-2 p-2.5 rounded-lg bg-black/40 font-mono text-[11px] text-brand-300 overflow-x-auto">
                  analyzeGrievance({'{ title, description, location }'}) &rarr; {'{ department, category, priority, confidence, reasoning }'}
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  In production, setting <code className="text-brand-300 bg-white/10 px-1 py-0.5 rounded">AI_PROVIDER=gemini</code> or <code className="text-brand-300 bg-white/10 px-1 py-0.5 rounded">openai</code> dynamically binds modern LLM models without altering any controller, router, or workflow logic.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-400" />
                <span>Deterministic rule engine tested across 45+ civic edge-cases.</span>
              </span>
              <Link to="/dashboard/citizen" className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
                Explore Citizen Live Experience &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Ready to Test Civic Redressal?
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Experience real-time municipal triage from the citizen, officer, and administrator perspectives.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register">
            <Button variant="primary" size="md">
              Create Citizen Account
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="md">
              Sign In with Demo Credentials
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
