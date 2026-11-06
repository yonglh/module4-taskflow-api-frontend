// Runtime validation coverage for: task API response and error handling
import { afterEach, describe, expect, it, vi } from 'vitest'
import { http } from './http.js'

afterEach(() => vi.unstubAllGlobals())

function respond(body, init = {}) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(body, init))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('http', () => {
  it('sends JSON and returns parsed data', async () => {
    const fetchMock = respond('{"id":1,"title":"Test","completed":false}')

    await expect(http('/api/tasks', {
      method: 'POST',
      body: { title: 'Test', completed: false },
    })).resolves.toEqual({ id: 1, title: 'Test', completed: false })
    expect(fetchMock).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"title":"Test","completed":false}',
    }))
  })

  it('returns a plain text summary', async () => {
    respond('One pending task.')
    await expect(http('/api/tasks/summary', { responseType: 'text' }))
      .resolves.toBe('One pending task.')
  })

  it('accepts empty HTTP 200 delete responses', async () => {
    respond('')
    await expect(http('/api/tasks/1', { method: 'DELETE', responseType: 'empty' }))
      .resolves.toBeUndefined()
  })

  it('accepts HTTP 204 responses', async () => {
    respond(null, { status: 204 })
    await expect(http('/api/tasks/1')).resolves.toBeUndefined()
  })

  it('includes plain text API errors', async () => {
    respond('Task not found: 5', { status: 404 })
    await expect(http('/api/tasks/5')).rejects.toThrow('404): Task not found: 5')
  })

  it('includes Spring JSON error messages', async () => {
    respond('{"message":"Summary service unavailable"}', {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
    await expect(http('/api/tasks/summary'))
      .rejects.toThrow('500): Summary service unavailable')
  })

  it('includes problem JSON details', async () => {
    respond('{"detail":"Task no longer exists"}', {
      status: 404,
      headers: { 'Content-Type': 'application/problem+json' },
    })
    await expect(http('/api/tasks/5')).rejects.toThrow('404): Task no longer exists')
  })

  it('retains the status when the error payload is null', async () => {
    respond('null', {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
    await expect(http('/api/tasks')).rejects.toThrow('API request failed (500)')
  })

  it('provides an actionable network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(http('/api/tasks')).rejects.toThrow('Cannot reach the task API')
  })

  it('preserves abort errors and passes the signal to fetch', async () => {
    const controller = new AbortController()
    const error = new DOMException('Aborted', 'AbortError')
    const fetchMock = vi.fn().mockRejectedValue(error)
    vi.stubGlobal('fetch', fetchMock)

    await expect(http('/api/tasks', { signal: controller.signal })).rejects.toBe(error)
    expect(fetchMock).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
      signal: controller.signal,
    }))
  })

  it('rejects malformed JSON rather than treating it as success', async () => {
    respond('not JSON')
    await expect(http('/api/tasks')).rejects.toThrow()
  })
})
