import { format, parseISO, isToday, isPast } from 'date-fns'
import { CheckSquare } from 'lucide-react'
import TaskCard from './TaskCard'
import EmptyState from '../ui/EmptyState'

function groupByDate(tasks) {
  const groups = {}
  tasks.forEach((task) => {
    if (!groups[task.dueDate]) groups[task.dueDate] = []
    groups[task.dueDate].push(task)
  })
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}

function DateLabel({ dateStr }) {
  const date = parseISO(dateStr)
  const today = isToday(date)
  const overdue = isPast(date) && !today
  return (
    <div className="flex items-center gap-2 mb-3">
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          overdue ? 'bg-red-400' : today ? 'bg-indigo-500' : 'bg-gray-300'
        }`}
      />
      <span
        className={`text-sm font-semibold ${
          overdue ? 'text-red-500' : today ? 'text-indigo-600' : 'text-gray-600'
        }`}
      >
        {today ? 'Today' : format(date, 'EEEE, MMMM d, yyyy')}
      </span>
    </div>
  )
}

export default function TaskList({ tasks, onEdit, onDelete, isAdmin }) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No tasks found"
        description="Tasks will appear here once the admin adds them."
      />
    )
  }

  const groups = groupByDate(tasks)

  return (
    <div className="space-y-7">
      {groups.map(([date, dateTasks]) => (
        <div key={date}>
          <DateLabel dateStr={date} />
          <div className="space-y-3 pl-4 border-l-2 border-gray-100">
            {dateTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
