import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { AppShell } from './components/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectIssuesPage } from './pages/ProjectIssuesPage'
import { IssueDetailPage } from './pages/IssueDetailPage'
import { IssueFormPage } from './pages/IssueFormPage'
import { NotFoundPage } from './pages/NotFoundPage'

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:projectId/issues', element: <ProjectIssuesPage /> },
      { path: 'issues/:issueId', element: <IssueDetailPage /> },
      { path: 'issues/new', element: <IssueFormPage /> },
      { path: 'issues/:issueId/edit', element: <IssueFormPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)