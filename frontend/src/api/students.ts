import type {
  Student,
  StudentPayload,
  StudentSchedule,
  StudentSchedulePayload,
  StudentScheduleUpdatePayload,
  StudentUpdatePayload,
} from '../types/students'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let message = '요청을 처리하지 못했습니다.'
    const body: unknown = await response.json().catch(() => null)
    if (isErrorBody(body)) {
      message = typeof body.detail === 'string' ? body.detail : message
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function isErrorBody(value: unknown): value is { detail: unknown } {
  return typeof value === 'object' && value !== null && 'detail' in value
}

export function getStudents(): Promise<Student[]> {
  return request<Student[]>('/students')
}

export function createStudent(payload: StudentPayload): Promise<Student> {
  return request<Student>('/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getStudent(studentId: number): Promise<Student> {
  return request<Student>(`/students/${studentId}`)
}

export function updateStudent(
  studentId: number,
  payload: StudentUpdatePayload,
): Promise<Student> {
  return request<Student>(`/students/${studentId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteStudent(studentId: number): Promise<void> {
  return request<void>(`/students/${studentId}`, {
    method: 'DELETE',
  })
}

export function getStudentSchedules(
  studentId: number,
): Promise<StudentSchedule[]> {
  return request<StudentSchedule[]>(`/students/${studentId}/schedules`)
}

export function createStudentSchedule(
  studentId: number,
  payload: StudentSchedulePayload,
): Promise<StudentSchedule> {
  return request<StudentSchedule>(`/students/${studentId}/schedules`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateStudentSchedule(
  studentId: number,
  scheduleId: number,
  payload: StudentScheduleUpdatePayload,
): Promise<StudentSchedule> {
  return request<StudentSchedule>(
    `/students/${studentId}/schedules/${scheduleId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  )
}

export function deleteStudentSchedule(
  studentId: number,
  scheduleId: number,
): Promise<void> {
  return request<void>(`/students/${studentId}/schedules/${scheduleId}`, {
    method: 'DELETE',
  })
}
