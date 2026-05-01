import { useState, useMemo } from 'react'
import { List, CalendarDays } from 'lucide-react'
import Header from '../components/layout/Header'
import TaskList from '../components/tasks/TaskList'
import CalendarView from '../components/tasks/CalendarView'
import { useTasks } from '../hooks/useTasks'
import { useCourses } from '../hooks/useCourses'
import { TASK_TYPES } from '../utils/taskTypes'

export default function StudentHome() {
  const { tasks, loading } = useTasks()
  const { courses } = useCourses()
  const [view, setView] = useState('list')
  const [filterType, setFilterType] = useState('all')
  const [filterCourse, setFilterCourse] = useState('all')

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false
      if (filterCourse !== 'all' && t.courseId !== filterCourse) return false
      return true
    })
  }, [tasks, filterType, filterCourse])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              view === 'list'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List size={14} />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              view === 'calendar'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CalendarDays size={14} />
            <span className="hidden sm:inline">Calendar</span>
          </button>
        </div>
      </Header>

      {/* Filter chips — horizontal scroll, no wrap */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-30">
        <div className="max-w-2xl mx-auto">
          {/* Task type filter */}
          <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setFilterType('all')}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                filterType === 'all'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              All
            </button>
            {Object.entries(TASK_TYPES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilterType(filterType === key ? 'all' : key)}
                className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                  filterType === key
                    ? config.className
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                {config.label}
              </button>
            ))}
          </div>

          {/* Course filter — only shown if >1 course exists */}
          {courses.length > 1 && (
            <div className="flex items-center gap-2 px-4 pb-2.5 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilterCourse('all')}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                  filterCourse === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                All Courses
              </button>
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilterCourse(filterCourse === c.id ? 'all' : c.id)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                    filterCourse === c.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {c.code}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {/* Task count */}
        <p className="text-xs text-gray-400 font-medium mb-4">
          {loading ? 'Loading...' : `${filtered.length} task${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : view === 'list' ? (
          <TaskList tasks={filtered} isAdmin={false} />
        ) : (
          <CalendarView tasks={filtered} />
        )}
      </main>

      {/* Footer link to admin */}
      <div className="pb-6 text-center">
        <a
          href="#/admin/login"
          className="text-xs text-gray-300 hover:text-gray-400 transition-colors"
        >
          Admin
        </a>
      </div>
    </div>
  )
}
