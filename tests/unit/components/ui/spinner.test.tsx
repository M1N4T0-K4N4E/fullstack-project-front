import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "@/components/ui/spinner";

describe("Spinner", () => {
  it("renders loading status", () => {
    render(<Spinner />);

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("applies passed className", () => {
    render(<Spinner className="size-6" />);

    const spinner = screen.getByRole("status", { name: "Loading" });
    expect(spinner).toHaveClass("size-6");
  });
});