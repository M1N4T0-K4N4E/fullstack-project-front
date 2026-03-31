import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

describe("Empty", () => {
  it("renders empty state content", () => {
    render(
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">*</EmptyMedia>
          <EmptyTitle>No results</EmptyTitle>
          <EmptyDescription>Try changing your filters.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>Actions</EmptyContent>
      </Empty>,
    );

    expect(screen.getByText("No results")).toBeInTheDocument();
    expect(screen.getByText("Try changing your filters.")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("applies media variant attribute", () => {
    const { container } = render(<EmptyMedia variant="icon">I</EmptyMedia>);
    expect(container.querySelector('[data-slot="empty-icon"]')).toHaveAttribute("data-variant", "icon");
  });
});