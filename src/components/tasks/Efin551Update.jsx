import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { writeBatch, doc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'

// One-off schedule update for EFIN 551 (Leadership & Strategy), taken from the
// course's official submission list. The card hides itself once applied.
const COURSE_ID = 'cpa8RN2YWXV0jFYxboJc'

const DELETE_IDS = [
  'g7fCWtbNVdylZsGd2g3n', // Board Resolution (T5)
  '85F9mNWSRZhyImToL1Mh', // Post-Debate Decision and Vote (T7)
  'ZHHYLulYg2PlPum3kiw2', // Team Reflection (T8)
  'BvGSJXKlYINC7jqMFIM5', // Peer Evaluation (T9)
  'nPDY26oW5tE0L0Cc79jx', // Contribution Log (T10)
]

const PROPOSAL_ID = 'lwW0heq16gUCK1lUefB9' // Term Paper Proposal
const PROPOSAL_DUE = '2026-11-20'

const NEW_TASK = {
  title: 'Individual Decision Observation / Diagnosis',
  dueDate: '2026-10-09',
  type: 'submission',
  description: '',
}

function pendingChanges(tasks) {
  const ids = new Set(tasks.map((t) => t.id))
  const proposal = tasks.find((t) => t.id === PROPOSAL_ID)
  return {
    deletes: DELETE_IDS.filter((id) => ids.has(id)),
    moveProposal: !!proposal && proposal.dueDate !== PROPOSAL_DUE,
    addNew: !tasks.some((t) => t.courseId === COURSE_ID && t.title === NEW_TASK.title),
  }
}

export default function Efin551Update({ tasks, courses }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const course = courses.find((c) => c.id === COURSE_ID)
  const changes = pendingChanges(tasks)
  const count = changes.deletes.length + changes.moveProposal + changes.addNew

  if (!course || count === 0) return null

  const apply = async () => {
    if (!confirm(`Apply ${count} change${count !== 1 ? 's' : ''} to EFIN 551?`)) return
    setBusy(true)
    setError(null)
    try {
      const batch = writeBatch(db)
      changes.deletes.forEach((id) => batch.delete(doc(db, 'tasks', id)))
      if (changes.moveProposal) {
        batch.update(doc(db, 'tasks', PROPOSAL_ID), { dueDate: PROPOSAL_DUE })
      }
      if (changes.addNew) {
        batch.set(doc(collection(db, 'tasks')), {
          ...NEW_TASK,
          courseId: COURSE_ID,
          courseName: course.name,
          courseCode: course.code,
          doctor: course.doctor,
          createdAt: serverTimestamp(),
        })
      }
      await batch.commit()
    } catch (err) {
      console.error('EFIN 551 update failed:', err)
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mb-5 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-sm text-indigo-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">EFIN 551 schedule update ready</p>
          <ul className="mt-1 text-xs text-indigo-700 list-disc list-inside">
            {changes.addNew && <li>Add “{NEW_TASK.title}” (Oct 9)</li>}
            {changes.moveProposal && <li>Move Term Paper Proposal to Nov 20</li>}
            {changes.deletes.length > 0 && (
              <li>Remove {changes.deletes.length} old submissions (T5, T7, T8, T9, T10)</li>
            )}
          </ul>
        </div>
        <button
          onClick={apply}
          disabled={busy}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
          {busy ? 'Applying…' : 'Apply update'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">Failed: {error}</p>}
    </div>
  )
}
