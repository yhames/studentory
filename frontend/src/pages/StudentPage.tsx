import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import {
  createStudent,
  createStudentSchedule,
  getStudentSchedules,
  getStudents,
} from '../api/students'
import { StudentCreateModal } from '../features/student/components/StudentCreateModal'
import { StudentTable } from '../features/student/components/StudentTable'
import { StudentToolbar } from '../features/student/components/StudentToolbar'
import {
  emptyStudentForm,
  emptyScheduleForm,
  getErrorMessage,
  normalizeSchedulePayload,
  normalizeStudentPayload,
} from '../features/student/utils'
import type {
  Student,
  StudentFormValues,
  StudentSchedule,
  StudentSchedulePayload,
  StudentStage,
  StudentStatus,
} from '../types/students'

export function StudentPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<Student[]>([])
  const [schedulesByStudentId, setSchedulesByStudentId] = useState<
    Record<number, StudentSchedule[]>
  >({})
  const [studentForm, setStudentForm] =
    useState<StudentFormValues>(emptyStudentForm)
  const [scheduleForm, setScheduleForm] =
    useState<StudentSchedulePayload>(emptyScheduleForm)
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [submittingStudent, setSubmittingStudent] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<StudentStage | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'ALL'>('ALL')
  const [loadError, setLoadError] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  useEffect(() => {
    void loadStudents()
  }, [])

  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        const matchesSearch = student.name
          .toLowerCase()
          .includes(studentSearch.trim().toLowerCase())
        const matchesStage = stageFilter === 'ALL' || student.stage === stageFilter
        const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter
        return matchesSearch && matchesStage && matchesStatus
      }),
    [stageFilter, statusFilter, studentSearch, students],
  )
  const activeStudentCount = students.filter((student) => student.status === 'ACTIVE').length
  const scheduledStudentCount = Object.values(schedulesByStudentId).filter(
    (schedules) => schedules.length > 0,
  ).length

  async function loadStudents() {
    setLoadingStudents(true)
    setLoadError(false)
    try {
      const studentResults = await getStudents()
      const scheduleEntries = await Promise.all(
        studentResults.map(async (student) => [
          student.id,
          await getStudentSchedules(student.id),
        ] as const),
      )
      setStudents(studentResults)
      setSchedulesByStudentId(Object.fromEntries(scheduleEntries))
    } catch {
      setStudents([])
      setSchedulesByStudentId({})
      setLoadError(true)
    } finally {
      setLoadingStudents(false)
    }
  }

  function openCreateModal() {
    setStudentForm(emptyStudentForm)
    setScheduleForm(emptyScheduleForm)
    setModalError(null)
    setCreateModalOpen(true)
  }

  function closeCreateModal() {
    if (submittingStudent) {
      return
    }
    setCreateModalOpen(false)
    setModalError(null)
  }

  async function handleCreateStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittingStudent(true)
    setModalError(null)
    try {
      const created = await createStudent(normalizeStudentPayload(studentForm))
      const schedule = await createStudentSchedule(
        created.id,
        normalizeSchedulePayload(scheduleForm),
      )
      setStudents((current) => [...current, created])
      setSchedulesByStudentId((current) => ({
        ...current,
        [created.id]: [schedule],
      }))
      setStudentForm(emptyStudentForm)
      setScheduleForm(emptyScheduleForm)
      setCreateModalOpen(false)
    } catch (err) {
      setModalError(getErrorMessage(err))
    } finally {
      setSubmittingStudent(false)
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <span className="page-kicker"><span aria-hidden="true">♧</span> 학생 기록</span>
          <h1>학생 관리</h1>
          <p>학생의 상태와 정기 수업을 빠르게 살펴보세요.</p>
        </div>
        <div className="header-decoration" aria-hidden="true">
          <span>✦</span>
          <strong>오늘의 학생 기록</strong>
        </div>
      </header>

      <section className="summary-strip" aria-label="학생 현황 요약">
        <div className="summary-card lilac">
          <span>전체 학생</span>
          <strong>{students.length}<small>명</small></strong>
          <em>등록된 학생 기록</em>
        </div>
        <div className="summary-card mint">
          <span>수업 중</span>
          <strong>{activeStudentCount}<small>명</small></strong>
          <em>현재 함께하는 학생</em>
        </div>
        <div className="summary-card peach">
          <span>정기 일정</span>
          <strong>{scheduledStudentCount}<small>명</small></strong>
          <em>일정이 등록된 학생</em>
        </div>
      </section>

      <section className="page-panel" aria-labelledby="student-table-title">
        <div className="section-heading">
          <div>
            <span className="section-kicker">학생 찾기</span>
            <h2 id="student-table-title">학생 목록</h2>
            <p className="section-description">이름과 상태를 확인하고 상세 기록으로 이동하세요.</p>
          </div>
          <button type="button" className="icon-button" onClick={() => void loadStudents()}>
            <span aria-hidden="true">↻</span> 새로고침
          </button>
        </div>
        <StudentToolbar
          search={studentSearch}
          stageFilter={stageFilter}
          statusFilter={statusFilter}
          onSearchChange={setStudentSearch}
          onStageFilterChange={setStageFilter}
          onStatusFilterChange={setStatusFilter}
          onAddStudent={openCreateModal}
        />
        <StudentTable
          students={students}
          filteredStudents={filteredStudents}
          schedulesByStudentId={schedulesByStudentId}
          loading={loadingStudents}
          loadError={loadError}
          filtersActive={studentSearch.trim() !== '' || stageFilter !== 'ALL' || statusFilter !== 'ALL'}
          onRetry={() => void loadStudents()}
          onClearFilters={() => {
            setStudentSearch('')
            setStageFilter('ALL')
            setStatusFilter('ALL')
          }}
          onOpenStudent={(studentId) => navigate(`/students/${studentId}`)}
        />
      </section>

      {createModalOpen ? (
        <StudentCreateModal
          value={studentForm}
          scheduleValue={scheduleForm}
          submitting={submittingStudent}
          error={modalError}
          onChange={setStudentForm}
          onScheduleChange={setScheduleForm}
          onSubmit={handleCreateStudent}
          onClose={closeCreateModal}
        />
      ) : null}
    </>
  )
}
