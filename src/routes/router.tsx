import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ErpLayout } from '@/layouts/ErpLayout'
import { PublicRoute } from '@/routes/guards/PublicRoute'
import { PrivateRoute } from '@/routes/guards/PrivateRoute'
import { PermissionRoute } from '@/routes/guards/PermissionRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { ThirdPartiesPage } from '@/features/third-parties/pages/ThirdPartiesPage'
import { ThirdPartyDetailPage } from '@/features/third-parties/pages/ThirdPartyDetailPage'
import { ThirdPartyFormPage } from '@/features/third-parties/pages/ThirdPartyFormPage'
import { ContractsPage } from '@/features/contracts/pages/ContractsPage'
import { ContractDetailPage } from '@/features/contracts/pages/ContractDetailPage'
import { ContractFormPage } from '@/features/contracts/pages/ContractFormPage'
import { ContractAddendumsPage } from '@/features/contract-addendums/pages/ContractAddendumsPage'
import { ContractAddendumDetailPage } from '@/features/contract-addendums/pages/ContractAddendumDetailPage'
import { ContractAddendumFormPage } from '@/features/contract-addendums/pages/ContractAddendumFormPage'
import { ApprovalsPage } from '@/features/approvals/pages/ApprovalsPage'
import { DocumentsPage } from '@/features/documents/pages/DocumentsPage'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ROUTE_SEGMENTS } from '@/routes/paths'

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTE_SEGMENTS.login,
            element: <LoginPage />,
          },
        ],
      },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <ErpLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={`/${ROUTE_SEGMENTS.dashboard}`} replace />,
          },
          {
            path: ROUTE_SEGMENTS.dashboard,
            element: <DashboardPage />,
          },
          {
            path: ROUTE_SEGMENTS.unauthorized,
            element: <UnauthorizedPage />,
          },
          {
            element: <PermissionRoute permission="erp.third_parties.view" />,
            children: [
              {
                path: ROUTE_SEGMENTS.thirdParties,
                element: <ThirdPartiesPage />,
              },
              {
                path: `${ROUTE_SEGMENTS.thirdParties}/:id`,
                element: <ThirdPartyDetailPage />,
              },
              {
                path: `${ROUTE_SEGMENTS.thirdParties}/new`,
                element: <ThirdPartyFormPage />,
              },
              {
                path: `${ROUTE_SEGMENTS.thirdParties}/:id/edit`,
                element: <ThirdPartyFormPage />,
              },
            ],
          },
          {
            element: <PermissionRoute permission="erp.contracts.view" />,
            children: [
              {
                path: ROUTE_SEGMENTS.contracts,
                element: <ContractsPage />,
              },
              {
                path: `${ROUTE_SEGMENTS.contracts}/:id`,
                element: <ContractDetailPage />,
              },
              {
                path: `${ROUTE_SEGMENTS.contractsNew}`,
                element: <ContractFormPage />,
              },
              {
                path: `${ROUTE_SEGMENTS.contracts}/:id/edit`,
                element: <ContractFormPage />,
              },
            ],
          },
          {
            element: <PermissionRoute permission="erp.contract_addendums.view" />,
            children: [
              {
                path: ROUTE_SEGMENTS.contractAddendums,
                element: <ContractAddendumsPage />,
              },
              {
                path: `${ROUTE_SEGMENTS.contractAddendums}/:id`,
                element: <ContractAddendumDetailPage />,
              },
              {
                path: `${ROUTE_SEGMENTS.contractAddendumsNew}`,
                element: <ContractAddendumFormPage />,
              },
              {
                path: `${ROUTE_SEGMENTS.contractAddendums}/:id/edit`,
                element: <ContractAddendumFormPage />,
              },
            ],
          },
          {
            element: <PermissionRoute permission="erp.approvals.view" />,
            children: [
              {
                path: ROUTE_SEGMENTS.approvals,
                element: <ApprovalsPage />,
              },
            ],
          },
          {
            element: <PermissionRoute permission="erp.documents.view" />,
            children: [
              {
                path: ROUTE_SEGMENTS.documents,
                element: <DocumentsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
