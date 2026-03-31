import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Checkbox } from "@/components/ui/checkbox";

describe("Checkbox", () => {
  it("renders checkbox control", () => {
    render(<Checkbox aria-label="Accept terms" />);

    expect(screen.getByRole("checkbox", { name: "Accept terms" })).toBeInTheDocument();
  });

  it("supports checked state", () => {
    render(<Checkbox aria-label="Subscribe" defaultChecked />);

    expect(screen.getByRole("checkbox", { name: "Subscribe" })).toHaveAttribute("data-state", "checked");
  });
});