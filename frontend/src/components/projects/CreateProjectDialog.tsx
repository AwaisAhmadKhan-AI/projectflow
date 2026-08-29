import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useCreateProject } from "@/hooks/useProjects";
import { projectFormSchema, type ProjectFormValues } from "@/schemas/projectSchema";

/**
 * A simple inline-toggle dialog rather than a separate route: creating
 * a project is a lightweight action, not a full screen. Whether the
 * dialog is open is local, throwaway UI state — useState is the right
 * owner, per Section 6.3.
 */
export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: { name: "", description: "" },
  });

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <span aria-hidden="true">+</span> New Project
      </Button>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    await createProject.mutateAsync({
      name: values.name,
      description: values.description || null,
    });
    reset();
    setOpen(false);
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-project-heading"
      className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/40 p-4"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 id="create-project-heading" className="text-lg font-semibold text-slate-900">
          New Project
        </h2>
        <form onSubmit={onSubmit} noValidate className="mt-4 flex flex-col gap-4">
          <FormField label="Name" htmlFor="project-name" error={errors.name?.message} required>
            <input
              id="project-name"
              type="text"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
              {...register("name")}
            />
          </FormField>
          <FormField
            label="Description"
            htmlFor="project-description"
            error={errors.description?.message}
          >
            <textarea
              id="project-description"
              rows={3}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
              {...register("description")}
            />
          </FormField>

          {createProject.isError && (
            <p role="alert" className="text-sm text-red-600">
              Could not create the project. Please try again.
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
