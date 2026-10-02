import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import { Layers } from 'lucide-react';

export const PlaceholderView = ({
  title,
  subtitle,
  icon: Icon = Layers,
  emptyTitle = 'Feature Ready for Data',
  emptyDesc = 'This section will be wired to active backend data in upcoming steps.',
  actionLabel,
  onAction,
  actions,
}) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={actions}
      />
      <EmptyState
        icon={Icon}
        title={emptyTitle}
        description={emptyDesc}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    </div>
  );
};

export default PlaceholderView;
