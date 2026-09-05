import type { FormEvent } from 'react'

import { Modal } from '../../../components/ui/Modal'
import type { Lesson, LessonUpdatePayload } from '../../../types/lessons'

interface Props {
  lesson: Lesson
  studentName: string
  value: LessonUpdatePayload
  error: string | null
  submitting: boolean
  onChange: (value: LessonUpdatePayload) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onComplete: () => void
  onCancelLesson: () => void
  onRestoreLesson: () => void
  onReopenLesson: () => void
  onDelete: () => void
  onClose: () => void
}

export function LessonRecordModal({ lesson, studentName, value, error, submitting, onChange, onSubmit, onComplete, onCancelLesson, onRestoreLesson, onReopenLesson, onDelete, onClose }: Props) {
  const scheduled = lesson.lesson_status === 'SCHEDULED'
  const manual = lesson.schedule_id === null
  return (
    <Modal title={`${studentName} 수업 상세`} onClose={onClose} closeDisabled={submitting}>
      {error ? <p className="error-banner modal-error">{error}</p> : null}
      <form className="form-grid" onSubmit={onSubmit}>
        <label>수업 날짜
          <input type="date" disabled={!manual || !scheduled} value={value.lesson_date ?? lesson.lesson_date} onChange={(event) => onChange({ ...value, lesson_date: event.target.value })} />
        </label>
        <label>수업 시간
          <input type="time" disabled={!manual || !scheduled} value={(value.lesson_time ?? lesson.lesson_time).slice(0, 5)} onChange={(event) => onChange({ ...value, lesson_time: event.target.value })} />
        </label>
        {!manual ? <p className="wide muted lesson-form-note">정기 수업의 일정 변경은 기존 수업을 취소한 뒤 수동 수업으로 추가해 주세요.</p> : null}
        <label>준비
          <select value={value.preparation_status ?? lesson.preparation_status} onChange={(event) => onChange({ ...value, preparation_status: event.target.value as Lesson['preparation_status'] })}>
            <option value="NOT_PREPARED">미준비</option><option value="PREPARED">준비 완료</option>
          </select>
        </label>
        <label>출결
          <select value={value.attendance_status ?? ''} onChange={(event) => onChange({ ...value, attendance_status: event.target.value === '' ? null : event.target.value as NonNullable<Lesson['attendance_status']> })}>
            <option value="">미입력</option><option value="PRESENT">출석</option><option value="ABSENT">결석</option>
          </select>
        </label>
        <label className="wide">단계
          <input placeholder="예: 1-24" value={value.curriculum_progress ?? ''} onChange={(event) => onChange({ ...value, curriculum_progress: event.target.value })} />
        </label>
        <label className="wide">특이사항
          <textarea value={value.special_notes ?? ''} onChange={(event) => onChange({ ...value, special_notes: event.target.value })} />
        </label>
        <label className="wide">수업태도
          <textarea value={value.attitude_notes ?? ''} onChange={(event) => onChange({ ...value, attitude_notes: event.target.value })} />
        </label>
        <div className="form-actions wide lesson-modal-actions">
          <div className="lesson-lifecycle-actions">
            {manual ? <button className="danger-button" type="button" disabled={submitting} onClick={onDelete}>삭제</button> : null}
            {scheduled ? <button type="button" disabled={submitting} onClick={onCancelLesson}>수업 취소</button> : null}
            {lesson.lesson_status === 'CANCELED' ? <button className="primary-soft-button" type="button" disabled={submitting} onClick={onRestoreLesson}>수업 복구</button> : null}
            {lesson.lesson_status === 'COMPLETED' ? <button className="primary-soft-button" type="button" disabled={submitting} onClick={onReopenLesson}>미완료로 되돌리기</button> : null}
            {scheduled ? <button className="primary-soft-button" type="button" disabled={submitting || value.attendance_status == null} onClick={onComplete}>수업 완료 처리</button> : null}
          </div>
          <div className="lesson-form-actions">
            <button type="button" disabled={submitting} onClick={onClose}>변경 취소</button>
            <button className="primary-button" type="submit" disabled={submitting}>저장</button>
          </div>
        </div>
        {scheduled && value.attendance_status == null ? <p className="wide lesson-completion-help">출석 또는 결석을 입력하면 수업을 완료할 수 있어요.</p> : null}
      </form>
    </Modal>
  )
}
