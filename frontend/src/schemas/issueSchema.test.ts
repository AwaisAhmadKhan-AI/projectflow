import { describe, expect, it } from "vitest";

import { issueFormSchema } from "@/schemas/issueSchema";

describe("issueFormSchema", () => {
  it("rejects an empty title", () => {
    const result = issueFormSchema.safeParse({
      title: "",
      status: "backlog",
      priority: "medium",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/title is required/i);
    }
  });

  it("accepts a minimal valid issue", () => {
    const result = issueFormSchema.safeParse({
      title: "Fix the login bug",
      status: "backlog",
      priority: "medium",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status value", () => {
    const result = issueFormSchema.safeParse({
      title: "Valid title",
      status: "not_a_real_status",
      priority: "medium",
    });
    expect(result.success).toBe(false);
  });
});
