import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import {
  createStudentSchedule,
  deleteStudent,
  getStudent,
  getStudentSchedules,
  updateStudent,
  updateStudentSchedule,
} from '../api/students'
import { StudentEditModal } from '../features/student/components/StudentEditModal'
import {
  dayLabels,
  genderLabels,
  stageLabels,
  statusLabels,
} from '../features/student/constants'
import {
  emptyScheduleForm,
  getErrorMessage,
  normalizeSchedulePayload,
  normalizeStudentPayload,
  toStudentForm,
  formatBirthYear,
  approximateAgeFromBirthYear,
} from '../features/student/utils'
import type {
  Student,
  StudentFormValues,
  StudentSchedule,
  StudentSchedulePayload,
} from '../types/students'

export function StudentDetailPage() {
  const navigate = useNavigate()
  const params = useParams()
  const studentId = Number(params.studentId)
  const [student, setStudent] = useState<Student | null>(null)
  const [schedules, setSchedules] = useState<StudentSchedule[]>([])
  const [studentForm, setStudentForm] = useState<StudentFormValues | null>(null)
  const [scheduleForm, setScheduleForm] =
    useState<StudentSchedulePayload>(emptyScheduleForm)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [submittingStudent, setSubmittingStudent] = useState(false)
  const [deletingStudent, setDeletingStudent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isInteger(studentId) || studentId <= 0) {
      navigate('/students', { replace: true })
      return
    }

    async function loadDetail() {
      setLoadingDetail(true)
      setError(null)
      try {
        const [studentResult, scheduleResult] = await Promise.all([
          getStudent(studentId),
          getStudentSchedules(studentId),
        ])
        setStudent(studentResult)
        setStudentForm(toStudentForm(studentResult))
        setSchedules(scheduleResult)
        setScheduleForm(toScheduleForm(scheduleResult[0]))
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoadingDetail(false)
      }
    }

    void loadDetail()
  }, [navigate, studentId])

  const approximateAge = useMemo(
    () => (student === null ? null : approximateAgeFromBirthYear(student.birth_year)),
    [student],
  )

  function openEditModal() {
    if (student === null) {
      return
    }
    setStudentForm(toStudentForm(student))
    setScheduleForm(toScheduleForm(schedules[0]))
    setModalError(null)
    setEditModalOpen(true)
  }

  function closeEditModal() {
    if (submittingStudent) {
      return
    }
    setEditModalOpen(false)
    setModalError(null)
    if (student !== null) {
      setStudentForm(toStudentForm(student))
      setScheduleForm(toScheduleForm(schedules[0]))
    }
  }

  async function handleUpdateStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (student === null || studentForm === null) {
      return
    }

    setSubmittingStudent(true)
    setModalError(null)
    try {
      const updated = await updateStudent(
        student.id,
        normalizeStudentPayload(studentForm),
      )
      const schedulePayload = normalizeSchedulePayload(scheduleForm)
      const savedSchedule =
        schedules[0] === undefined
          ? await createStudentSchedule(student.id, schedulePayload)
          : await updateStudentSchedule(
              student.id,
              schedules[0].id,
              schedulePayload,
            )
      setStudent(updated)
      setStudentForm(toStudentForm(updated))
      setSchedules([savedSchedule])
      setScheduleForm(toScheduleForm(savedSchedule))
      setEditModalOpen(false)
    } catch (err) {
      setModalError(getErrorMessage(err))
    } finally {
      setSubmittingStudent(false)
    }
  }

  async function handleDeleteStudent() {
    if (student === null) {
      return
    }
    const shouldDelete = window.confirm(`${student.name} 학생을 삭제할까요?`)
    if (!shouldDelete) {
      return
    }

    setDeletingStudent(true)
    setError(null)
    try {
      await deleteStudent(student.id)
      navigate('/students')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingStudent(false)
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <button type="button" className="back-button quiet-button" onClick={() => navigate('/students')}>
            <span aria-hidden="true">←</span> 학생 목록
          </button>
          <span className="page-kicker"><span aria-hidden="true">✦</span> 학생 상세 기록</span>
          <h1>{student === null ? '학생 상세' : student.name}</h1>
          {student !== null ? (
            <p>
              {formatBirthYear(student.birth_year)}
              {approximateAge === null ? '' : ` · ${approximateAge}세`} ·{' '}
              {stageLabels[student.stage]} · {statusLabels[student.status]}
            </p>
          ) : null}
        </div>
        {student !== null ? (
          <div className="button-group">
            <button type="button" className="primary-button" onClick={openEditModal}>
              <span aria-hidden="true">✎</span> 정보 수정
            </button>
            <button
              type="button"
              className="danger-button"
              disabled={deletingStudent}
              onClick={() => void handleDeleteStudent()}
            >
              삭제
            </button>
          </div>
        ) : null}
      </header>

      {error !== null ? <p className="error-banner">{error}</p> : null}
      {loadingDetail ? <p className="muted page-message">학생 정보를 불러오는 중입니다.</p> : null}

      {student !== null ? (
        <div className="detail-page-grid">
          <section className="page-panel" aria-labelledby="basic-info-title">
            <div className="section-heading">
              <div>
                <span className="section-kicker">한눈에 보기</span>
                <h2 id="basic-info-title">기본 정보</h2>
              </div>
            </div>
            <dl className="info-list">
              <div>
                <dt>이름</dt>
                <dd>{student.name}</dd>
              </div>
              <div>
                <dt>출생연도</dt>
                <dd>{formatBirthYear(student.birth_year)}</dd>
              </div>
              <div>
                <dt>성별</dt>
                <dd>{genderLabels[student.gender]}</dd>
              </div>
              <div>
                <dt>단계</dt>
                <dd>{stageLabels[student.stage]}</dd>
              </div>
              <div>
                <dt>상태</dt>
                <dd>{statusLabels[student.status]}</dd>
              </div>
              <div>
                <dt>수업일정</dt>
                <dd>{formatSchedule(schedules[0])}</dd>
              </div>
              <div>
                <dt>특이사항</dt>
                <dd>{student.special_notes ?? '-'}</dd>
              </div>
              <div>
                <dt>요청사항</dt>
                <dd>{student.request_notes ?? '-'}</dd>
              </div>
            </dl>
          </section>
        </div>
      ) : null}

      {editModalOpen && studentForm !== null ? (
        <StudentEditModal
          value={studentForm}
          scheduleValue={scheduleForm}
          submitting={submittingStudent}
          error={modalError}
          onChange={setStudentForm}
          onScheduleChange={setScheduleForm}
          onSubmit={handleUpdateStudent}
          onClose={closeEditModal}
        />
      ) : null}
    </>
  )
}

function toScheduleForm(
  schedule: StudentSchedule | undefined,
): StudentSchedulePayload {
  if (schedule === undefined) {
    return emptyScheduleForm
  }

  return {
    day_of_week: schedule.day_of_week,
    lesson_time: schedule.lesson_time.slice(0, 5),
    effective_start_date: schedule.effective_start_date,
  }
}

function formatSchedule(schedule: StudentSchedule | undefined): string {
  if (schedule === undefined) {
    return '-'
  }

  return `${dayLabels[schedule.day_of_week]} ${schedule.lesson_time.slice(0, 5)} · ${schedule.effective_start_date}`
}
