import { TASK_TYPES } from '../../utils/taskTypes'

export default function TaskTypeBadge({ type, size = 'sm' }) {
  const config = TASK_TYPES[type]
  if (!config) return null
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.className} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  )
}
