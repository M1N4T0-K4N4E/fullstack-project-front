import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  SheetClose,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

describe("Sheet", () => {
  it("renders trigger", () => {
    render(
      <Sheet>
        <SheetTrigger>Open sheet</SheetTrigger>
      </Sheet>,
    );

    expect(screen.getByText("Open sheet")).toBeInTheDocument();
  });

  it("renders content when open", () => {
    render(
      <Sheet open>
        <SheetContent side="left" showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>Sheet title</SheetTitle>
            <SheetDescription>Sheet description</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <SheetClose>Dismiss</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByText("Sheet title")).toBeInTheDocument();
    expect(screen.getByText("Sheet description")).toBeInTheDocument();
    expect(screen.getByText("Dismiss")).toBeInTheDocument();
  });

  it("renders default close button in sheet content", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Closable sheet</SheetTitle>
          <SheetDescription>Accessible description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});