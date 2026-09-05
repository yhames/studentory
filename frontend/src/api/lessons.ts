import type {
  Lesson,
  LessonCreatePayload,
  LessonFilters,
  LessonGeneratePayload,
  LessonGenerateResult,
  LessonUpdatePayload,
} from '../types/lessons'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    let message = '요청을 처리하지 못했습니다.'
    if (typeof body === 'object' && body !== null && 'detail' in body) {
      const detail = body.detail
      if (typeof detail === 'string') message = detail
      if (Array.isArray(detail) && detail.length > 0) {
        const first = detail[0] as { msg?: unknown }
        if (typeof first.msg === 'string') message = first.msg
      }
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function getLessons(filters: LessonFilters): Promise<Lesson[]> {
  const query = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value))
  })
  return request<Lesson[]>(`/lessons?${query.toString()}`)
}

export function generateLessons(payload: LessonGeneratePayload): Promise<LessonGenerateResult> {
  return request<LessonGenerateResult>('/lessons/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createLesson(payload: LessonCreatePayload): Promise<Lesson> {
  return request<Lesson>('/lessons', { method: 'POST', body: JSON.stringify(payload) })
}

export function getLesson(id: number): Promise<Lesson> {
  return request<Lesson>(`/lessons/${id}`)
}

export function updateLesson(id: number, payload: LessonUpdatePayload): Promise<Lesson> {
  return request<Lesson>(`/lessons/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

export function completeLesson(id: number): Promise<Lesson> {
  return request<Lesson>(`/lessons/${id}/complete`, { method: 'POST' })
}

export function cancelLesson(id: number): Promise<Lesson> {
  return request<Lesson>(`/lessons/${id}/cancel`, { method: 'POST' })
}

export function restoreLesson(id: number): Promise<Lesson> {
  return request<Lesson>(`/lessons/${id}/restore`, { method: 'POST' })
}

export function reopenLesson(id: number): Promise<Lesson> {
  return request<Lesson>(`/lessons/${id}/reopen`, { method: 'POST' })
}

export function deleteLesson(id: number): Promise<void> {
  return request<void>(`/lessons/${id}`, { method: 'DELETE' })
}
