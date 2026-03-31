import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  DropdownMenuCheckboxItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

describe("DropdownMenu", () => {
  it("renders trigger", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      </DropdownMenu>,
    );

    expect(screen.getByText("Open menu")).toBeInTheDocument();
  });

  it("renders content when open", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders all dropdown menu wrappers and slots", () => {
    const { container } = render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Options</DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="content-class">
          <DropdownMenuLabel inset>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem inset variant="destructive">Delete</DropdownMenuItem>
            <DropdownMenuItem>Copy <DropdownMenuShortcut>Ctrl+C</DropdownMenuShortcut></DropdownMenuItem>
            <DropdownMenuCheckboxItem checked inset>Pin</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub open>
              <DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub action</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuRadioGroup value="a" onValueChange={() => {}}>
              <DropdownMenuRadioItem value="a" inset>A</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
        <DropdownMenuPortal>
          <div data-testid="dropdown-menu-portal-marker">Portal marker</div>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );

    expect(container.querySelector('[data-slot="dropdown-menu-trigger"]')).toBeInTheDocument();
    expect(document.body.querySelector('[data-slot="dropdown-menu-content"]')).toBeInTheDocument();
    expect(document.body.querySelector('[data-slot="dropdown-menu-group"]')).toBeInTheDocument();
    expect(document.body.querySelector('[data-slot="dropdown-menu-item"]')).toBeInTheDocument();
    expect(document.body.querySelector('[data-slot="dropdown-menu-checkbox-item"]')).toBeInTheDocument();
    expect(document.body.querySelector('[data-slot="dropdown-menu-radio-group"]')).toBeInTheDocument();
    expect(document.body.querySelector('[data-slot="dropdown-menu-radio-item"]')).toBeInTheDocument();
    expect(document.body.querySelector('[data-slot="dropdown-menu-label"]')).toBeInTheDocument();
    expect(document.body.querySelector('[data-slot="dropdown-menu-separator"]')).toBeInTheDocument();
    expect(document.body.querySelector('[data-slot="dropdown-menu-shortcut"]')).toBeInTheDocument();
    expect(document.body.querySelector('[data-slot="dropdown-menu-sub-trigger"]')).toBeInTheDocument();
    expect(document.body.querySelector('[data-slot="dropdown-menu-sub-content"]')).toBeInTheDocument();
    expect(screen.getByTestId("dropdown-menu-portal-marker")).toBeInTheDocument();
  });
});
