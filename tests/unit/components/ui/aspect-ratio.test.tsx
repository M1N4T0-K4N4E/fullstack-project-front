import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

describe("AspectRatio", () => {
  it("renders child content", () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <div>Ratio content</div>
      </AspectRatio>,
    );

    expect(screen.getByText("Ratio content")).toBeInTheDocument();
  });

  it("renders aspect ratio slot", () => {
    const { container } = render(<AspectRatio ratio={1} />);
    expect(container.querySelector('[data-slot="aspect-ratio"]')).toBeInTheDocument();
  });
});
