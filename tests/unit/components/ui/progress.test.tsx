import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Progress } from "@/components/ui/progress";

describe("Progress", () => {
  it("renders progress root and indicator", () => {
    const { container } = render(<Progress value={40} />);

    const root = container.querySelector('[data-slot="progress"]');
    const indicator = container.querySelector('[data-slot="progress-indicator"]');

    expect(root).toBeInTheDocument();
    expect(indicator).toBeInTheDocument();
  });

  it("applies transform based on value", () => {
    const { container } = render(<Progress value={40} />);

    const indicator = container.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveStyle({ transform: "translateX(-60%)" });
  });

  it("uses zero fallback when value is undefined", () => {
    const { container } = render(<Progress />);

    const indicator = container.querySelector('[data-slot="progress-indicator"]');
    expect(indicator).toHaveStyle({ transform: "translateX(-100%)" });
  });
});