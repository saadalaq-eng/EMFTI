export const TASK_TYPES = {
  presentation: {
    label: 'Presentation',
    className: 'bg-purple-100 text-purple-700 border border-purple-200',
    dot: 'bg-purple-500',
    hex: '#7c3aed',
  },
  project: {
    label: 'Project',
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
    hex: '#2563eb',
  },
  midterm: {
    label: 'Mid-term Exam',
    className: 'bg-amber-100 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
    hex: '#d97706',
  },
  final: {
    label: 'Final Exam',
    className: 'bg-red-100 text-red-700 border border-red-200',
    dot: 'bg-red-500',
    hex: '#dc2626',
  },
  submission: {
    label: 'Submission',
    className: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
    hex: '#059669',
  },
}

export const TASK_TYPE_OPTIONS = Object.entries(TASK_TYPES).map(([value, config]) => ({
  value,
  label: config.label,
}))
