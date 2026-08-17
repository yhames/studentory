import type { FormEvent } from 'react'

import { Modal } from '../../../components/ui/Modal'
import type { StudentPayload, StudentSchedulePayload } from '../../../types/students'
import { StudentForm } from './StudentForm'

interface StudentEditModalProps {
  value: StudentPayload
  scheduleValue: StudentSchedulePayload
  submitting: boolean
  error: string | null
  onChange: (value: StudentPayload) => void
  onScheduleChange: (value: StudentSchedulePayload) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export function StudentEditModal({
  value,
  scheduleValue,
  submitting,
  error,
  onChange,
  onScheduleChange,
  onSubmit,
  onClose,
}: StudentEditModalProps) {
  return (
    <Modal title="학생 정보 수정" onClose={onClose}>
      <StudentForm
        value={value}
        scheduleValue={scheduleValue}
        mode="edit"
        submitting={submitting}
        error={error}
        onChange={onChange}
        onScheduleChange={onScheduleChange}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  )
}
