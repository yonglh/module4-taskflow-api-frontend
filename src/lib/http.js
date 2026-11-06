export async function http(path, { body, responseType = 'json', ...options } = {}) {
  let response

  try {
    response = await fetch(path, {
      ...options,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Cannot reach the task API. Check your connection and backend.', {
      cause: error,
    })
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || ''
    const details = contentType.includes('json')
      ? await response.json()
      : await response.text()
    const message = typeof details === 'string'
      ? details
      : details?.detail || details?.message || details?.error

    throw new Error(
      `API request failed (${response.status})${message ? `: ${message}` : ''}`,
    )
  }

  if (responseType === 'empty' || response.status === 204) return undefined
  if (responseType === 'text') return response.text()
  return response.json()
}
