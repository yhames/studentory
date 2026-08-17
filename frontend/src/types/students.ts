export type StudentStage =
  | 'STAGE_1'
  | 'STAGE_2'
  | 'STAGE_3'
  | 'STAGE_4'
  | 'STAGE_5'
  | 'STAGE_6'

export type StudentStatus =
  | 'FIRST_CONSULTATION_REQUIRED'
  | 'ACTIVE'
  | 'ENDED'

export type StudentGender = 'MALE' | 'FEMALE'

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export interface Student {
  id: number
  name: string
  birth_year: number | null
  gender: StudentGender | null
  stage: StudentStage
  status: StudentStatus
  special_notes: string | null
  request_notes: string | null
}

export interface StudentPayload {
  name: string
  birth_year: number | null
  gender: StudentGender | null
  stage: StudentStage
  status: StudentStatus
  special_notes: string | null
  request_notes: string | null
}

export type StudentUpdatePayload = Partial<StudentPayload>

export interface StudentSchedule {
  id: number
  student_id: number
  day_of_week: DayOfWeek
  lesson_time: string
  effective_start_date: string
}

export interface StudentSchedulePayload {
  day_of_week: DayOfWeek
  lesson_time: string
  effective_start_date: string
}

export type StudentScheduleUpdatePayload = Partial<StudentSchedulePayload>
