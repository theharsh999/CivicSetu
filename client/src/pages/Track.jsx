import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, FileSearch, ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';

export const Track = () => {
  const [searchParams] = useSearchParams();
  const [ticketId, setTicketId] = useState(searchParams.get('id') || '');
  const [queriedId, setQueriedId] = useState(searchParams.get('id') || '');

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setTicketId(id);
      setQueriedId(id);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQueriedId(ticketId.trim().toUpperCase());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Track Grievance Redressal
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Enter your unique municipal complaint reference ID to view real-time department routing, SLA clocks, and officer progress.
        </p>
      </div>

      <Card className="p-6 mb-8 shadow-card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="e.g. CIV-2026-8941"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button type="submit" variant="primary" leftIcon={<Search className="w-4 h-4" />}>
            Search Ticket
          </Button>
        </form>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>Example tickets: <button type="button" onClick={() => { setTicketId('CIV-2026-8941'); setQueriedId('CIV-2026-8941'); }} className="underline hover:text-brand-500">CIV-2026-8941</button>, <button type="button" onClick={() => { setTicketId('CIV-2026-4102'); setQueriedId('CIV-2026-4102'); }} className="underline hover:text-brand-500">CIV-2026-4102</button></span>
          <span className="hidden sm:inline">Updated in real-time</span>
        </div>
      </Card>

      {queriedId ? (
        <div className="space-y-6 animate-fade-in">
          {/* Mock grievance record display */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded">
                    {queriedId}
                  </span>
                  <StatusBadge status="In Progress" />
                  <PriorityBadge priority="High" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  Large hazardous pothole near City Center Metro Pillar 42
                </h2>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-xs text-slate-400">Logged on</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Oct 01, 2026 &bull; 09:30 AM
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400">Department</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  Roads & Infrastructure (PWD)
                </p>
              </div>
              <div>
                <span className="text-slate-400">SLA Resolution Target</span>
                <p className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                  48 Hours (Remaining: 21h 14m)
                </p>
              </div>
              <div>
                <span className="text-slate-400">Assigned Field Officer</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  Er. Rajesh Verma (Ward 4)
                </p>
              </div>
            </div>

            {/* Lifecycle Timeline */}
            <div className="pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Redressal Audit Trail
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Grievance Lodged by Citizen
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      Citizen reported complaint with attached geotagged photos.
                    </p>
                    <span className="text-[10px] text-slate-400">Oct 01, 2026 - 09:30 AM</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      AI Classification & Department Routing
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      Auto-detected department "ROADS" and priority "High" based on pothole hazard keywords.
                    </p>
                    <span className="text-[10px] text-slate-400">Oct 01, 2026 - 09:31 AM</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Assigned to Ward Engineer
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      Field team inspection scheduled for asphalt patch repair.
                    </p>
                    <span className="text-[10px] text-slate-400">Oct 01, 2026 - 11:15 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <EmptyState
          icon={FileSearch}
          title="No Ticket Queried Yet"
          description="Enter a valid grievance reference ID above to track the complete resolution lifecycle and field officer actions."
        />
      )}
    </div>
  );
};

export default Track;
