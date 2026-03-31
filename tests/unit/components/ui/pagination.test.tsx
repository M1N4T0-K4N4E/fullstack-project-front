import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  PaginationEllipsis,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

describe("Pagination", () => {
  it("renders pagination navigation", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByRole("navigation", { name: "pagination" })).toBeInTheDocument();
    expect(screen.getByLabelText("Go to previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to next page")).toBeInTheDocument();
  });

  it("marks active page link", () => {
    render(
      <PaginationLink href="#" isActive>
        2
      </PaginationLink>,
    );

    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
  });

  it("renders ellipsis and custom previous/next labels", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" text="Prev" />
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" text="Nxt" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByText("Prev")).toBeInTheDocument();
    expect(screen.getByText("Nxt")).toBeInTheDocument();
    expect(screen.getByText("More pages")).toBeInTheDocument();
  });
});