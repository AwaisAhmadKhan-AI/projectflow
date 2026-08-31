export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export type IssueStatus = 'backlog' | 'in_progress' | 'blocked' | 'done';
export type IssuePriority = 'low' | 'medium' | 'high';

export interface Issue {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  assignee: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}