import { z } from "zod";

export const projectFormSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(200),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
