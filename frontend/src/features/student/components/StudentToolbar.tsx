import { stageLabels, statusLabels } from '../constants'
import type { StudentStage, StudentStatus } from '../../../types/students'

interface StudentToolbarProps {
  search: string
  stageFilter: StudentStage | 'ALL'
  statusFilter: StudentStatus | 'ALL'
  onSearchChange: (value: string) => void
  onStageFilterChange: (value: StudentStage | 'ALL') => void
  onStatusFilterChange: (value: StudentStatus | 'ALL') => void
  onAddStudent: () => void
}

export function StudentToolbar({
  search,
  stageFilter,
  statusFilter,
  onSearchChange,
  onStageFilterChange,
  onStatusFilterChange,
  onAddStudent,
}: StudentToolbarProps) {
  return (
    <div className="student-toolbar">
      <div className="student-toolbar-controls">
        <label>
          <span>검색</span>
          <input
            type="search"
            placeholder="학생 이름 검색"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
        <label>
          <span>단계</span>
          <select
            value={stageFilter}
            onChange={(event) =>
              onStageFilterChange(event.target.value as StudentStage | 'ALL')
            }
          >
            <option value="ALL">전체 단계</option>
            {Object.entries(stageLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>상태</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusFilterChange(event.target.value as StudentStatus | 'ALL')
            }
          >
            <option value="ALL">전체 상태</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button type="button" className="primary-button" onClick={onAddStudent}>
        추가
      </button>
    </div>
  )
}
