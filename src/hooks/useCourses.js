import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setCourses(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Courses snapshot error:', err)
        setError(err)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [])

  const addCourse = (data) =>
    addDoc(collection(db, 'courses'), { ...data, createdAt: serverTimestamp() })

  const updateCourse = (id, data) =>
    updateDoc(doc(db, 'courses', id), data)

  const deleteCourse = (id) =>
    deleteDoc(doc(db, 'courses', id))

  return { courses, loading, error, addCourse, updateCourse, deleteCourse }
}
