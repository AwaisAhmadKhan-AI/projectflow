import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { issueSchema, type IssueFormValues } from '../schemas/issueSchema';
import { useIssue, useCreateIssue, useUpdateIssue } from '../hooks/useIssues';
import { useProjects } from '../hooks/useProjects';
import type { IssueStatus, IssuePriority } from '../types';

interface LocationState {
  projectId?: number;
}

export function IssueFormPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const isEditMode = Boolean(issueId);
  const { data: existingIssue } = useIssue(Number(issueId));
  const createIssue = useCreateIssue();
  const updateIssue = useUpdateIssue();
  const { data: projects = [] } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(
    locationState?.projectId
  );

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      status: 'backlog',
      priority: 'medium',
    },
  });

  useEffect(() => {
    if (isEditMode && existingIssue) {
      reset({
        title: existingIssue.title,
        description: existingIssue.description || '',
        status: existingIssue.status as IssueStatus,
        priority: existingIssue.priority as IssuePriority,
        assignee: existingIssue.assignee || '',
        dueDate: existingIssue.due_date ? existingIssue.due_date.split('T')[0] : '',
      });
      setSelectedProjectId(existingIssue.project_id);
    }
  }, [existingIssue, isEditMode, reset]);

  const onSubmit = async (data: IssueFormValues) => {
    const payload = {
      ...data,
      due_date: data.dueDate,
      project_id: isEditMode ? existingIssue?.project_id : selectedProjectId,
    };

    if (!payload.project_id) {
      alert('Please select a project');
      return;
    }

    if (isEditMode) {
      await updateIssue.mutateAsync({ id: Number(issueId), data: payload });
      navigate(`/issues/${issueId}`);
    } else {
      const newIssue = await createIssue.mutateAsync(payload);
      navigate(`/issues/${newIssue.id}`);
    }
  };

  if (isEditMode && !existingIssue) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
  const errorClass = 'mt-1 text-xs text-red-500';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={isEditMode ? `/issues/${issueId}` : '/projects'} className="text-sm text-indigo-600 hover:text-indigo-700">
        ← Back
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode ? 'Edit Issue' : 'Create Issue'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {isEditMode ? 'Update the issue details' : 'Fill in the details for the new issue'}
        </p>
      </div>

      {(createIssue.isError || updateIssue.isError) && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to save issue. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        {/* Project Select — sirf create mode mein */}
        {!isEditMode && (
          <div>
            <label htmlFor="project" className={labelClass}>Project</label>
            <select
              id="project"
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className={inputClass}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {!selectedProjectId && (
              <p className={errorClass}>Please select a project</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="title" className={labelClass}>Title</label>
          <input id="title" {...register('title')} placeholder="e.g., Fix login bug" className={inputClass} />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea id="description" rows={4} {...register('description')} placeholder="Describe the issue in detail..." className={inputClass} />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className={labelClass}>Status</label>
            <select id="status" {...register('status')} className={inputClass}>
              <option value="backlog">Backlog</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label htmlFor="priority" className={labelClass}>Priority</label>
            <select id="priority" {...register('priority')} className={inputClass}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="assignee" className={labelClass}>Assignee</label>
            <input id="assignee" {...register('assignee')} placeholder="e.g., Awais" className={inputClass} />
            {errors.assignee && <p className={errorClass}>{errors.assignee.message}</p>}
          </div>
          <div>
            <label htmlFor="dueDate" className={labelClass}>Due Date</label>
            <input id="dueDate" type="date" {...register('dueDate')} className={inputClass} />
            {errors.dueDate && <p className={errorClass}>{errors.dueDate.message}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || createIssue.isPending || updateIssue.isPending}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting || createIssue.isPending || updateIssue.isPending
              ? 'Saving...'
              : isEditMode ? 'Update Issue' : 'Create Issue'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}