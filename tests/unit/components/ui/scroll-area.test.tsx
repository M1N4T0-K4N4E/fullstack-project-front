import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollArea } from "@/components/ui/scroll-area";

describe("ScrollArea", () => {
  it("renders scroll area and content", () => {
    const { container } = render(
      <ScrollArea>
        <div>Scrollable content</div>
      </ScrollArea>,
    );

    expect(screen.getByText("Scrollable content")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="scroll-area"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="scroll-area-viewport"]')).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<ScrollArea className="h-40" />);
    expect(container.querySelector('[data-slot="scroll-area"]')).toHaveClass("h-40");
  });
});