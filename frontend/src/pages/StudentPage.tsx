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
  const [error, setError] = useState<string | null>(null)
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

  async function loadStudents() {
    setLoadingStudents(true)
    setError(null)
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
    } catch (err) {
      setError(getErrorMessage(err))
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
          <span className="eyebrow">Student Management</span>
          <h1>학생 관리</h1>
          <p>학생을 검색하고 상세 정보를 빠르게 확인합니다.</p>
        </div>
      </header>

      {error !== null ? <p className="error-banner">{error}</p> : null}

      <section className="page-panel" aria-labelledby="student-table-title">
        <div className="section-heading">
          <h2 id="student-table-title">학생 목록</h2>
          <button type="button" onClick={() => void loadStudents()}>
            새로고침
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
