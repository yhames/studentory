import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router'

export function Sidebar() {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const handleChange = () => {
      setIsMobile(media.matches)
      if (!media.matches) {
        setOpen(false)
      }
    }
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    sidebarRef.current?.querySelector<HTMLElement>('a, button:not(:disabled)')?.focus()

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  function closeMenu() {
    setOpen(false)
  }

  return (
    <>
      <header className="mobile-topbar">
        <button
          ref={menuButtonRef}
          type="button"
          className="menu-button"
          aria-label="메뉴 열기"
          aria-expanded={open}
          aria-controls="primary-sidebar"
          onClick={() => setOpen(true)}
        >
          <span aria-hidden="true">☰</span>
        </button>
        <Brand />
        <span className="mobile-status" aria-label="오늘 기록">
          오늘
        </span>
      </header>
      {open ? (
        <button
          type="button"
          className="sidebar-scrim"
          aria-label="메뉴 닫기"
          onClick={() => {
            closeMenu()
            menuButtonRef.current?.focus()
          }}
        />
      ) : null}
      <aside
        ref={sidebarRef}
        id="primary-sidebar"
        className={`app-sidebar ${open ? 'open' : ''}`}
        aria-label="주요 메뉴"
        aria-hidden={isMobile && !open}
        inert={isMobile && !open}
      >
        <Brand />
        <p className="nav-section-label">업무 메뉴</p>
        <nav className="primary-nav">
          <NavItem to="/students" icon="♧" label="학생 관리" onNavigate={closeMenu} />
          <NavItem to="/lessons" icon="◷" label="수업 현황" onNavigate={closeMenu} />
          <DisabledNavItem icon="▤" label="교재 관리" />
          <DisabledNavItem icon="◇" label="상담 관리" />
          <DisabledNavItem icon="✦" label="교사 자료" />
        </nav>
        <div className="sidebar-note">
          <span aria-hidden="true">☀</span>
          <div>
            <strong>오늘도 차근차근</strong>
            <span>학생의 다음 수업을 준비해요.</span>
          </div>
        </div>
      </aside>
    </>
  )
}

function Brand() {
  return (
    <div className="brand-block">
      <span className="brand-mark" aria-hidden="true">S</span>
      <span>
        <strong>Studentory</strong>
        <small>학생과 수업을 한눈에</small>
      </span>
    </div>
  )
}

interface NavItemProps {
  to: string
  icon: string
  label: string
  onNavigate: () => void
}

function NavItem({ to, icon, label, onNavigate }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? 'active' : '')}
      onClick={onNavigate}
    >
      <span className="nav-icon" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}

function DisabledNavItem({ icon, label }: Pick<NavItemProps, 'icon' | 'label'>) {
  return (
    <button type="button" disabled>
      <span className="nav-icon" aria-hidden="true">{icon}</span>
      <span>{label}</span>
      <small>준비 중</small>
    </button>
  )
}
