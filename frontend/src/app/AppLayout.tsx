import { Outlet } from 'react-router'

import { Sidebar } from '../components/layout/Sidebar'

export function AppLayout() {
  return (
    <main className="app-shell">
      <Sidebar />
      <div className="main-column">
        <Outlet />
      </div>
    </main>
  )
}
