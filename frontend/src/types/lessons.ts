export type LessonStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED'

export type PreparationStatus = 'NOT_PREPARED' | 'PREPARED'

export type AttendanceStatus = 'PRESENT' | 'ABSENT'

export interface Lesson {
  id: number
  student_id: number
  schedule_id: number | null
  lesson_date: string
  lesson_time: string
  lesson_status: LessonStatus
  preparation_status: PreparationStatus
  attendance_status: AttendanceStatus | null
  curriculum_progress: string | null
  special_notes: string | null
  attitude_notes: string | null
}

export interface LessonCreatePayload {
  student_id: number
  lesson_date: string
  lesson_time: string
}

export interface LessonUpdatePayload {
  lesson_date?: string
  lesson_time?: string
  preparation_status?: PreparationStatus
  attendance_status?: AttendanceStatus | null
  curriculum_progress?: string | null
  special_notes?: string | null
  attitude_notes?: string | null
}

export interface LessonGeneratePayload {
  date_from: string
  date_to: string
}

export interface LessonGenerateResult {
  created_count: number
}

export interface LessonFilters {
  date_from: string
  date_to: string
  student_id?: number
  lesson_status?: LessonStatus
  preparation_status?: PreparationStatus
  attendance_status?: AttendanceStatus
}
