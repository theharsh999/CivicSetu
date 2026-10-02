/**
 * Formats a Date or ISO timestamp into a concise human-readable relative time string.
 * e.g., "just now", "5m ago", "2h ago", "3d ago", "2w ago"
 *
 * @param {string|Date} dateInput
 * @returns {string}
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return 'just now';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 45) return 'just now';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Formats full friendly date with time
 * e.g. "03 Oct 2026, 04:30 PM"
 */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Friendly deadline display
 * e.g. "Expected by Tomorrow at 4:00 PM"
 */
export const formatExpectedDate = (dateInput) => {
  if (!dateInput) return 'Expected in 48 hours';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';

  const now = new Date();
  const isPast = date.getTime() < now.getTime();
  const diffHours = Math.abs(Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60)));

  if (isPast) {
    return `Overdue by ${diffHours} hours`;
  }

  if (diffHours < 24) {
    return `Due today by ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  }

  const days = Math.floor(diffHours / 24);
  return `Expected within ${days} day${days > 1 ? 's' : ''} (${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})`;
};
