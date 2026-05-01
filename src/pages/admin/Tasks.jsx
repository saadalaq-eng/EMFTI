import { useState } from 'react'
import { Plus, ClipboardList, Pencil, Trash2 } from 'lucide-react'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { useTasks } from '../../hooks/useTasks'
import { useCourses } from '../../hooks/useCourses'
import Modal from '../../components/ui/Modal'
import TaskForm from '../../components/tasks/TaskForm'
import TaskTypeBadge from '../../components/tasks/TaskTypeBadge'
import EmptyState from '../../components/ui/EmptyState'

export default function Tasks() {
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks()
  const { courses } = useCourses()
  const [modal, setModal] = useState(null) // null | { mode: 'add' | 'edit', task?: {} }
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (data) => {
    setSaving(true)
    try {
      if (modal.mode === 'add') await addTask(data)
      else await updateTask(modal.task.id, data)
      setModal(null)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    await deleteTask(id)
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-400 text-sm mt-1">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add' })}
          disabled={courses.length === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={15} />
          Add Task
        </button>
      </div>

      {courses.length === 0 && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          Add at least one course before creating tasks.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No tasks yet"
          description="Add your first task using the button above."
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const due = parseISO(task.dueDate)
            const overdue = isPast(due) && !isToday(due)
            const dueToday = isToday(due)
            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border p-4 flex items-start justify-between gap-3 ${
                  overdue ? 'border-red-100' : 'border-gray-100'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <TaskTypeBadge type={task.type} />
                    <span className="text-xs font-mono font-medium text-gray-400">
                      {task.courseCode}
                    </span>
                    {overdue && (
                      <span className="text-xs text-red-500 font-semibold">Overdue</span>
                    )}
                    {dueToday && (
                      <span className="text-xs text-indigo-600 font-semibold">Today</span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm truncate" dir="auto">
                    {task.title}
                  </p>
                  <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-gray-400">
                    <span dir="auto">{task.courseName}</span>
                    <span dir="auto">Dr. {task.doctor}</span>
                    <span
                      className={
                        overdue ? 'text-red-400' : dueToday ? 'text-indigo-500' : ''
                      }
                    >
                      {format(due, 'EEE, MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setModal({ mode: 'edit', task })}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? 'Add Task' : 'Edit Task'}
      >
        <TaskForm
          courses={courses}
          initial={modal?.task}
          onSubmit={handleSubmit}
          onCancel={() => setModal(null)}
          loading={saving}
        />
      </Modal>
    </div>
  )
}
