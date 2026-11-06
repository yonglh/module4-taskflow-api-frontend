import { useState } from 'react'
import TaskForm from './TaskForm.jsx'

function TaskItem({ task, disabled, onEdit, onComplete, onDelete }) {
  const [editing, setEditing] = useState(false)

  async function save(title) {
    const saved = await onEdit(task, title)
    if (saved) setEditing(false)
    return saved
  }

  return (
    <li className="task-item">
      {editing ? (
        <TaskForm
          initialTitle={task.title}
          submitLabel="Save"
          disabled={disabled}
          onSubmit={save}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <span className={`task-title${task.completed ? ' completed' : ''}`}>
            {task.title}
          </span>
          <span className="task-status">
            {task.completed ? 'Completed' : 'Pending'}
          </span>
          <div className="task-actions" role="group" aria-label={`Actions for ${task.title}`}>
            <button type="button" disabled={disabled} onClick={() => setEditing(true)}>
              Edit
            </button>
            <button
              type="button"
              disabled={disabled || task.completed}
              onClick={() => onComplete(task.id)}
            >
              Complete
            </button>
            <button type="button" disabled={disabled} onClick={() => onDelete(task.id)}>
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  )
}

export default TaskItem
