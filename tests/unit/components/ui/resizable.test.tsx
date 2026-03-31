import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

describe("Resizable", () => {
  it("renders panel group, panel slots, and merged className", () => {
    const { container } = render(
      <div style={{ width: 400, height: 200 }}>
        <ResizablePanelGroup className="custom-group">
          <ResizablePanel defaultSize={50}>Left</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>Right</ResizablePanel>
        </ResizablePanelGroup>
      </div>,
    );

    const group = container.querySelector('[data-slot="resizable-panel-group"]');
    const handle = container.querySelector('[data-slot="resizable-handle"]');
    const panels = container.querySelectorAll('[data-slot="resizable-panel"]');

    expect(group).toBeInTheDocument();
    expect(group).toHaveClass("custom-group");
    expect(handle).toBeInTheDocument();
    expect(panels).toHaveLength(2);
  });

  it("renders handle with indicator", () => {
    const { container } = render(
      <div style={{ width: 400, height: 200 }}>
        <ResizablePanelGroup>
          <ResizablePanel defaultSize={50}>Left</ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>Right</ResizablePanel>
        </ResizablePanelGroup>
      </div>,
    );
    expect(container.querySelector('[data-slot="resizable-handle"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="resizable-handle"] > div')).toBeInTheDocument();
  });

  it("does not render indicator when withHandle is false", () => {
    const { container } = render(
      <div style={{ width: 400, height: 200 }}>
        <ResizablePanelGroup>
          <ResizablePanel defaultSize={50}>Left</ResizablePanel>
          <ResizableHandle withHandle={false} />
          <ResizablePanel defaultSize={50}>Right</ResizablePanel>
        </ResizablePanelGroup>
      </div>,
    );

    expect(container.querySelector('[data-slot="resizable-handle"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="resizable-handle"] > div')).not.toBeInTheDocument();
  });
});
