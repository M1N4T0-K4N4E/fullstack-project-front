import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

describe("Kbd", () => {
  it("renders keyboard key text", () => {
    render(<Kbd>Ctrl</Kbd>);

    expect(screen.getByText("Ctrl")).toBeInTheDocument();
  });

  it("renders key group", () => {
    render(
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
    );

    expect(screen.getAllByText(/Ctrl|K/)).toHaveLength(2);
    expect(screen.getByText("Ctrl").closest('[data-slot="kbd-group"]')).toBeInTheDocument();
  });
});