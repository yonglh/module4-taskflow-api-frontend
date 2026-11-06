import TaskItem from './TaskItem.jsx'

function TaskList({ tasks, disabled, onEdit, onComplete, onDelete }) {
  if (tasks.length === 0) return <p>No tasks yet. Add your first task above.</p>

  return (
    <ul className="task-list" aria-label="Tasks">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          disabled={disabled}
          onEdit={onEdit}
          onComplete={onComplete}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

export default TaskList
