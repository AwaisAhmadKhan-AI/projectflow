import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { CreateIssue } from "@/routes/CreateIssue";
import { Dashboard } from "@/routes/Dashboard";
import { EditIssue } from "@/routes/EditIssue";
import { IssueDetails } from "@/routes/IssueDetails";
import { NotFound } from "@/routes/NotFound";
import { ProjectIssues } from "@/routes/ProjectIssues";
import { Projects } from "@/routes/Projects";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectIssues />} />
        <Route path="/projects/:projectId/issues/new" element={<CreateIssue />} />
        <Route path="/issues/:issueId" element={<IssueDetails />} />
        <Route path="/issues/:issueId/edit" element={<EditIssue />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AppShell>
  );
}
