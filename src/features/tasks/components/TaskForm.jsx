import { useId, useState } from 'react'

function TaskForm({
  initialTitle = '',
  submitLabel = 'Add task',
  disabled = false,
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState(initialTitle)
  const inputId = useId()

  async function handleSubmit(event) {
    event.preventDefault()
    const input = event.currentTarget.elements.namedItem('title')

    if (!title.trim()) {
      input.setCustomValidity('Enter a task title, not just spaces.')
      input.reportValidity()
      return
    }

    if (await onSubmit(title.trim())) setTitle('')
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label htmlFor={inputId}>{onCancel ? 'Edit task title' : 'New task title'}</label>
      <div className="task-form-controls">
        <input
          id={inputId}
          name="title"
          placeholder="Enter a task"
          value={title}
          onChange={(event) => {
            event.target.setCustomValidity('')
            setTitle(event.target.value)
          }}
          disabled={disabled}
          required
        />
        <button type="submit" disabled={disabled || !title.trim()}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" disabled={disabled} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default TaskForm
