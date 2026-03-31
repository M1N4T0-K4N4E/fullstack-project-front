import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("radix-ui", () => {
  const make = (Tag: "div" | "button" | "a" = "div") =>
    React.forwardRef<HTMLElement, Record<string, unknown>>(({ children, ...props }, ref) =>
      React.createElement(Tag, { ...props, ref }, children),
    );

  return {
    NavigationMenu: {
      Root: make("nav"),
      List: make("div"),
      Item: make("div"),
      Trigger: make("button"),
      Content: make("div"),
      Viewport: make("div"),
      Link: make("a"),
      Indicator: make("div"),
    },
  };
});
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

describe("NavigationMenu", () => {
  it("renders navigation trigger", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>Menu content</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    expect(screen.getByText("Products")).toBeInTheDocument();
  });

  it("renders viewport by default", () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Item</NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    expect(container.querySelector('[data-slot="navigation-menu"]')).toHaveAttribute("data-viewport", "true");
  });

  it("supports viewport false and renders link + indicator", () => {
    const { container } = render(
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#">Guide</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuIndicator />
        <NavigationMenuViewport />
      </NavigationMenu>,
    );

    expect(container.querySelector('[data-slot="navigation-menu"]')).toHaveAttribute("data-viewport", "false");
    expect(screen.getByRole("button", { name: "Docs" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Guide" })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="navigation-menu-indicator"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="navigation-menu-viewport"]')).toBeInTheDocument();
  });
});
