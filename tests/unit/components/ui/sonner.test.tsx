import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Toaster } from "@/components/ui/sonner";

describe("Toaster", () => {
  it("renders toaster", () => {
    const { container } = render(<Toaster />);
    expect(container).toBeInTheDocument();
  });

  it("accepts custom props", () => {
    const { container } = render(<Toaster richColors />);
    expect(container).toBeInTheDocument();
  });
});