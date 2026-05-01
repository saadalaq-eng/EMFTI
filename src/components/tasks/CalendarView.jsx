import { useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday,
  parseISO, isSameDay, addMonths, subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TASK_TYPES } from '../../utils/taskTypes'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarView({ tasks }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const getTasksForDay = (day) =>
    tasks.filter((t) => isSameDay(parseISO(t.dueDate), day))

  const selectedTasks = selectedDate ? getTasksForDay(selectedDate) : []

  const handleDayClick = (day) => {
    setSelectedDate((prev) => (prev && isSameDay(prev, day) ? null : day))
  }

  return (
    <div className="space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setCurrentMonth((m) => subMonths(m, 1)); setSelectedDate(null) }}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors active:bg-gray-200"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <button
            onClick={() => { setCurrentMonth(new Date()); setSelectedDate(null) }}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => { setCurrentMonth((m) => addMonths(m, 1)); setSelectedDate(null) }}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors active:bg-gray-200"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAY_NAMES.map((name, i) => {
            const isFriSat = i === 5 || i === 6
            return (
              <div
                key={name}
                className={`py-2.5 text-center text-[10px] font-bold uppercase tracking-wider ${
                  isFriSat
                    ? 'bg-indigo-50 text-indigo-500'
                    : 'text-gray-400'
                }`}
              >
                {name}
              </div>
            )
          })}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayTasks = getTasksForDay(day)
            const isFriSat = day.getDay() === 5 || day.getDay() === 6
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const today = isToday(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const hasTasks = dayTasks.length > 0

            return (
              <button
                key={idx}
                onClick={() => handleDayClick(day)}
                className={`min-h-[56px] sm:min-h-[72px] p-1.5 flex flex-col items-center border-b border-r border-gray-100 transition-colors last:border-r-0 active:bg-gray-100
                  ${isFriSat ? 'bg-indigo-50/40' : ''}
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isSelected ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-300' : hasTasks ? 'hover:bg-gray-50' : ''}
                `}
              >
                {/* Day number */}
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1
                    ${today ? 'bg-indigo-600 text-white' : 'text-gray-700'}
                  `}
                >
                  {format(day, 'd')}
                </span>

                {/* Task dots — mobile: dots only; sm+: show up to 2 text labels */}
                {hasTasks && (
                  <>
                    {/* Mobile dots */}
                    <div className="flex flex-wrap justify-center gap-0.5 sm:hidden">
                      {dayTasks.slice(0, 4).map((task) => (
                        <span
                          key={task.id}
                          className={`w-1.5 h-1.5 rounded-full ${TASK_TYPES[task.type]?.dot ?? 'bg-gray-400'}`}
                        />
                      ))}
                      {dayTasks.length > 4 && (
                        <span className="text-[9px] text-gray-400 leading-none">
                          +{dayTasks.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Desktop text labels */}
                    <div className="hidden sm:flex flex-col gap-0.5 w-full">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div key={task.id} className="flex items-center gap-1 overflow-hidden">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${TASK_TYPES[task.type]?.dot ?? 'bg-gray-400'}`}
                          />
                          <span className="text-[10px] text-gray-600 truncate leading-tight" dir="auto">
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <span className="text-[10px] text-gray-400 pl-2.5">
                          +{dayTasks.length - 2}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day tasks panel */}
      {selectedDate && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">
              {format(selectedDate, 'EEEE, MMMM d')}
            </h3>
          </div>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-4">No tasks on this day.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {selectedTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 px-4 py-3">
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${TASK_TYPES[task.type]?.dot ?? 'bg-gray-400'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm" dir="auto">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5" dir="auto">
                      {task.courseName} · <span className="font-mono">{task.courseCode}</span>
                    </p>
                    <p className="text-xs text-gray-400" dir="auto">
                      {task.doctor}
                    </p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {TASK_TYPES[task.type]?.label}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed" dir="auto">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-1 pt-1">
        {Object.entries(TASK_TYPES).map(([key, config]) => (
          <span key={key} className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className={`w-2 h-2 rounded-full ${config.dot}`} />
            {config.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[11px] text-indigo-400">
          <span className="w-2 h-2 rounded bg-indigo-100 border border-indigo-200" />
          Study days (Fri/Sat)
        </span>
      </div>
    </div>
  )
}
