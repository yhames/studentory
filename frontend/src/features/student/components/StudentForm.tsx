import type { FormEvent } from 'react'

import { dayLabels, genderLabels, stageLabels, statusLabels } from '../constants'
import { approximateAgeFromBirthYear, birthYearFromAge } from '../utils'
import type {
  DayOfWeek,
  StudentGender,
  StudentFormValues,
  StudentSchedulePayload,
  StudentStage,
  StudentStatus,
} from '../../../types/students'

interface StudentFormProps {
  value: StudentFormValues
  scheduleValue: StudentSchedulePayload
  mode: 'create' | 'edit'
  submitting: boolean
  error: string | null
  showSchedule?: boolean
  onChange: (value: StudentFormValues) => void
  onScheduleChange: (value: StudentSchedulePayload) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export function StudentForm({
  value,
  scheduleValue,
  mode,
  submitting,
  error,
  showSchedule = true,
  onChange,
  onScheduleChange,
  onSubmit,
  onCancel,
}: StudentFormProps) {
  const age = approximateAgeFromBirthYear(value.birth_year)

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      {error !== null ? <p className="error-banner wide">{error}</p> : null}
      <label>
        이름
        <input
          required
          pattern=".*\S.*"
          title="이름을 입력해 주세요."
          disabled={submitting}
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
        />
      </label>
      <label>
        나이
        <input
          type="number"
          required
          min="0"
          max={new Date().getFullYear() - 1900}
          disabled={submitting}
          value={age ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              birth_year:
                event.target.value === ''
                  ? null
                  : birthYearFromAge(Number(event.target.value)),
            })
          }
        />
      </label>
      <label>
        성별
        <select
          required
          disabled={submitting}
          value={value.gender ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              gender:
                event.target.value === ''
                  ? null
                  : (event.target.value as StudentGender),
            })
          }
        >
          <option value="">선택</option>
          {Object.entries(genderLabels).map(([optionValue, label]) => (
            <option key={optionValue} value={optionValue}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        단계
        <select
          disabled={submitting}
          value={value.stage}
          onChange={(event) =>
            onChange({ ...value, stage: event.target.value as StudentStage })
          }
        >
          {Object.entries(stageLabels).map(([optionValue, label]) => (
            <option key={optionValue} value={optionValue}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        상태
        <select
          disabled={submitting}
          value={value.status}
          onChange={(event) =>
            onChange({ ...value, status: event.target.value as StudentStatus })
          }
        >
          {Object.entries(statusLabels).map(([optionValue, label]) => (
            <option key={optionValue} value={optionValue}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {showSchedule ? <label>
        수업요일
        <select
          required
          disabled={submitting}
          value={scheduleValue.day_of_week}
          onChange={(event) =>
            onScheduleChange({
              ...scheduleValue,
              day_of_week: event.target.value as DayOfWeek,
            })
          }
        >
          {Object.entries(dayLabels).map(([optionValue, label]) => (
            <option key={optionValue} value={optionValue}>
              {label}
            </option>
          ))}
        </select>
      </label> : null}
      {showSchedule ? <label>
        수업시간
        <input
          required
          disabled={submitting}
          type="time"
          value={scheduleValue.lesson_time}
          onChange={(event) =>
            onScheduleChange({ ...scheduleValue, lesson_time: event.target.value })
          }
        />
      </label> : null}
      {showSchedule ? <label>
        적용일
        <input
          required
          disabled={submitting}
          type="date"
          value={scheduleValue.effective_start_date}
          onChange={(event) =>
            onScheduleChange({
              ...scheduleValue,
              effective_start_date: event.target.value,
            })
          }
        />
      </label> : null}
      <label className="wide">
        특이사항
        <textarea
          disabled={submitting}
          value={value.special_notes ?? ''}
          onChange={(event) =>
            onChange({ ...value, special_notes: event.target.value })
          }
        />
      </label>
      <label className="wide">
        요청사항
        <textarea
          disabled={submitting}
          value={value.request_notes ?? ''}
          onChange={(event) =>
            onChange({ ...value, request_notes: event.target.value })
          }
        />
      </label>
      <div className="form-actions wide">
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? '저장 중...' : mode === 'create' ? '저장' : '수정'}
        </button>
        <button type="button" disabled={submitting} onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  )
}
