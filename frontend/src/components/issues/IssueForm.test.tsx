import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { IssueForm } from "@/components/issues/IssueForm";
import { renderWithProviders } from "@/test/testUtils";

describe("IssueForm", () => {
  it("shows a validation error and does not submit when the title is empty", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <IssueForm
        submitLabel="Create Issue"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /create issue/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits validated values when the form is filled out correctly", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderWithProviders(
      <IssueForm submitLabel="Create Issue" onSubmit={onSubmit} onCancel={vi.fn()} />
    );

    await user.type(screen.getByLabelText(/^title/i), "Fix the deploy script");
    await user.click(screen.getByRole("button", { name: /create issue/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: "Fix the deploy script",
      status: "backlog",
      priority: "medium",
    });
  });
});
