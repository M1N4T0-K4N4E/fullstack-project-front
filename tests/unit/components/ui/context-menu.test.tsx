import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("radix-ui", () => {
  const make = (Tag: "div" | "button" | "span" = "div") =>
    React.forwardRef<HTMLElement, Record<string, unknown>>(
      ({ children, alignOffset, sideOffset, onValueChange, asChild, ...props }, ref) =>
        React.createElement(Tag, { ...props, ref }, children),
    );

  return {
    ContextMenu: {
      Root: make(),
      Trigger: make("button"),
      Group: make(),
      Portal: make(),
      Sub: make(),
      RadioGroup: make(),
      Content: make(),
      Item: make(),
      SubTrigger: make("button"),
      SubContent: make(),
      CheckboxItem: make(),
      RadioItem: make(),
      Label: make(),
      Separator: make(),
      ItemIndicator: make("span"),
    },
  };
});

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

describe("ContextMenu", () => {
  it("renders trigger", () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click target</ContextMenuTrigger>
      </ContextMenu>,
    );

    expect(screen.getByText("Right click target")).toBeInTheDocument();
  });

  it("renders all context menu wrappers and slots", () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger className="trigger-class">Target</ContextMenuTrigger>
        <ContextMenuContent className="content-class">
          <ContextMenuLabel inset>Actions</ContextMenuLabel>
          <ContextMenuGroup>
            <ContextMenuItem inset variant="destructive">Delete</ContextMenuItem>
            <ContextMenuItem>Copy <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut></ContextMenuItem>
            <ContextMenuCheckboxItem checked inset>Pin</ContextMenuCheckboxItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger inset>More</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Sub action</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuRadioGroup value="one" onValueChange={() => {}}>
              <ContextMenuRadioItem value="one" inset>One</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuGroup>
        </ContextMenuContent>
        <ContextMenuPortal>
          <div data-testid="context-menu-portal-marker">Portal marker</div>
        </ContextMenuPortal>
      </ContextMenu>,
    );

    expect(container.querySelector('[data-slot="context-menu-trigger"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="context-menu-content"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="context-menu-item"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="context-menu-checkbox-item"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="context-menu-radio-group"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="context-menu-radio-item"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="context-menu-sub-trigger"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="context-menu-sub-content"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="context-menu-label"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="context-menu-separator"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="context-menu-shortcut"]')).toBeInTheDocument();
    expect(screen.getByTestId("context-menu-portal-marker")).toBeInTheDocument();
  });
});