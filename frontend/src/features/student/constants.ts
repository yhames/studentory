import type {
  DayOfWeek,
  StudentGender,
  StudentStage,
  StudentStatus,
} from '../../types/students'

export const stageLabels: Record<StudentStage, string> = {
  STAGE_1: '1단계',
  STAGE_2: '2단계',
  STAGE_3: '3단계',
  STAGE_4: '4단계',
  STAGE_5: '5단계',
  STAGE_6: '6단계',
}

export const statusLabels: Record<StudentStatus, string> = {
  FIRST_CONSULTATION_REQUIRED: '첫 상담 필요',
  ACTIVE: '수업 중',
  ENDED: '종료',
}

export const genderLabels: Record<StudentGender, string> = {
  MALE: '남',
  FEMALE: '여',
}

export const dayLabels: Record<DayOfWeek, string> = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
}
