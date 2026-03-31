import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Separator } from "@/components/ui/separator";

describe("Separator", () => {
  it("renders a decorative separator by default", () => {
    render(<Separator />);

    expect(screen.getByRole("none")).toBeInTheDocument();
  });

  it("applies vertical orientation", () => {
    render(<Separator orientation="vertical" />);

    const separator = screen.getByRole("none");
    expect(separator).toHaveAttribute("data-orientation", "vertical");
  });
});