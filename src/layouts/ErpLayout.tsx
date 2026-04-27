import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ErpSidebar } from './erp/ErpSidebar'
import { ErpTopbar } from './erp/ErpTopbar'

export function ErpLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div
      className="dashboard-shell"
      style={{
        gridTemplateColumns: sidebarCollapsed ? '5.5rem minmax(0, 1fr)' : '17rem minmax(0, 1fr)',
      }}
    >
      <ErpSidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <div className="dashboard-shell__main">
        <ErpTopbar />
        <main className="dashboard-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
