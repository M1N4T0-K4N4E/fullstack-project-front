import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

describe("Dialog", () => {
  it("renders trigger", () => {
    render(
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
      </Dialog>,
    );

    expect(screen.getByText("Open dialog")).toBeInTheDocument();
  });

  it("renders content when open", () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>Footer area</DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText("Dialog title")).toBeInTheDocument();
    expect(screen.getByText("Dialog description")).toBeInTheDocument();
    expect(screen.getByText("Footer area")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("renders explicit dialog close wrapper", () => {
    render(
      <Dialog open>
        <DialogClose>Close now</DialogClose>
      </Dialog>,
    );

    expect(screen.getByText("Close now")).toBeInTheDocument();
  });

  it("renders default close button in dialog content", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Closable</DialogTitle>
          <DialogDescription>Accessible description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});