import { Outlet } from 'react-router'

import { Sidebar } from '../components/layout/Sidebar'

export function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-column" id="main-content">
        <Outlet />
      </main>
    </div>
  )
}
