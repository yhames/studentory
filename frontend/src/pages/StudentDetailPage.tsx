import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { createStudentSchedule, deleteStudent, deleteStudentSchedule, getStudent, getStudentSchedules, StudentApiError, updateStudent, updateStudentSchedule } from '../api/students'
import { StudentEditModal } from '../features/student/components/StudentEditModal'
import { StudentScheduleModal } from '../features/student/components/StudentScheduleModal'
import { dayLabels, genderLabels, stageLabels, statusLabels } from '../features/student/constants'
import { approximateAgeFromBirthYear, emptyScheduleForm, formatBirthYear, normalizeSchedulePayload, normalizeStudentPayload, toStudentForm } from '../features/student/utils'
import type { Student, StudentFormValues, StudentSchedule, StudentSchedulePayload } from '../types/students'

export function StudentDetailPage() {
  const navigate = useNavigate()
  const studentId = Number(useParams().studentId)
  const [student, setStudent] = useState<Student | null>(null)
  const [schedule, setSchedule] = useState<StudentSchedule | null>(null)
  const [studentForm, setStudentForm] = useState<StudentFormValues | null>(null)
  const [scheduleForm, setScheduleForm] = useState<StudentSchedulePayload>(emptyScheduleForm)
  const [loadingDetail, setLoadingDetail] = useState(true)
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [submittingStudent, setSubmittingStudent] = useState(false)
  const [submittingSchedule, setSubmittingSchedule] = useState(false)
  const [deletingStudent, setDeletingStudent] = useState(false)
  const [deletingSchedule, setDeletingSchedule] = useState(false)

  async function loadSchedule(id: number) {
    setLoadingSchedule(true)
    setScheduleError(null)
    try {
      const result = await getStudentSchedules(id)
      setSchedule(result[0] ?? null)
    } catch {
      setScheduleError('정기 일정을 불러오지 못했어요.')
    } finally {
      setLoadingSchedule(false)
    }
  }

  useEffect(() => {
    if (!Number.isInteger(studentId) || studentId <= 0) {
      navigate('/students', { replace: true })
      return
    }
    async function loadDetail() {
      setLoadingDetail(true)
      setDetailError(null)
      setNotFound(false)
      try {
        const result = await getStudent(studentId)
        setStudent(result)
        setStudentForm(toStudentForm(result))
        await loadSchedule(result.id)
      } catch (error) {
        if (error instanceof StudentApiError && error.status === 404) setNotFound(true)
        else setDetailError('학생 정보를 불러오지 못했어요.')
      } finally {
        setLoadingDetail(false)
      }
    }
    void loadDetail()
  }, [navigate, studentId])

  const age = useMemo(() => student === null ? null : approximateAgeFromBirthYear(student.birth_year), [student])

  function openStudentModal() {
    if (student === null) return
    setStudentForm(toStudentForm(student))
    setModalError(null)
    setEditModalOpen(true)
  }

  function openScheduleModal() {
    setScheduleForm(toScheduleForm(schedule))
    setModalError(null)
    setScheduleModalOpen(true)
  }

  async function handleUpdateStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (student === null || studentForm === null) return
    setSubmittingStudent(true)
    setModalError(null)
    try {
      const updated = await updateStudent(student.id, normalizeStudentPayload(studentForm))
      setStudent(updated)
      setStudentForm(toStudentForm(updated))
      setEditModalOpen(false)
    } catch {
      setModalError('학생 정보를 수정하지 못했어요. 입력 내용을 확인하고 다시 시도해 주세요.')
    } finally {
      setSubmittingStudent(false)
    }
  }

  async function handleSaveSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (student === null) return
    setSubmittingSchedule(true)
    setModalError(null)
    try {
      const payload = normalizeSchedulePayload(scheduleForm)
      const saved = schedule === null
        ? await createStudentSchedule(student.id, payload)
        : await updateStudentSchedule(student.id, schedule.id, payload)
      setSchedule(saved)
      setScheduleModalOpen(false)
    } catch {
      setModalError('정기 일정을 저장하지 못했어요. 입력 내용을 확인하고 다시 시도해 주세요.')
    } finally {
      setSubmittingSchedule(false)
    }
  }

  async function handleDeleteSchedule() {
    if (student === null || schedule === null) return
    if (!window.confirm(`${student.name} 학생의 ${formatSchedule(schedule)} 정기 일정을 삭제할까요?`)) return
    setDeletingSchedule(true)
    setScheduleError(null)
    try {
      await deleteStudentSchedule(student.id, schedule.id)
      setSchedule(null)
    } catch {
      setScheduleError('정기 일정을 삭제하지 못했어요. 다시 시도해 주세요.')
    } finally {
      setDeletingSchedule(false)
    }
  }

  async function handleDeleteStudent() {
    if (student === null || !window.confirm(`${student.name} 학생과 연결된 정보를 삭제할까요?`)) return
    setDeletingStudent(true)
    setDetailError(null)
    try {
      await deleteStudent(student.id)
      navigate('/students')
    } catch {
      setDetailError('학생을 삭제하지 못했어요. 다시 시도해 주세요.')
    } finally {
      setDeletingStudent(false)
    }
  }

  if (loadingDetail) return <p className="muted page-message">학생 정보를 불러오는 중입니다.</p>
  if (notFound) return <StatePanel title="학생을 찾을 수 없어요." description="삭제되었거나 존재하지 않는 학생입니다." action="학생 목록으로" onAction={() => navigate('/students')} />
  if (student === null) return <StatePanel title={detailError ?? '학생 정보를 불러오지 못했어요.'} description="잠시 후 다시 시도해 주세요." action="다시 시도" onAction={() => window.location.reload()} />

  return <>
    <header className="page-header">
      <div>
        <button type="button" className="back-button quiet-button" onClick={() => navigate('/students')}><span aria-hidden="true">←</span> 학생 목록</button>
        <span className="page-kicker"><span aria-hidden="true">✦</span> 학생 상세 기록</span>
        <h1>{student.name}</h1>
        <p>{formatBirthYear(student.birth_year)}{age === null ? '' : ` · ${age}세`} · {stageLabels[student.stage]} · {statusLabels[student.status]}</p>
      </div>
      <div className="button-group">
        <button type="button" className="primary-button" onClick={openStudentModal}><span aria-hidden="true">✎</span> 기본 정보 수정</button>
        <button type="button" className="danger-button" disabled={deletingStudent} onClick={() => void handleDeleteStudent()}>{deletingStudent ? '삭제 중...' : '학생 삭제'}</button>
      </div>
    </header>
    {detailError !== null ? <p className="error-banner">{detailError}</p> : null}
    <div className="detail-page-grid">
      <section className="page-panel" aria-labelledby="basic-info-title">
        <div className="section-heading"><div><span className="section-kicker">학생 프로필</span><h2 id="basic-info-title">기본 정보</h2><p className="section-description">학생의 기본 속성과 수업 참고사항입니다.</p></div></div>
        <dl className="info-list">
          <div><dt>이름</dt><dd>{student.name}</dd></div><div><dt>출생연도</dt><dd>{formatBirthYear(student.birth_year)}</dd></div>
          <div><dt>성별</dt><dd>{genderLabels[student.gender]}</dd></div><div><dt>단계</dt><dd>{stageLabels[student.stage]}</dd></div>
          <div><dt>상태</dt><dd>{statusLabels[student.status]}</dd></div><div><dt>특이사항</dt><dd>{student.special_notes ?? '-'}</dd></div>
          <div className="wide"><dt>요청사항</dt><dd>{student.request_notes ?? '-'}</dd></div>
        </dl>
      </section>
      <section className="page-panel" aria-labelledby="schedule-title">
        <div className="section-heading">
          <div><span className="section-kicker">반복 수업</span><h2 id="schedule-title">정기 일정</h2><p className="section-description">실제 수업 기록과 별도로 반복 수업 기준을 관리합니다.</p></div>
          <div className="button-group"><button type="button" className="primary-soft-button" disabled={loadingSchedule || scheduleError !== null} onClick={openScheduleModal}>{schedule === null ? '일정 추가' : '일정 수정'}</button>{schedule !== null ? <button type="button" className="danger-button" disabled={deletingSchedule} onClick={() => void handleDeleteSchedule()}>{deletingSchedule ? '삭제 중...' : '일정 삭제'}</button> : null}</div>
        </div>
        {loadingSchedule ? <p className="muted">정기 일정을 불러오는 중입니다.</p> : null}
        {scheduleError !== null ? <div className="state-message compact"><div><strong>{scheduleError}</strong><p>학생 기본 정보는 그대로 확인할 수 있습니다.</p></div><button type="button" className="state-action" onClick={() => void loadSchedule(student.id)}>다시 시도</button></div> : null}
        {!loadingSchedule && scheduleError === null && schedule === null ? <div className="state-message compact"><span className="state-icon" aria-hidden="true">+</span><div><strong>등록된 정기 일정이 없어요.</strong><p>일정 추가를 눌러 첫 반복 수업을 등록하세요.</p></div></div> : null}
        {!loadingSchedule && scheduleError === null && schedule !== null ? <dl className="info-list schedule-info"><div><dt>수업요일</dt><dd>{dayLabels[schedule.day_of_week]}</dd></div><div><dt>수업시간</dt><dd>{schedule.lesson_time.slice(0, 5)}</dd></div><div><dt>적용 시작일</dt><dd>{schedule.effective_start_date}</dd></div></dl> : null}
      </section>
    </div>
    {editModalOpen && studentForm !== null ? <StudentEditModal value={studentForm} scheduleValue={scheduleForm} submitting={submittingStudent} error={modalError} onChange={setStudentForm} onScheduleChange={setScheduleForm} onSubmit={handleUpdateStudent} onClose={() => !submittingStudent && setEditModalOpen(false)} /> : null}
    {scheduleModalOpen ? <StudentScheduleModal value={scheduleForm} mode={schedule === null ? 'create' : 'edit'} submitting={submittingSchedule} error={modalError} onChange={setScheduleForm} onSubmit={handleSaveSchedule} onClose={() => !submittingSchedule && setScheduleModalOpen(false)} /> : null}
  </>
}

function StatePanel({ title, description, action, onAction }: { title: string; description: string; action: string; onAction: () => void }) {
  return <section className="page-panel state-message" aria-labelledby="student-state-title"><span className="state-icon" aria-hidden="true">!</span><div><h2 id="student-state-title">{title}</h2><p>{description}</p></div><button type="button" className="state-action" onClick={onAction}>{action}</button></section>
}

function toScheduleForm(schedule: StudentSchedule | null): StudentSchedulePayload {
  return schedule === null ? emptyScheduleForm : { day_of_week: schedule.day_of_week, lesson_time: schedule.lesson_time.slice(0, 5), effective_start_date: schedule.effective_start_date }
}

function formatSchedule(schedule: StudentSchedule): string {
  return `${dayLabels[schedule.day_of_week]} ${schedule.lesson_time.slice(0, 5)}`
}
