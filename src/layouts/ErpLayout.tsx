import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  FileText,
  FilePlus2,
  CheckSquare,
  FolderOpen,
} from "lucide-react";

import { Header, Sidebar, Footer } from "ucebul_mui";
import { type NavigationData } from "ucebul_mui";
import { APP_ROUTES } from "@/routes/paths";
import { useAuthStore } from "@/features/auth/store/auth.store";

const navigationData: NavigationData[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    to: APP_ROUTES.dashboard,
    icon: <LayoutGrid size={18} />,
    className: "vertical-navigation__link d-flex align-items-center",
    activeClassName: "vertical-navigation__link--active",
  },
  {
    id: "erp",
    title: "Módulos ERP",
    children: [
      {
        id: "third-parties",
        title: "Contratistas",
        to: APP_ROUTES.thirdParties,
        icon: <Users size={18} />,
        className: "vertical-navigation__link d-flex align-items-center mb-1",
        activeClassName: "vertical-navigation__link--active",
      },
      {
        id: "contracts",
        title: "Contratos",
        to: APP_ROUTES.contracts,
        icon: <FileText size={18} />,
        className: "vertical-navigation__link d-flex align-items-center mb-1",
        activeClassName: "vertical-navigation__link--active",
      },
      {
        id: "contract-addendums",
        title: "Otrosíes",
        to: APP_ROUTES.contractAddendums,
        icon: <FilePlus2 size={18} />,
        className: "vertical-navigation__link d-flex align-items-center mb-1",
        activeClassName: "vertical-navigation__link--active",
      },
      {
        id: "approvals",
        title: "Aprobaciones",
        to: APP_ROUTES.approvals,
        icon: <CheckSquare size={18} />,
        className: "vertical-navigation__link d-flex align-items-center mb-1",
        activeClassName: "vertical-navigation__link--active",
      },
      {
        id: "documents",
        title: "Documentos",
        to: APP_ROUTES.documents,
        icon: <FolderOpen size={18} />,
        className: "vertical-navigation__link d-flex align-items-center mb-1",
        activeClassName: "vertical-navigation__link--active",
      },
    ],
  },
];

export function ErpLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const displayName = [user?.name, user?.lastName].filter(Boolean).join(' ').trim() || 'Usuario';

  return (
    <div className="erp-layout">
      <Sidebar
        navigationData={navigationData}
        openMenu={menuOpen}
        setOpenMenu={setMenuOpen}
      />
      <div className="erp-layout__wrapper">
        <Header title="Ucebul Erp" username={displayName} />
        <main className="erp-layout__wrapper__content">
          <Outlet />
        </main>
        <Footer text="Todos los derechos reservados © Ucebul 2026 - Powered by Master Code Software" />
      </div>
    </div>
  );
}
