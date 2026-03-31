import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

describe("ToggleGroup", () => {
  it("renders toggle group and items", () => {
    render(
      <ToggleGroup type="single" defaultValue="left" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Left">
          Left
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center">
          Center
        </ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(screen.getByRole("group", { name: "Alignment" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Left" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Center" })).toBeInTheDocument();
  });

  it("applies orientation and spacing", () => {
    const { container } = render(
      <ToggleGroup type="single" orientation="vertical" spacing={2}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );

    const group = container.querySelector('[data-slot="toggle-group"]');
    expect(group).toHaveAttribute("data-orientation", "vertical");
    expect(group).toHaveAttribute("data-spacing", "2");
  });
});
