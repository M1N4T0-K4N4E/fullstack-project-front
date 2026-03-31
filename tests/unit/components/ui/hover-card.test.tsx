import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

describe("HoverCard", () => {
  it("renders trigger", () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Open card</HoverCardTrigger>
      </HoverCard>,
    );

    expect(screen.getByText("Open card")).toBeInTheDocument();
  });

  it("renders content when open", () => {
    render(
      <HoverCard open>
        <HoverCardTrigger>Open</HoverCardTrigger>
        <HoverCardContent>Card details</HoverCardContent>
      </HoverCard>,
    );

    expect(screen.getByText("Card details")).toBeInTheDocument();
  });
});