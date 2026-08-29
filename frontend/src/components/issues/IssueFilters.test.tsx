import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { IssueFiltersBar } from "@/components/issues/IssueFilters";
import { renderWithProviders } from "@/test/testUtils";

describe("IssueFiltersBar", () => {
  it("calls onChange with the selected status, preserving other filters", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <IssueFiltersBar filters={{ search: "login" }} onChange={onChange} />
    );

    await user.selectOptions(screen.getByLabelText(/filter by status/i), "blocked");

    expect(onChange).toHaveBeenCalledWith({ search: "login", status: "blocked" });
  });

  it("clears the priority filter when 'All priorities' is selected", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <IssueFiltersBar filters={{ priority: "high" }} onChange={onChange} />
    );

    await user.selectOptions(screen.getByLabelText(/filter by priority/i), "");

    expect(onChange).toHaveBeenCalledWith({ priority: undefined });
  });
});
