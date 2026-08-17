import { dayLabels, stageLabels, statusLabels } from '../constants'
import { formatApproximateAge } from '../utils'
import type { Student, StudentSchedule } from '../../../types/students'

interface StudentTableProps {
  students: Student[]
  filteredStudents: Student[]
  schedulesByStudentId: Record<number, StudentSchedule[]>
  loading: boolean
  onOpenStudent: (studentId: number) => void
}

export function StudentTable({
  students,
  filteredStudents,
  schedulesByStudentId,
  loading,
  onOpenStudent,
}: StudentTableProps) {
  if (loading) {
    return <p className="muted">학생 목록을 불러오는 중입니다.</p>
  }

  if (students.length === 0) {
    return <p className="muted">등록된 학생이 없습니다.</p>
  }

  if (filteredStudents.length === 0) {
    return <p className="muted">조건에 맞는 학생이 없습니다.</p>
  }

  return (
    <div className="table-container">
      <table className="student-table">
        <thead>
          <tr>
            <th>상태</th>
            <th>수업요일</th>
            <th>수업시간</th>
            <th>이름</th>
            <th>단계</th>
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
                <td>
                  <span className="badge badge-status">
                    {statusLabels[student.status]}
                  </span>
                </td>
                <td>
                  {schedule === null ? (
                    <span className="muted">-</span>
                  ) : (
                    <span className="badge badge-day">
                      {dayLabels[schedule.day_of_week]}
                    </span>
                  )}
                </td>
                <td>{schedule === null ? '-' : schedule.lesson_time.slice(0, 5)}</td>
                <td>
                  <strong className="student-name-cell">
                    <span aria-hidden="true">{genderEmoji(student)}</span>
                    {student.name}
                  </strong>
                </td>
                <td>
                  <span className="badge badge-stage">
                    {stageLabels[student.stage]}
                  </span>
                </td>
                <td>{formatApproximateAge(student.birth_year)}</td>
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
