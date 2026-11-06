import TaskForm from './components/TaskForm.jsx'
import TaskList from './components/TaskList.jsx'
import TaskSummary from './components/TaskSummary.jsx'
import { useTasks } from './hooks/useTasks.js'
import './tasks.css'

function TasksPage() {
  const {
    tasks, summary, error, loading, loaded, operation,
    retry, addTask, editTask, completeTask, deleteTask, generateSummary,
  } = useTasks()
  const disabled = loading || !loaded || operation !== null

  return (
    <>
      <header>
        <h1>Taskflow</h1>
        <p>Manage your tasks using the Module 4 API.</p>
      </header>

      {error && <p className="task-error" role="alert">{error}</p>}

      <TaskForm disabled={disabled} onSubmit={addTask} />

      {loading && <p role="status">Loading tasks...</p>}
      {!loading && !loaded && (
        <button type="button" onClick={retry}>Retry loading tasks</button>
      )}

      {loaded && (
        <>
          <TaskList
            tasks={tasks}
            disabled={disabled}
            onEdit={editTask}
            onComplete={completeTask}
            onDelete={deleteTask}
          />
          <TaskSummary
            summary={summary}
            loading={operation === 'summary'}
            disabled={disabled}
            onGenerate={generateSummary}
          />
        </>
      )}

      {operation && (
        <p role="status">
          {operation === 'summary' ? 'Generating AI summary...' : 'Saving changes...'}
        </p>
      )}
    </>
  )
}

export default TasksPage
