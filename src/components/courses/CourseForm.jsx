import { useState, useEffect } from 'react'

const EMPTY = { name: '', code: '', doctor: '' }

const inputCls =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

export default function CourseForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    setForm(
      initial
        ? { name: initial.name ?? '', code: initial.code ?? '', doctor: initial.doctor ?? '' }
        : EMPTY,
    )
  }, [initial])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className={labelCls}>
          Course Name <span className="text-red-400">*</span>
        </label>
        <input
          dir="auto"
          value={form.name}
          onChange={set('name')}
          required
          placeholder="e.g. Data Structures"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>
          Course Code <span className="text-red-400">*</span>
        </label>
        <input
          value={form.code}
          onChange={set('code')}
          required
          placeholder="e.g. CS301"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>
          Doctor / Instructor <span className="text-red-400">*</span>
        </label>
        <input
          dir="auto"
          value={form.doctor}
          onChange={set('doctor')}
          required
          placeholder="e.g. Dr. Ahmad"
          className={inputCls}
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
          {loading ? 'Saving...' : initial ? 'Save Changes' : 'Add Course'}
        </button>
      </div>
    </form>
  )
}
