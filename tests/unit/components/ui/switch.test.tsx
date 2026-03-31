import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Switch } from "@/components/ui/switch";

describe("Switch", () => {
  it("renders a switch control", () => {
    render(<Switch aria-label="Airplane mode" />);

    expect(screen.getByRole("switch", { name: "Airplane mode" })).toBeInTheDocument();
  });

  it("applies size and checked state attributes", () => {
    render(<Switch aria-label="Notifications" size="sm" defaultChecked />);

    const switchControl = screen.getByRole("switch", { name: "Notifications" });
    expect(switchControl).toHaveAttribute("data-size", "sm");
    expect(switchControl).toHaveAttribute("data-state", "checked");
  });
});