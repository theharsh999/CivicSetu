/**
 * CivicSetu Shared Constants
 * Keep in sync between client/src/utils/constants.js and server/utils/constants.js
 */

export const ROLES = {
  CITIZEN: 'citizen',
  OFFICER: 'officer',
  ADMIN: 'admin'
};

export const ROLE_LIST = [ROLES.CITIZEN, ROLES.OFFICER, ROLES.ADMIN];

export const STATUSES = [
  'Submitted',
  'AI Classified',
  'Assigned',
  'In Progress',
  'Awaiting Verification',
  'Resolved',
  'Closed',
  'Escalated'
];

export const ALLOWED_TRANSITIONS = {
  'Submitted': ['AI Classified', 'Assigned'],
  'AI Classified': ['Assigned'],
  'Assigned': ['In Progress', 'Escalated'],
  'In Progress': ['Awaiting Verification', 'Escalated'],
  'Awaiting Verification': ['Resolved', 'In Progress'],
  'Resolved': ['Closed', 'In Progress'],
  'Closed': [],
  'Escalated': ['In Progress', 'Assigned']
};

export const STATUS_CONFIG = {
  'Submitted': {
    label: 'Submitted',
    color: 'slate',
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700'
  },
  'AI Classified': {
    label: 'AI Classified',
    color: 'indigo',
    bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800'
  },
  'Assigned': {
    label: 'Assigned',
    color: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800'
  },
  'In Progress': {
    label: 'In Progress',
    color: 'amber',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800'
  },
  'Awaiting Verification': {
    label: 'Awaiting Verification',
    color: 'purple',
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800'
  },
  'Resolved': {
    label: 'Resolved',
    color: 'emerald',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800'
  },
  'Closed': {
    label: 'Closed',
    color: 'zinc',
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-300 dark:border-zinc-700'
  },
  'Escalated': {
    label: 'Escalated',
    color: 'rose',
    bg: 'bg-rose-50 dark:bg-rose-950/50',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800'
  }
};

export const PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
};

export const PRIORITY_LIST = [
  PRIORITIES.LOW,
  PRIORITIES.MEDIUM,
  PRIORITIES.HIGH,
  PRIORITIES.CRITICAL
];

export const PRIORITY_CONFIG = {
  'Low': {
    label: 'Low',
    color: 'emerald',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800'
  },
  'Medium': {
    label: 'Medium',
    color: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800'
  },
  'High': {
    label: 'High',
    color: 'amber',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800'
  },
  'Critical': {
    label: 'Critical',
    color: 'rose',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800'
  }
};

export const SLA_HOURS = {
  'Critical': 24,
  'High': 48,
  'Medium': 96,
  'Low': 168
};

export const DEPARTMENTS = [
  {
    code: 'ROADS',
    name: 'Roads & Infrastructure',
    icon: 'Hammer',
    color: '#d97706', // amber-600
    categories: [
      'Pothole',
      'Damaged Road/Footpath',
      'Road Construction Issue',
      'Broken Signage/Divider'
    ]
  },
  {
    code: 'WATER',
    name: 'Water Supply',
    icon: 'Droplets',
    color: '#0284c7', // sky-600
    categories: [
      'Water Supply Disruption',
      'Low Water Pressure',
      'Contaminated Water',
      'Pipeline Leakage'
    ]
  },
  {
    code: 'ELEC',
    name: 'Electricity & Street Lighting',
    icon: 'Zap',
    color: '#ca8a04', // yellow-600
    categories: [
      'Streetlight Not Working',
      'Exposed/Fallen Wire',
      'Power Outage'
    ]
  },
  {
    code: 'WASTE',
    name: 'Garbage & Waste Management',
    icon: 'Trash2',
    color: '#059669', // emerald-600
    categories: [
      'Garbage Collection',
      'Overflowing Bin',
      'Illegal Dumping',
      'Dead Animal Removal'
    ]
  },
  {
    code: 'DRAIN',
    name: 'Drainage & Sewerage',
    icon: 'Waves',
    color: '#0d9488', // teal-600
    categories: [
      'Drain Blockage',
      'Sewage Overflow',
      'Waterlogging',
      'Open Manhole'
    ]
  },
  {
    code: 'HEALTH',
    name: 'Public Health',
    icon: 'HeartPulse',
    color: '#e11d48', // rose-600
    categories: [
      'Mosquito/Pest Breeding',
      'Unhygienic Food Vendor',
      'Stray Animal Menace',
      'Public Toilet Sanitation'
    ]
  },
  {
    code: 'TRAFFIC',
    name: 'Traffic & Parking',
    icon: 'Car',
    color: '#7c3aed', // violet-600
    categories: [
      'Illegal Parking',
      'Signal Malfunction',
      'Traffic Congestion',
      'Abandoned Vehicle'
    ]
  },
  {
    code: 'PARKS',
    name: 'Parks & Public Spaces',
    icon: 'Trees',
    color: '#65a30d', // lime-600
    categories: [
      'Park Maintenance',
      'Playground Damage',
      'Fallen Tree/Tree Trimming',
      'Public Space Encroachment'
    ]
  },
  {
    code: 'OTHER',
    name: 'Other Municipal Services',
    icon: 'HelpCircle',
    color: '#475569', // slate-600
    categories: [
      'General Complaint',
      'Noise Complaint',
      'Documentation/Service Request'
    ]
  }
];

export const DEPARTMENT_MAP = DEPARTMENTS.reduce((acc, dept) => {
  acc[dept.code] = dept;
  return acc;
}, {});
