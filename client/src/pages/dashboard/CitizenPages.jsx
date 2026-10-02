import React from 'react';
import { Search } from 'lucide-react';
import PlaceholderView from './PlaceholderView';

export { default as CitizenLodge } from './CitizenLodge';
export { default as CitizenGrievances } from './CitizenGrievances';
export { default as GrievanceDetail } from './GrievanceDetail';
export { default as NotificationsPage, default as CitizenNotifications } from './NotificationsPage';

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
