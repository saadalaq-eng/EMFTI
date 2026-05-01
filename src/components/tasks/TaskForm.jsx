import { useState, useEffect } from 'react'
import { TASK_TYPE_OPTIONS } from '../../utils/taskTypes'

const EMPTY = { courseId: '', title: '', dueDate: '', type: '', description: '' }

const inputCls =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

export default function TaskForm({ courses, initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    setForm(
      initial
        ? {
            courseId: initial.courseId ?? '',
            title: initial.title ?? '',
            dueDate: initial.dueDate ?? '',
            type: initial.type ?? '',
            description: initial.description ?? '',
          }
        : EMPTY,
    )
  }, [initial])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const course = courses.find((c) => c.id === form.courseId)
    if (!course) return
    onSubmit({
      ...form,
      courseName: course.name,
      courseCode: course.code,
      doctor: course.doctor,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>
          Course <span className="text-red-400">*</span>
        </label>
        <select value={form.courseId} onChange={set('courseId')} required className={inputCls}>
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>
          Task Title <span className="text-red-400">*</span>
        </label>
        <input
          dir="auto"
          value={form.title}
          onChange={set('title')}
          required
          placeholder="e.g. Chapter 3 Project"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>
            Type <span className="text-red-400">*</span>
          </label>
          <select value={form.type} onChange={set('type')} required className={inputCls}>
            <option value="">Select type</option>
            {TASK_TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>
            Due Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={form.dueDate}
            onChange={set('dueDate')}
            required
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>
          Description{' '}
          <span className="text-gray-400 font-normal text-xs">(optional)</span>
        </label>
        <textarea
          dir="auto"
          value={form.description}
          onChange={set('description')}
          rows={3}
          placeholder="Extra notes or instructions..."
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {loading ? 'Saving...' : initial ? 'Save Changes' : 'Add Task'}
        </button>
      </div>
    </form>
  )
}
