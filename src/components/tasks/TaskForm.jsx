import { useState, useEffect, useRef } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../../lib/firebase'
import { TASK_TYPE_OPTIONS } from '../../utils/taskTypes'
import { Paperclip, X, Upload } from 'lucide-react'

const EMPTY = { courseId: '', title: '', dueDate: '', type: '', description: '' }

const inputCls =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

export default function TaskForm({ courses, initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

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
    setFile(null)
  }, [initial])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) setFile(selected)
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadFile = (taskId) =>
    new Promise((resolve, reject) => {
      const path = `attachments/${taskId}/${Date.now()}_${file.name}`
      const storageRef = ref(storage, path)
      const uploadTask = uploadBytesResumable(storageRef, file)
      uploadTask.on(
        'state_changed',
        (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          resolve({ attachmentUrl: url, attachmentName: file.name })
        },
      )
    })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const course = courses.find((c) => c.id === form.courseId)
    if (!course) return

    setUploading(!!file)

    let attachmentData = {}
    if (file) {
      try {
        const taskId = initial?.id ?? `task_${Date.now()}`
        attachmentData = await uploadFile(taskId)
      } catch {
        setUploading(false)
        return
      }
    }

    setUploading(false)
    onSubmit({
      ...form,
      courseName: course.name,
      courseCode: course.code,
      doctor: course.doctor,
      ...attachmentData,
    })
  }

  const busy = loading || uploading

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

      {/* Attachment */}
      <div>
        <label className={labelCls}>
          Attachment{' '}
          <span className="text-gray-400 font-normal text-xs">(optional)</span>
        </label>

        {/* Keep existing attachment info when editing */}
        {initial?.attachmentName && !file && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 mb-2">
            <Paperclip size={14} className="text-gray-400 shrink-0" />
            <span className="truncate">{initial.attachmentName}</span>
            <span className="text-xs text-gray-400 shrink-0">(current)</span>
          </div>
        )}

        {file ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-700">
            <Paperclip size={14} className="shrink-0" />
            <span className="truncate flex-1">{file.name}</span>
            <button
              type="button"
              onClick={removeFile}
              className="shrink-0 p-0.5 rounded hover:bg-indigo-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
          >
            <Upload size={14} />
            Choose file
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
        />

        {/* Upload progress */}
        {uploading && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
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
          disabled={busy}
          className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {uploading ? `Uploading ${uploadProgress}%` : loading ? 'Saving...' : initial ? 'Save Changes' : 'Add Task'}
        </button>
      </div>
    </form>
  )
}
