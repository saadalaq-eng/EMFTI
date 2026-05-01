import { useState } from 'react'
import { Plus, BookOpen, Pencil, Trash2 } from 'lucide-react'
import { useCourses } from '../../hooks/useCourses'
import Modal from '../../components/ui/Modal'
import CourseForm from '../../components/courses/CourseForm'
import EmptyState from '../../components/ui/EmptyState'

export default function Courses() {
  const { courses, loading, addCourse, updateCourse, deleteCourse } = useCourses()
  const [modal, setModal] = useState(null) // null | { mode: 'add' | 'edit', course?: {} }
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (data) => {
    setSaving(true)
    try {
      if (modal.mode === 'add') await addCourse(data)
      else await updateCourse(modal.course.id, data)
      setModal(null)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this course? Tasks linked to it will not be deleted.')) return
    await deleteCourse(id)
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-400 text-sm mt-1">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add' })}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={15} />
          Add Course
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Add your first course to get started."
        />
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg shrink-0">
                    {course.code}
                  </span>
                  <h3 className="font-semibold text-gray-900 text-sm truncate" dir="auto">
                    {course.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-400 mt-1" dir="auto">
                  Dr. {course.doctor}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setModal({ mode: 'edit', course })}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? 'Add Course' : 'Edit Course'}
      >
        <CourseForm
          initial={modal?.course}
          onSubmit={handleSubmit}
          onCancel={() => setModal(null)}
          loading={saving}
        />
      </Modal>
    </div>
  )
}
