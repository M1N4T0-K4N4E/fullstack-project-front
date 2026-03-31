import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("cmdk", () => {
  const make = (Tag: "div" | "input" = "div") =>
    React.forwardRef<HTMLElement, Record<string, unknown>>(({ children, ...props }, ref) =>
      React.createElement(Tag, { ...props, ref }, children),
    );

  return {
    Command: Object.assign(make(), {
      Input: make("input"),
      List: make(),
      Empty: make(),
      Group: make(),
      Separator: make(),
      Item: make(),
    }),
  };
});

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

describe("Command", () => {
  it("renders command input and item", () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem>Create</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("renders command root slot", () => {
    const { container } = render(<Command />);
    expect(container.querySelector('[data-slot="command"]')).toBeInTheDocument();
  });

  it("renders dialog, empty state, separator, and shortcut", () => {
    const { container } = render(
      <CommandDialog open>
        <Command>
          <CommandInput placeholder="Type command" />
          <CommandList>
            <CommandEmpty>No commands</CommandEmpty>
            <CommandSeparator />
            <CommandItem>
              Save
              <CommandShortcut>Ctrl+S</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      </CommandDialog>,
    );

    expect(screen.getByText("No commands")).toBeInTheDocument();
    expect(screen.getByText("Ctrl+S")).toBeInTheDocument();
    expect(document.body.querySelector('[data-slot="command-empty"]')).toBeInTheDocument();
    expect(document.body.querySelector('[data-slot="command-separator"]')).toBeInTheDocument();
    expect(document.body.querySelector('[data-slot="command-shortcut"]')).toBeInTheDocument();
  });
});