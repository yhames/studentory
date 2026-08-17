import type {
  Student,
  StudentPayload,
  StudentSchedulePayload,
} from '../../types/students'

export const emptyStudentForm: StudentPayload = {
  name: '',
  birth_year: null,
  gender: null,
  stage: 'STAGE_1',
  status: 'ACTIVE',
  special_notes: '',
  request_notes: '',
}

export const emptyScheduleForm: StudentSchedulePayload = {
  day_of_week: 'MONDAY',
  lesson_time: '15:00',
  effective_start_date: new Date().toISOString().slice(0, 10),
}

export function normalizeStudentPayload(payload: StudentPayload): StudentPayload {
  return {
    ...payload,
    name: payload.name.trim(),
    special_notes: emptyToNull(payload.special_notes),
    request_notes: emptyToNull(payload.request_notes),
  }
}

export function normalizeSchedulePayload(
  payload: StudentSchedulePayload,
): StudentSchedulePayload {
  return payload
}

export function toStudentForm(student: Student): StudentPayload {
  return {
    name: student.name,
    birth_year: student.birth_year,
    gender: student.gender,
    stage: student.stage,
    status: student.status,
    special_notes: student.special_notes ?? '',
    request_notes: student.request_notes ?? '',
  }
}

export function approximateAgeFromBirthYear(birthYear: number | null): number | null {
  if (birthYear === null) {
    return null
  }
  return new Date().getFullYear() - birthYear
}

export function birthYearFromAge(age: number | null): number | null {
  if (age === null) {
    return null
  }
  return new Date().getFullYear() - age
}

export function formatBirthYear(birthYear: number | null): string {
  return birthYear === null ? '-' : `${birthYear}년생`
}

export function formatApproximateAge(birthYear: number | null): string {
  const approximateAge = approximateAgeFromBirthYear(birthYear)
  return approximateAge === null ? '-' : `${approximateAge}세`
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return '알 수 없는 오류가 발생했습니다.'
}

function emptyToNull(value: string | null): string | null {
  if (value === null) {
    return null
  }
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}
