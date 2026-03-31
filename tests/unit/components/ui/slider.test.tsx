import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Slider } from "@/components/ui/slider";

describe("Slider", () => {
  it("renders slider root and thumb", () => {
    const { container } = render(<Slider defaultValue={[50]} aria-label="Volume" />);

    expect(screen.getByRole("slider")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="slider-thumb"]')).toBeInTheDocument();
  });

  it("supports controlled value", () => {
    render(<Slider value={[30]} aria-label="Brightness" />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "30");
  });

  it("renders fallback thumbs when no value or defaultValue is provided", () => {
    const { container } = render(<Slider min={10} max={90} aria-label="Range" />);

    expect(container.querySelectorAll('[data-slot="slider-thumb"]')).toHaveLength(2);
  });
});