import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

describe("Collapsible", () => {
  it("renders trigger", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      </Collapsible>,
    );

    expect(screen.getByText("Toggle")).toBeInTheDocument();
  });

  it("renders content when open", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Visible content</CollapsibleContent>
      </Collapsible>,
    );

    expect(screen.getByText("Visible content")).toBeInTheDocument();
  });
});