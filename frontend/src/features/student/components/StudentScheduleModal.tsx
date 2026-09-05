import type { FormEvent } from 'react'

import { Modal } from '../../../components/ui/Modal'
import type { DayOfWeek, StudentSchedulePayload } from '../../../types/students'
import { dayLabels } from '../constants'

interface StudentScheduleModalProps {
  value: StudentSchedulePayload
  mode: 'create' | 'edit'
  submitting: boolean
  error: string | null
  onChange: (value: StudentSchedulePayload) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export function StudentScheduleModal({
  value,
  mode,
  submitting,
  error,
  onChange,
  onSubmit,
  onClose,
}: StudentScheduleModalProps) {
  return (
    <Modal
      title={mode === 'create' ? '정기 일정 추가' : '정기 일정 수정'}
      closeDisabled={submitting}
      onClose={onClose}
    >
      <form className="form-grid" onSubmit={onSubmit}>
        {error !== null ? <p className="error-banner wide">{error}</p> : null}
        <label>
          수업요일
          <select
            required
            disabled={submitting}
            value={value.day_of_week}
            onChange={(event) => onChange({ ...value, day_of_week: event.target.value as DayOfWeek })}
          >
            {Object.entries(dayLabels).map(([optionValue, label]) => (
              <option key={optionValue} value={optionValue}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          수업시간
          <input
            required
            disabled={submitting}
            type="time"
            value={value.lesson_time}
            onChange={(event) => onChange({ ...value, lesson_time: event.target.value })}
          />
        </label>
        <label className="wide">
          적용일
          <input
            required
            disabled={submitting}
            type="date"
            value={value.effective_start_date}
            onChange={(event) => onChange({ ...value, effective_start_date: event.target.value })}
          />
        </label>
        <div className="form-actions wide">
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? '저장 중...' : mode === 'create' ? '추가' : '수정'}
          </button>
          <button type="button" disabled={submitting} onClick={onClose}>취소</button>
        </div>
      </form>
    </Modal>
  )
}
