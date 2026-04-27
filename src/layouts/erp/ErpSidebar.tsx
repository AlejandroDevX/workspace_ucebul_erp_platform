import {
  LayoutGrid,
  Users,
  FileText,
  FilePlus2,
  CheckSquare,
  FolderOpen,
} from 'lucide-react'
import { Sidebar as FoundationSidebar, type NavigationGroup } from 'foundation-ui'
import { useLocation, useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '@/routes/paths'
import { useAuth } from '@/hooks/useAuth'

interface ErpSidebarProps {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

export function ErpSidebar({ collapsed, onCollapsedChange }: ErpSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()

  const generalItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutGrid size={18} />,
      active: location.pathname === APP_ROUTES.dashboard || location.pathname === '/',
      onClick: () => navigate(APP_ROUTES.dashboard),
    },
  ]

  const erpItems = []

  if (hasPermission('erp.third_parties.view')) {
    erpItems.push({
      id: 'third-parties',
      label: 'Contratistas',
      icon: <Users size={18} />,
      active: location.pathname.startsWith(APP_ROUTES.thirdParties),
      onClick: () => navigate(APP_ROUTES.thirdParties),
    })
  }

  if (hasPermission('erp.contracts.view')) {
    erpItems.push({
      id: 'contracts',
      label: 'Contratos',
      icon: <FileText size={18} />,
      active: location.pathname.startsWith(APP_ROUTES.contracts),
      onClick: () => navigate(APP_ROUTES.contracts),
    })
  }

  if (hasPermission('erp.contract_addendums.view')) {
    erpItems.push({
      id: 'contract-addendums',
      label: 'Otrosíes',
      icon: <FilePlus2 size={18} />,
      active: location.pathname.startsWith(APP_ROUTES.contractAddendums),
      onClick: () => navigate(APP_ROUTES.contractAddendums),
    })
  }

  if (hasPermission('erp.approvals.view')) {
    erpItems.push({
      id: 'approvals',
      label: 'Aprobaciones',
      icon: <CheckSquare size={18} />,
      active: location.pathname.startsWith(APP_ROUTES.approvals),
      onClick: () => navigate(APP_ROUTES.approvals),
    })
  }

  if (hasPermission('erp.documents.view')) {
    erpItems.push({
      id: 'documents',
      label: 'Documentos',
      icon: <FolderOpen size={18} />,
      active: location.pathname.startsWith(APP_ROUTES.documents),
      onClick: () => navigate(APP_ROUTES.documents),
    })
  }

  const sections: NavigationGroup[] = [
    { items: generalItems },
  ]

  if (erpItems.length > 0) {
    sections.push({
      label: 'Módulos ERP',
      items: erpItems,
    })
  }

  return (
    <FoundationSidebar
      collapsible
      collapsed={collapsed}
      footer={
        <>
          <p>Autenticación vía Ucebul Workspace.</p>
        </>
      }
      header={
        <div className="sidebar__brand">
          <span className="sidebar__brand-mark">UE</span>
          {!collapsed ? (
            <div>
              <p className="sidebar__eyebrow">Ucebul Ecosystem</p>
              <h1 className="sidebar__title">ERP</h1>
            </div>
          ) : null}
        </div>
      }
      onCollapsedChange={onCollapsedChange}
      sections={sections}
    />
  )
}
