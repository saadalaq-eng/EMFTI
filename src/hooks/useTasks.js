import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('dueDate', 'asc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTasks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        console.error('Tasks snapshot error:', err)
        setError(err)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [])

  const addTask = (data) =>
    addDoc(collection(db, 'tasks'), { ...data, createdAt: serverTimestamp() })

  const updateTask = (id, data) =>
    updateDoc(doc(db, 'tasks', id), data)

  const deleteTask = (id) =>
    deleteDoc(doc(db, 'tasks', id))

  return { tasks, loading, error, addTask, updateTask, deleteTask }
}
