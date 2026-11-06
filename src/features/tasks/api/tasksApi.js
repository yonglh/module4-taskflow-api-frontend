import { http } from '../../../lib/http.js'

const basePath = '/api/tasks'

export function getTasks(signal) {
  return http(basePath, { signal })
}

export function createTask(title) {
  return http(basePath, {
    method: 'POST',
    body: { title, completed: false },
  })
}

export function updateTask(id, changes) {
  return http(`${basePath}/${id}`, { method: 'PUT', body: changes })
}

export function completeTask(id) {
  return http(`${basePath}/${id}/complete`, { method: 'PUT' })
}

export function deleteTask(id) {
  return http(`${basePath}/${id}`, { method: 'DELETE', responseType: 'empty' })
}

export function getTaskSummary() {
  return http(`${basePath}/summary`, { responseType: 'text' })
}
