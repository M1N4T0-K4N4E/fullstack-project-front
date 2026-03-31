import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("radix-ui", () => {
  const make = (Tag: "div" | "button" | "span" = "div") =>
    React.forwardRef<HTMLElement, Record<string, unknown>>(
      ({ children, asChild, alignOffset, sideOffset, ...props }, ref) =>
        React.createElement(Tag, { ...props, ref }, children),
    );

  return {
    Select: {
      Root: make(),
      Group: make(),
      Value: make("span"),
      Trigger: make("button"),
      Portal: make(),
      Content: make(),
      Viewport: make(),
      Icon: make(),
      Label: make(),
      Item: make(),
      ItemText: make("span"),
      ItemIndicator: make("span"),
      Separator: make(),
      ScrollUpButton: make(),
      ScrollDownButton: make(),
    },
  };
});

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

describe("Select", () => {
  it("renders select trigger", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Category">
          <SelectValue placeholder="Choose category" />
        </SelectTrigger>
      </Select>,
    );

    expect(screen.getByLabelText("Category")).toBeInTheDocument();
  });

  it("applies trigger size attribute", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Status" size="sm">
          <SelectValue placeholder="Choose status" />
        </SelectTrigger>
      </Select>,
    );

    const trigger = screen.getByLabelText("Status");
    expect(trigger).toHaveAttribute("data-size", "sm");
  });

  it("renders content, groups, items, and separator", () => {
    const { container } = render(
      <Select>
        <SelectTrigger aria-label="Priority">
          <SelectValue placeholder="Choose priority" />
        </SelectTrigger>
        <SelectContent position="popper" align="end">
          <SelectGroup>
            <SelectLabel>Levels</SelectLabel>
            <SelectItem value="high">High</SelectItem>
            <SelectSeparator />
            <SelectItem value="low">Low</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByText("Levels")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="select-content"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="select-group"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="select-label"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="select-item"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="select-separator"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="select-scroll-up-button"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="select-scroll-down-button"]')).toBeInTheDocument();
  });
});