import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group";

describe("ButtonGroup", () => {
  it("renders group and text", () => {
    render(
      <ButtonGroup>
        <ButtonGroupText>Actions</ButtonGroupText>
      </ButtonGroup>,
    );

    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("applies orientation and separator", () => {
    const { container } = render(
      <ButtonGroup orientation="vertical">
        <ButtonGroupText>A</ButtonGroupText>
        <ButtonGroupSeparator orientation="horizontal" />
      </ButtonGroup>,
    );

    expect(screen.getByRole("group")).toHaveAttribute("data-orientation", "vertical");
    expect(container.querySelector('[data-slot="button-group-separator"]')).toBeInTheDocument();
  });

  it("uses default separator orientation and supports text asChild", () => {
    const { container } = render(
      <ButtonGroup>
        <ButtonGroupText asChild>
          <span>Inline text</span>
        </ButtonGroupText>
        <ButtonGroupSeparator />
      </ButtonGroup>,
    );

    expect(screen.getByText("Inline text")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="button-group-separator"]')).toHaveAttribute("data-orientation", "vertical");
  });
});