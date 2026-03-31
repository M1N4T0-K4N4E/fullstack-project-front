import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseIsMobile = vi.fn(() => false);

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

vi.mock("lucide-react", () => ({
  PanelLeftIcon: () => <svg data-testid="panel-left" />,
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: React.PropsWithChildren) => <div data-testid="sheet">{children}</div>,
  SheetContent: ({ children, ...props }: React.ComponentProps<"div">) => (
    <div data-testid="sheet-content" {...props}>
      {children}
    </div>
  ),
  SheetHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SheetTitle: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SheetDescription: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: React.PropsWithChildren) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children }: React.PropsWithChildren) => <>{children}</>,
  TooltipContent: ({ children, hidden, ...props }: React.ComponentProps<"div"> & { hidden?: boolean }) => (
    <div data-testid="tooltip-content" data-hidden={String(Boolean(hidden))} {...props}>
      {children}
    </div>
  ),
}));

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

function Probe() {
  const sidebar = useSidebar();
  return (
    <>
      <span data-testid="probe-state">{sidebar.state}</span>
      <span data-testid="probe-mobile">{String(sidebar.openMobile)}</span>
    </>
  );
}

function SidebarControls() {
  const { setOpen, toggleSidebar } = useSidebar();

  return (
    <>
      <button onClick={() => setOpen(true)}>open-true</button>
      <button onClick={toggleSidebar}>toggle-sidebar</button>
    </>
  );
}

