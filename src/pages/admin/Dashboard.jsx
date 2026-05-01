import { BookOpen, ClipboardList, AlertCircle, TrendingUp } from 'lucide-react'
import { isPast, isToday, parseISO, isThisWeek } from 'date-fns'
import { useTasks } from '../../hooks/useTasks'
import { useCourses } from '../../hooks/useCourses'
import { TASK_TYPES } from '../../utils/taskTypes'
import TaskTypeBadge from '../../components/tasks/TaskTypeBadge'

function StatCard({ icon: Icon, label, value, sub, colorClass }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorClass}`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { tasks } = useTasks()
  const { courses } = useCourses()

  const upcoming = tasks.filter(
    (t) => !isPast(parseISO(t.dueDate)) || isToday(parseISO(t.dueDate)),
  )
  const overdue = tasks.filter(
    (t) => isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)),
  )
  const thisWeek = tasks.filter((t) =>
    isThisWeek(parseISO(t.dueDate), { weekStartsOn: 0 }),
  )

  const byType = Object.keys(TASK_TYPES)
    .map((key) => ({ type: key, count: tasks.filter((t) => t.type === key).length }))
    .filter((x) => x.count > 0)

  return (
    <div className="p-6 md:p-8">
      <div className="mb-7">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Overview of courses and tasks</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={BookOpen}
          label="Courses"
          value={courses.length}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={ClipboardList}
          label="Total Tasks"
          value={tasks.length}
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Upcoming"
          value={upcoming.length}
          sub={`${thisWeek.length} this week`}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={AlertCircle}
          label="Overdue"
          value={overdue.length}
          colorClass={overdue.length > 0 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}
        />
      </div>

      {byType.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm">Tasks by Type</h2>
          <div className="space-y-3">
            {byType.map(({ type, count }) => (
              <div key={type} className="flex items-center justify-between gap-3">
                <TaskTypeBadge type={type} />
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${TASK_TYPES[type].dot}`}
                      style={{ width: `${(count / tasks.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-4 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
