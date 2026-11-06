// Runtime validation coverage for: task forms, list states, and summary rendering
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import TaskForm from './TaskForm.jsx'
import TaskList from './TaskList.jsx'
import TaskSummary from './TaskSummary.jsx'

describe('task components', () => {
  it('renders the empty collection state', () => {
    const html = renderToStaticMarkup(createElement(TaskList, { tasks: [] }))
    expect(html).toContain('No tasks yet.')
    expect(html).not.toContain('<ul')
  })

  it('renders task titles as text, not executable markup', () => {
    const html = renderToStaticMarkup(createElement(TaskList, {
      tasks: [{ id: 1, title: '<script>alert(1)</script>', completed: false }],
    }))
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
    expect(html).toContain('Pending')
  })

  it('marks completed tasks and prevents completing them again', () => {
    const html = renderToStaticMarkup(createElement(TaskList, {
      tasks: [{ id: 1, title: 'Read', completed: true }],
    }))
    expect(html).toContain('task-title completed')
    expect(html).toContain('Completed')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Complete<\/button>/)
  })

  it('disables the add button for an empty or whitespace-only title', () => {
    for (const initialTitle of ['', '   ']) {
      const html = renderToStaticMarkup(createElement(TaskForm, {
        initialTitle,
        onSubmit: vi.fn(),
      }))
      expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Add task<\/button>/)
      expect(html).toContain('New task title')
    }
  })

  it('renders an edit form with the current title and cancel action', () => {
    const html = renderToStaticMarkup(createElement(TaskForm, {
      initialTitle: 'Prepare assignment',
      submitLabel: 'Save',
      onSubmit: vi.fn(),
      onCancel: vi.fn(),
    }))
    expect(html).toContain('Edit task title')
    expect(html).toContain('value="Prepare assignment"')
    expect(html).toContain('>Save</button>')
    expect(html).toContain('>Cancel</button>')
  })

  it('disables form controls while a request is pending', () => {
    const html = renderToStaticMarkup(createElement(TaskForm, {
      initialTitle: 'Read',
      disabled: true,
      onSubmit: vi.fn(),
    }))
    expect(html).toMatch(/<input[^>]*disabled=""/)
    expect(html).toMatch(/<button[^>]*disabled=""/)
  })

  it('shows summary progress and preserves multiline summary text', () => {
    const html = renderToStaticMarkup(createElement(TaskSummary, {
      summary: 'Pending: Read\nCompleted: Write',
      loading: true,
      disabled: true,
      onGenerate: vi.fn(),
    }))
    expect(html).toContain('Generating summary...')
    expect(html).toContain('Pending: Read\nCompleted: Write')
    expect(html).toContain('aria-live="polite"')
    expect(html).toMatch(/<button[^>]*disabled=""/)
  })
})
