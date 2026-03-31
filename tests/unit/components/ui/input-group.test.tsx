import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  InputGroupAddon,
  InputGroup,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

describe("InputGroup", () => {
  it("renders input group controls", () => {
    render(
      <InputGroup>
        <InputGroupText>@</InputGroupText>
        <InputGroupInput aria-label="Username" />
        <InputGroupButton type="button">Check</InputGroupButton>
      </InputGroup>,
    );

    expect(screen.getByRole("textbox", { name: "Username" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check" })).toBeInTheDocument();
  });

  it("renders prefix text", () => {
    render(<InputGroupText>https://</InputGroupText>);
    expect(screen.getByText("https://")).toBeInTheDocument();
  });

  it("renders addon and textarea controls", () => {
    const { container } = render(
      <InputGroup>
        <InputGroupAddon align="inline-end">kg</InputGroupAddon>
        <InputGroupTextarea aria-label="Description" />
      </InputGroup>,
    );

    expect(screen.getByText("kg")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Description" })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="input-group-addon"]')).toHaveAttribute("data-align", "inline-end");
  });

  it("focuses input when clicking addon (non-button target)", () => {
    render(
      <InputGroup>
        <InputGroupAddon>Prefix</InputGroupAddon>
        <InputGroupInput aria-label="Focusable input" />
      </InputGroup>,
    );

    const addon = screen.getByText("Prefix");
    const input = screen.getByRole("textbox", { name: "Focusable input" });
    fireEvent.click(addon);
    expect(input).toHaveFocus();
  });

  it("does not focus input when clicking button inside addon", () => {
    render(
      <InputGroup>
        <InputGroupAddon>
          <button type="button">Inner button</button>
        </InputGroupAddon>
        <InputGroupInput aria-label="Not focused input" />
      </InputGroup>,
    );

    const button = screen.getByRole("button", { name: "Inner button" });
    const input = screen.getByRole("textbox", { name: "Not focused input" });
    fireEvent.click(button);
    expect(input).not.toHaveFocus();
  });
});