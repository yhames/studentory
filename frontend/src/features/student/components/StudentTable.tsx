import { dayLabels, stageLabels, statusLabels } from '../constants'
import { formatApproximateAge } from '../utils'
import type { Student, StudentSchedule } from '../../../types/students'
import { StateMessage } from '../../../components/ui/StateMessage'

interface StudentTableProps {
  students: Student[]
  filteredStudents: Student[]
  schedulesByStudentId: Record<number, StudentSchedule[]>
  loading: boolean
  loadError: boolean
  filtersActive: boolean
  onRetry: () => void
  onClearFilters: () => void
  onOpenStudent: (studentId: number) => void
}

export function StudentTable({
  students,
  filteredStudents,
  schedulesByStudentId,
  loading,
  loadError,
  filtersActive,
  onRetry,
  onClearFilters,
  onOpenStudent,
}: StudentTableProps) {
  if (loading) {
    return <StateMessage icon="◌" title="학생 기록을 불러오는 중이에요" description="잠시만 기다려 주세요." />
  }

  if (loadError) {
    return <StateMessage icon="!" title="학생 기록을 불러오지 못했어요" description="잠시 후 다시 시도해 주세요." action={<button type="button" className="secondary-button" onClick={onRetry}>다시 시도</button>} />
  }

  if (students.length === 0) {
    return <StateMessage icon="♧" title="아직 등록된 학생이 없어요" description="학생 추가 버튼으로 첫 학생 기록을 만들어 보세요." />
  }

  if (filteredStudents.length === 0) {
    return <StateMessage icon="⌕" title="조건에 맞는 학생이 없어요" description="검색어나 단계·상태 필터를 바꿔 보세요." action={filtersActive ? <button type="button" className="secondary-button" onClick={onClearFilters}>필터 초기화</button> : undefined} />
  }

  return (
    <div className="table-container">
      <table className="student-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>상태</th>
            <th>단계</th>
            <th>정기 수업</th>
            <th>연령</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => {
            const schedule = getDisplaySchedule(schedulesByStudentId[student.id] ?? [])
            return (
              <tr
                key={student.id}
                tabIndex={0}
                role="button"
                className="student-table-row"
                onClick={() => onOpenStudent(student.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onOpenStudent(student.id)
                  }
                }}
              >
                <td data-label="이름">
                  <strong className="student-name-cell">
                    <span className="student-avatar" aria-hidden="true">{genderEmoji(student)}</span>
                    <span>{student.name}<small>상세 기록 보기</small></span>
                  </strong>
                </td>
                <td data-label="상태">
                  <span className="badge badge-status">
                    {statusLabels[student.status]}
                  </span>
                </td>
                <td data-label="단계">
                  <span className="badge badge-stage">
                    {stageLabels[student.stage]}
                  </span>
                </td>
                <td data-label="정기 수업">
                  {schedule === null ? (
                    <span className="muted">-</span>
                  ) : (
                    <span className="schedule-inline">
                      <span className="badge badge-day">{dayLabels[schedule.day_of_week]}</span>
                      <span>{schedule.lesson_time.slice(0, 5)}</span>
                    </span>
                  )}
                </td>
                <td data-label="연령">{formatApproximateAge(student.birth_year)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function getDisplaySchedule(schedules: StudentSchedule[]): StudentSchedule | null {
  return schedules[0] ?? null
}

function genderEmoji(student: Student): string {
  if (student.gender === 'MALE') {
    return '👦'
  }
  if (student.gender === 'FEMALE') {
    return '👧'
  }
  return ''
}
