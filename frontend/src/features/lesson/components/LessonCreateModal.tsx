import type { FormEvent } from 'react'

import { Modal } from '../../../components/ui/Modal'
import type { Student } from '../../../types/students'
import type { LessonCreatePayload } from '../../../types/lessons'

interface Props {
  value: LessonCreatePayload
  students: Student[]
  error: string | null
  submitting: boolean
  onChange: (value: LessonCreatePayload) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export function LessonCreateModal({ value, students, error, submitting, onChange, onSubmit, onClose }: Props) {
  return (
    <Modal title="수동 수업 추가" onClose={onClose}>
      {error ? <p className="error-banner modal-error">{error}</p> : null}
      <form className="form-grid" onSubmit={onSubmit}>
        <label className="wide">학생
          <select required value={value.student_id || ''} onChange={(event) => onChange({ ...value, student_id: Number(event.target.value) })}>
            <option value="">학생 선택</option>
            {students.filter((student) => student.status === 'ACTIVE').map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
          </select>
        </label>
        <label>수업 날짜
          <input required type="date" value={value.lesson_date} onChange={(event) => onChange({ ...value, lesson_date: event.target.value })} />
        </label>
        <label>수업 시간
          <input required type="time" value={value.lesson_time.slice(0, 5)} onChange={(event) => onChange({ ...value, lesson_time: event.target.value })} />
        </label>
        <div className="form-actions wide">
          <button className="primary-button" type="submit" disabled={submitting}>{submitting ? '추가 중...' : '수업 추가'}</button>
          <button type="button" disabled={submitting} onClick={onClose}>취소</button>
        </div>
      </form>
    </Modal>
  )
}
