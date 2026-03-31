import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

describe("RadioGroup", () => {
  it("renders radio group and items", () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem aria-label="Option A" value="a" />
        <RadioGroupItem aria-label="Option B" value="b" />
      </RadioGroup>,
    );

    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Option A" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Option B" })).toBeInTheDocument();
  });

  it("applies checked state from defaultValue", () => {
    render(
      <RadioGroup defaultValue="b">
        <RadioGroupItem aria-label="A" value="a" />
        <RadioGroupItem aria-label="B" value="b" />
      </RadioGroup>,
    );

    expect(screen.getByRole("radio", { name: "B" })).toHaveAttribute("data-state", "checked");
  });
});