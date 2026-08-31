import { z } from 'zod';

export const issueSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().trim().min(10, 'Add enough detail (at least 10 characters)').max(1000, 'Description too long'),
  status: z.enum(['backlog', 'in_progress', 'blocked', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  assignee: z.string().trim().min(2, 'Enter assignee name').max(100),
  dueDate: z.string().min(1, 'Choose a due date'),
});

export type IssueFormValues = z.infer<typeof issueSchema>;