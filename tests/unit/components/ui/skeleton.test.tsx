import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton", () => {
  it("renders skeleton element", () => {
    const { container } = render(<Skeleton />);

    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute("data-slot", "skeleton");
  });

  it("applies passed className", () => {
    const { container } = render(<Skeleton className="h-4 w-24" />);

    expect(container.firstChild).toHaveClass("h-4", "w-24");
  });
});