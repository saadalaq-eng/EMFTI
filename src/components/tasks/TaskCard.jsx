import { Calendar, BookOpen, User } from 'lucide-react'
import { format, isPast, isToday, parseISO } from 'date-fns'
import TaskTypeBadge from './TaskTypeBadge'

export default function TaskCard({ task, onEdit, onDelete, isAdmin }) {
  const due = parseISO(task.dueDate)
  const overdue = isPast(due) && !isToday(due)
  const dueToday = isToday(due)

  return (
    <div
      className={`bg-white rounded-2xl border p-4 transition-shadow active:scale-[0.99] ${
        overdue
          ? 'border-red-100 shadow-red-50'
          : dueToday
          ? 'border-indigo-200'
          : 'border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <TaskTypeBadge type={task.type} />
            {overdue && (
              <span className="text-xs text-red-500 font-semibold">Overdue</span>
            )}
            {dueToday && (
              <span className="text-xs text-indigo-600 font-semibold">Due Today</span>
            )}
          </div>

          {/* Title */}
          <h3
            className="font-semibold text-gray-900 text-[15px] leading-snug"
            dir="auto"
          >
            {task.title}
          </h3>

          {/* Meta */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <BookOpen size={12} className="shrink-0" />
              <span dir="auto" className="truncate">
                {task.courseName}
              </span>
              <span className="text-gray-200">·</span>
              <span className="font-mono shrink-0">{task.courseCode}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <User size={12} className="shrink-0" />
              <span dir="auto">{task.doctor}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar size={12} className="shrink-0" />
              <span className={overdue ? 'text-red-400' : dueToday ? 'text-indigo-500' : ''}>
                {format(due, 'EEEE, MMM d, yyyy')}
              </span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p
              className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed"
              dir="auto"
            >
              {task.description}
            </p>
          )}
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="px-2.5 py-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors text-xs font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="px-2.5 py-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors text-xs font-medium"
            >
              Del
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
