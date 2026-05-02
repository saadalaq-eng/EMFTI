import { useEffect } from 'react'
import { X, BookOpen, User, Calendar, Paperclip, Clock } from 'lucide-react'
import { format, isPast, isToday, parseISO, differenceInDays } from 'date-fns'
import { TASK_TYPES } from '../../utils/taskTypes'
import TaskTypeBadge from './TaskTypeBadge'

function StatusPill({ due }) {
  const overdue = isPast(due) && !isToday(due)
  const dueToday = isToday(due)
  const daysLeft = differenceInDays(due, new Date())

  if (overdue) {
    const daysAgo = differenceInDays(new Date(), due)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        {daysAgo === 1 ? 'Overdue by 1 day' : `Overdue by ${daysAgo} days`}
      </span>
    )
  }
  if (dueToday) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
        Due Today
      </span>
    )
  }
  if (daysLeft === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Due Tomorrow
      </span>
    )
  }
  if (daysLeft <= 7) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
        <Clock size={11} />
        {daysLeft} days left
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Upcoming
    </span>
  )
}

export default function TaskDetailModal({ task, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!task) return null

  const due = parseISO(task.dueDate)
  const config = TASK_TYPES[task.type]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-white w-full sm:max-w-lg sm:mx-4 sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Colored top accent bar */}
        <div
          className="h-1 w-full shrink-0"
          style={{ backgroundColor: config?.hex ?? '#6366f1' }}
        />

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <TaskTypeBadge type={task.type} size="md" />
            <StatusPill due={due} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 pb-8 space-y-5">
          {/* Title */}
          <h2
            className="text-xl font-bold text-gray-900 leading-snug"
            dir="auto"
          >
            {task.title}
          </h2>

          {/* Details grid */}
          <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <BookOpen size={15} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Course</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5" dir="auto">
                  {task.courseName}
                </p>
                <p className="text-xs text-gray-400 font-mono">{task.courseCode}</p>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <User size={15} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Instructor</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5" dir="auto">
                  {task.doctor}
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <Calendar size={15} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Due Date</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {format(due, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
                Notes
              </p>
              <p
                className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-2xl p-4"
                dir="auto"
              >
                {task.description}
              </p>
            </div>
          )}

          {/* Attachment */}
          {task.attachmentUrl && (
            <a
              href={task.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-colors group"
            >
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <Paperclip size={16} className="text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-indigo-400 font-medium">Attachment</p>
                <p className="text-sm font-semibold text-indigo-700 truncate mt-0.5">
                  {task.attachmentName ?? 'Download file'}
                </p>
              </div>
              <span className="text-xs text-indigo-400 group-hover:text-indigo-600 shrink-0">
                Open →
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
