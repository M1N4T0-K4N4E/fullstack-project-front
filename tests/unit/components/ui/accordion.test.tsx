import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

describe("Accordion", () => {
  it("renders trigger and content", () => {
    render(
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is this?</AccordionTrigger>
          <AccordionContent>Accordion answer</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.getByText("What is this?")).toBeInTheDocument();
    expect(screen.getByText("Accordion answer")).toBeInTheDocument();
  });

  it("renders root data slot", () => {
    const { container } = render(<Accordion type="single" collapsible />);
    expect(container.querySelector('[data-slot="accordion"]')).toBeInTheDocument();
  });
});