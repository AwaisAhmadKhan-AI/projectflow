import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NotFound } from "@/routes/NotFound";
import { renderWithProviders } from "@/test/testUtils";

describe("NotFound", () => {
  it("renders a 404 heading and a link back to the dashboard", () => {
    renderWithProviders(<NotFound />);

    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to dashboard/i })).toHaveAttribute("href", "/");
  });
});
