import { useEffect, useRef, useState } from 'react'
import * as tasksApi from '../api/tasksApi.js'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [operation, setOperation] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const operationInProgress = useRef(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadTasks() {
      try {
        const data = await tasksApi.getTasks(controller.signal)
        if (!controller.signal.aborted) {
          setTasks(data)
          setLoaded(true)
        }
      } catch (error) {
        if (!controller.signal.aborted) setError(error.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadTasks()
    return () => controller.abort()
  }, [reloadKey])

  function retry() {
    setError('')
    setLoading(true)
    setReloadKey((current) => current + 1)
  }

  async function perform(name, action) {
    if (operationInProgress.current) return false
    operationInProgress.current = true
    setOperation(name)
    setError('')

    try {
      await action()
      return true
    } catch (error) {
      setError(error.message)
      return false
    } finally {
      operationInProgress.current = false
      setOperation(null)
    }
  }

  function addTask(title) {
    return perform('create', async () => {
      const task = await tasksApi.createTask(title)
      setTasks((current) => [...current, task])
      setSummary('')
    })
  }

  function editTask(task, title) {
    return perform('update', async () => {
      const updated = await tasksApi.updateTask(task.id, {
        title,
        completed: task.completed,
      })
      setTasks((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setSummary('')
    })
  }

  function completeTask(id) {
    return perform('complete', async () => {
      const updated = await tasksApi.completeTask(id)
      setTasks((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setSummary('')
    })
  }

  function deleteTask(id) {
    return perform('delete', async () => {
      await tasksApi.deleteTask(id)
      setTasks((current) => current.filter((task) => task.id !== id))
      setSummary('')
    })
  }

  function generateSummary() {
    return perform('summary', async () => {
      setSummary('')
      setSummary(await tasksApi.getTaskSummary())
    })
  }

  return {
    tasks,
    summary,
    error,
    loading,
    loaded,
    operation,
    retry,
    addTask,
    editTask,
    completeTask,
    deleteTask,
    generateSummary,
  }
}
