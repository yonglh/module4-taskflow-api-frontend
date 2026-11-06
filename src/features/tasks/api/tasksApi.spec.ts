// Runtime validation coverage for: the Spring Boot task endpoint contract
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as tasksApi from './tasksApi.js'

afterEach(() => vi.unstubAllGlobals())

describe('tasks API', () => {
  it('lists tasks with the supplied abort signal', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('[]'))
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()

    await expect(tasksApi.getTasks(controller.signal)).resolves.toEqual([])
    expect(fetchMock).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
      signal: controller.signal,
    }))
  })

  it.each([
    ['create', () => tasksApi.createTask('Read'), '/api/tasks', 'POST',
      { title: 'Read', completed: false }],
    ['update', () => tasksApi.updateTask(7, { title: 'Write', completed: true }),
      '/api/tasks/7', 'PUT', { title: 'Write', completed: true }],
    ['complete', () => tasksApi.completeTask(7), '/api/tasks/7/complete', 'PUT', undefined],
  ])('uses the correct %s endpoint and payload', async (_, action, url, method, body) => {
    const task = { id: 7, title: 'Read', completed: false }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(task)))
    vi.stubGlobal('fetch', fetchMock)

    await expect(action()).resolves.toEqual(task)
    const [actualUrl, options] = fetchMock.mock.calls[0]
    expect(actualUrl).toBe(url)
    expect(options.method).toBe(method)
    expect(options.body).toBe(body === undefined ? undefined : JSON.stringify(body))
  })

  it('deletes without trying to parse an empty response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(''))
    vi.stubGlobal('fetch', fetchMock)

    await expect(tasksApi.deleteTask(7)).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith('/api/tasks/7', expect.objectContaining({
      method: 'DELETE',
    }))
  })

  it('gets the AI summary as text', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('No tasks.'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(tasksApi.getTaskSummary()).resolves.toBe('No tasks.')
    expect(fetchMock).toHaveBeenCalledWith('/api/tasks/summary', expect.any(Object))
  })
})
