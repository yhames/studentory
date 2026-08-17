import type { FormEvent } from 'react'

import { Modal } from '../../../components/ui/Modal'
import type { StudentPayload, StudentSchedulePayload } from '../../../types/students'
import { StudentForm } from './StudentForm'

interface StudentCreateModalProps {
  value: StudentPayload
  scheduleValue: StudentSchedulePayload
  submitting: boolean
  error: string | null
  onChange: (value: StudentPayload) => void
  onScheduleChange: (value: StudentSchedulePayload) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export function StudentCreateModal({
  value,
  scheduleValue,
  submitting,
  error,
  onChange,
  onScheduleChange,
  onSubmit,
  onClose,
}: StudentCreateModalProps) {
  return (
    <Modal title="학생 추가" onClose={onClose}>
      <StudentForm
        value={value}
        scheduleValue={scheduleValue}
        mode="create"
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
