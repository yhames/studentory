import { NavLink } from 'react-router'

export function Sidebar() {
  return (
    <aside className="app-sidebar" aria-label="주요 메뉴">
      <div className="brand-block">
        <strong>Studentory</strong>
        <span>Teacher Workspace</span>
      </div>
      <nav className="primary-nav">
        <NavLink to="/students" className={({ isActive }) => (isActive ? 'active' : '')}>
          학생 관리
        </NavLink>
        <NavLink to="/lessons" className={({ isActive }) => (isActive ? 'active' : '')}>
          수업 현황
        </NavLink>
        <button type="button" disabled>
          교재 관리
        </button>
        <button type="button" disabled>
          상담 관리
        </button>
        <button type="button" disabled>
          교사 자료
        </button>
      </nav>
    </aside>
  )
}
