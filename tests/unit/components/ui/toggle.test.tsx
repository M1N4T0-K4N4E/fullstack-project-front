import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toggle } from "@/components/ui/toggle";

describe("Toggle", () => {
  it("renders toggle button", () => {
    render(<Toggle aria-label="Bold">B</Toggle>);

    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
  });

  it("supports pressed state", () => {
    render(
      <Toggle aria-label="Italic" pressed>
        I
      </Toggle>,
    );

    expect(screen.getByRole("button", { name: "Italic" })).toHaveAttribute("data-state", "on");
  });
});