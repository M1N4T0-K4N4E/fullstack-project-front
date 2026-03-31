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
    Menubar: {
      Root: make(),
      Menu: make(),
      Group: make(),
      Portal: make(),
      RadioGroup: make(),
      Trigger: make("button"),
      Content: make(),
      Item: make(),
      CheckboxItem: make(),
      RadioItem: make(),
      Label: make(),
      Separator: make(),
      Sub: make(),
      SubTrigger: make("button"),
      SubContent: make(),
      ItemIndicator: make("span"),
    },
  };
});

import {
  MenubarCheckboxItem,
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

describe("Menubar", () => {
  it("renders menubar trigger", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
        </MenubarMenu>
      </Menubar>,
    );

    expect(screen.getByText("File")).toBeInTheDocument();
  });

  it("renders menu content when open", () => {
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Menu</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );

    expect(screen.getByText("Menu")).toBeInTheDocument();
  });

  it("renders all menubar wrappers and slots", () => {
    const { container } = render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Main</MenubarTrigger>
          <MenubarContent align="end" alignOffset={0} sideOffset={4} className="content-class">
            <MenubarLabel inset>Actions</MenubarLabel>
            <MenubarGroup>
              <MenubarItem inset variant="destructive">Delete</MenubarItem>
              <MenubarItem>Copy <MenubarShortcut>Ctrl+C</MenubarShortcut></MenubarItem>
              <MenubarCheckboxItem checked inset>Pin</MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger inset>More</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Sub action</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarRadioGroup value="a" onValueChange={() => {}}>
                <MenubarRadioItem value="a" inset>A</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarGroup>
          </MenubarContent>
          <MenubarPortal>
            <div data-testid="menubar-portal-marker">Portal marker</div>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>,
    );

    expect(container.querySelector('[data-slot="menubar-trigger"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="menubar-content"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="menubar-group"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="menubar-item"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="menubar-checkbox-item"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="menubar-radio-group"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="menubar-radio-item"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="menubar-label"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="menubar-separator"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="menubar-shortcut"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="menubar-sub-trigger"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="menubar-sub-content"]')).toBeInTheDocument();
    expect(screen.getByTestId("menubar-portal-marker")).toBeInTheDocument();
  });
});