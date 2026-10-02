import React from 'react';
import { Bell } from 'lucide-react';
import PlaceholderView from './PlaceholderView';

export { default as OfficerDashboard } from './OfficerDashboard';
export { default as OfficerAssigned } from './OfficerAssigned';
export { default as OfficerStats } from './OfficerStats';
export { default as GrievanceWorkbench } from './GrievanceWorkbench';

export const OfficerNotifications = () => (
  <PlaceholderView
    title="Officer Priority Alerts"
    subtitle="Immediate notifications for critical high-priority tickets, citizen escalations, and ward broadcasts."
    icon={Bell}
    emptyTitle="All Clear"
    emptyDesc="No critical SLA breach warnings at this moment."
  />
);
