import { Calendar, BookOpen, Paperclip, ChevronRight } from 'lucide-react'
import { format, isPast, isToday, parseISO } from 'date-fns'
import TaskTypeBadge from './TaskTypeBadge'

export default function TaskCard({ task, onSelect, onEdit, onDelete, isAdmin }) {
  const due = parseISO(task.dueDate)
  const overdue = isPast(due) && !isToday(due)
  const dueToday = isToday(due)

  return (
    <div
      className={`bg-white rounded-2xl border transition-all active:scale-[0.98] ${
        overdue
          ? 'border-red-100'
          : dueToday
          ? 'border-indigo-200'
          : 'border-gray-100'
      }`}
    >
      {/* Tappable area — full card for students, content area for admin */}
      <button
        onClick={() => onSelect?.(task)}
        className="w-full text-left p-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Top row: badge + status */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <TaskTypeBadge type={task.type} />
              {overdue && (
                <span className="text-xs text-red-500 font-semibold">Overdue</span>
              )}
              {dueToday && (
                <span className="text-xs text-indigo-600 font-semibold">Due Today</span>
              )}
              {task.attachmentUrl && (
                <span className="text-xs text-gray-300">
                  <Paperclip size={11} />
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              className="font-semibold text-gray-900 text-[15px] leading-snug"
              dir="auto"
            >
              {task.title}
            </h3>

            {/* Course + date */}
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <BookOpen size={11} className="shrink-0" />
                <span className="font-mono">{task.courseCode}</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={11} className="shrink-0" />
                <span className={overdue ? 'text-red-400' : dueToday ? 'text-indigo-500' : ''}>
                  {format(due, 'EEE, MMM d')}
                </span>
              </span>
            </div>
          </div>

          {/* Chevron — only shown to students */}
          {!isAdmin && (
            <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" />
          )}
        </div>
      </button>

      {/* Admin action row — separate from the tappable card area */}
      {isAdmin && (
        <div className="flex gap-1 px-4 pb-3 -mt-1">
          <button
            onClick={() => onEdit?.(task)}
            className="px-3 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors text-xs font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete?.(task.id)}
            className="px-3 py-1 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors text-xs font-medium"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