describe("Sidebar", () => {
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false);
    document.cookie = "";
  });

  it("throws when useSidebar is used outside provider", () => {
    expect(() => render(<Probe />)).toThrow("useSidebar must be used within a SidebarProvider.");
  });

  it("renders wrapper slot with custom class", () => {
    const { container } = render(
      <SidebarProvider className="wrapper-class" style={{ opacity: 1 }}>
        <div>Inner</div>
      </SidebarProvider>,
    );

    const wrapper = container.querySelector('[data-slot="sidebar-wrapper"]');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("wrapper-class");
  });

  it("renders collapsible none sidebar", () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none">Sidebar content</Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByText("Sidebar content")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="sidebar"]')).toBeInTheDocument();
  });

  it("renders mobile sidebar through sheet", () => {
    mockUseIsMobile.mockReturnValue(true);

    const { container } = render(
      <SidebarProvider>
        <Sidebar side="right">Mobile content</Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId("sheet")).toBeInTheDocument();
    expect(screen.getByTestId("sheet-content")).toHaveAttribute("data-mobile", "true");
    expect(container.querySelector('[data-slot="sidebar"]')).toBeInTheDocument();
  });

  it("renders desktop sidebar attributes for collapsed state", () => {
    const { container } = render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar side="right" variant="floating" collapsible="icon">
          <span>Desktop</span>
        </Sidebar>
      </SidebarProvider>,
    );

    const sidebar = container.querySelector('[data-slot="sidebar"]');
    expect(sidebar).toHaveAttribute("data-state", "collapsed");
    expect(sidebar).toHaveAttribute("data-side", "right");
    expect(sidebar).toHaveAttribute("data-variant", "floating");
    expect(sidebar).toHaveAttribute("data-collapsible", "icon");
  });

  it("renders desktop default variant classes", () => {
    const { container } = render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar side="left" variant="sidebar" collapsible="icon">
          <span>Desktop Default</span>
        </Sidebar>
      </SidebarProvider>,
    );

    const gap = container.querySelector('[data-slot="sidebar-gap"]');
    const innerContainer = container.querySelector('[data-slot="sidebar-container"]');
    expect(gap?.className).toContain("group-data-[collapsible=icon]:w-(--sidebar-width-icon)");
    expect(innerContainer?.className).toContain("group-data-[side=left]:border-r");
  });

  it("sets empty collapsible attribute when expanded", () => {
    const { container } = render(
      <SidebarProvider defaultOpen>
        <Sidebar>
          <span>Expanded</span>
        </Sidebar>
      </SidebarProvider>,
    );

    const sidebar = container.querySelector('[data-slot="sidebar"]');
    expect(sidebar).toHaveAttribute("data-collapsible", "");
  });

  it("toggles desktop state with trigger and rail and writes cookie", () => {
    const onOpenChange = vi.fn();
    const onTriggerClick = vi.fn();

    const { container } = render(
      <SidebarProvider defaultOpen={false} onOpenChange={onOpenChange}>
        <SidebarTrigger onClick={onTriggerClick}>Toggle</SidebarTrigger>
        <SidebarRail />
        <Probe />
      </SidebarProvider>,
    );

    const trigger = container.querySelector('[data-sidebar="trigger"]');
    const rail = container.querySelector('[data-sidebar="rail"]');
    expect(trigger).toBeInTheDocument();
    expect(rail).toBeInTheDocument();

    fireEvent.click(trigger as Element);
    fireEvent.click(rail as Element);

    expect(onOpenChange).toHaveBeenCalled();
    expect(onTriggerClick).toHaveBeenCalled();
    expect(document.cookie).toContain("sidebar_state=");
  });

  it("toggles mobile state path and supports direct boolean setOpen", () => {
    mockUseIsMobile.mockReturnValue(true);

    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarControls />
        <Probe />
      </SidebarProvider>,
    );

    fireEvent.click(screen.getByText("open-true"));
    expect(screen.getByTestId("probe-state")).toHaveTextContent("expanded");

    fireEvent.click(screen.getByText("toggle-sidebar"));
    expect(screen.getByTestId("probe-mobile")).toHaveTextContent("true");
  });

  it("toggles state with keyboard shortcut for ctrl and meta", () => {
    render(
      <SidebarProvider defaultOpen>
        <Probe />
      </SidebarProvider>,
    );

    expect(screen.getByTestId("probe-state")).toHaveTextContent("expanded");

    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(screen.getByTestId("probe-state")).toHaveTextContent("collapsed");

    fireEvent.keyDown(window, { key: "b", metaKey: true });
    expect(screen.getByTestId("probe-state")).toHaveTextContent("expanded");
  });

  it("renders menu button variants and tooltip branches", () => {
    const { rerender } = render(
      <SidebarProvider defaultOpen={false}>
        <SidebarMenuButton tooltip="Menu Tooltip">Menu Item</SidebarMenuButton>
      </SidebarProvider>,
    );

    expect(screen.getByText("Menu Item")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-content")).toHaveAttribute("data-hidden", "false");

    rerender(
      <SidebarProvider defaultOpen>
        <SidebarMenuButton
          variant="outline"
          size="lg"
          isActive
          tooltip={{ children: "Object Tooltip", side: "left" }}
        >
          Active Item
        </SidebarMenuButton>
      </SidebarProvider>,
    );

    expect(screen.getByText("Object Tooltip")).toBeInTheDocument();

    rerender(
      <SidebarProvider>
        <SidebarMenuButton asChild size="sm" tooltip="Hidden on mobile">
          <a href="#sub">Child Link</a>
        </SidebarMenuButton>
      </SidebarProvider>,
    );

    expect(screen.getByText("Child Link")).toBeInTheDocument();
  });

  it("renders all structural sidebar components", () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarInset>Inset</SidebarInset>
        <SidebarInput placeholder="Find" />
        <SidebarHeader>Header</SidebarHeader>
        <SidebarFooter>Footer</SidebarFooter>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Label</SidebarGroupLabel>
            <SidebarGroupLabel asChild>
              <span>Label Child</span>
            </SidebarGroupLabel>
            <SidebarGroupAction>Action</SidebarGroupAction>
            <SidebarGroupAction asChild>
              <span>Action Child</span>
            </SidebarGroupAction>
            <SidebarGroupContent>Group Content</SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Button</SidebarMenuButton>
                <SidebarMenuAction showOnHover>Menu Action</SidebarMenuAction>
                <SidebarMenuAction>Menu Action 2</SidebarMenuAction>
                <SidebarMenuAction asChild>
                  <span>Menu Action Child</span>
                </SidebarMenuAction>
                <SidebarMenuBadge>9</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton />
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton isActive size="sm">
                    Sub Button
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild size="md">
                    <a href="#child">Sub Child</a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </SidebarProvider>,
    );

    expect(screen.getByText("Inset")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Find")).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
    expect(screen.getByText("Menu Action Child")).toBeInTheDocument();
    expect(screen.getByText("Label Child")).toBeInTheDocument();
    expect(screen.getByText("Action Child")).toBeInTheDocument();
    expect(screen.getByText("Sub Child")).toBeInTheDocument();
  });
});