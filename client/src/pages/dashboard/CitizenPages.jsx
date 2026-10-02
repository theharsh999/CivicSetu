import React from 'react';
import { PlusCircle, FileText, Search, Bell } from 'lucide-react';
import PlaceholderView from './PlaceholderView';

export const CitizenLodge = () => (
  <PlaceholderView
    title="Lodge Grievance"
    subtitle="Submit a municipal complaint with description, photo upload, and GPS location."
    icon={PlusCircle}
    emptyTitle="Grievance Lodging Form"
    emptyDesc="The multi-step AI-assisted grievance form with instant category classification will be activated in Prompt 3."
    actionLabel="Return to Citizen Overview"
    onAction={() => window.location.href = '/dashboard/citizen'}
  />
);

export const CitizenGrievances = () => (
  <PlaceholderView
    title="My Grievances"
    subtitle="View, filter, and review the history of all complaints submitted from your account."
    icon={FileText}
    emptyTitle="No Grievances Submitted Yet"
    emptyDesc="You haven't lodged any municipal complaints yet. When you do, their real-time status and officer proof will appear here."
    actionLabel="Lodge a Grievance"
    onAction={() => window.location.href = '/dashboard/citizen/lodge'}
  />
);

export const CitizenTrack = () => (
  <PlaceholderView
    title="Track Grievance"
    subtitle="Inspect live resolution timestamps, SLA limits, and nodal officer notes."
    icon={Search}
    emptyTitle="Ticket Status Tracker"
    emptyDesc="Interactive grievance tracker with timeline breadcrumbs and stage-by-stage status audits."
    actionLabel="Open Public Tracker"
    onAction={() => window.location.href = '/track'}
  />
);

export const CitizenNotifications = () => (
  <PlaceholderView
    title="Citizen Notifications"
    subtitle="Real-time SMS, email, and portal alerts regarding ticket progression."
    icon={Bell}
    emptyTitle="No Unread Notifications"
    emptyDesc="You will receive alerts when an officer is assigned, status changes to In-Progress, or when verification is requested."
  />
);
