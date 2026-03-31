import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Textarea } from "@/components/ui/textarea";

describe("Textarea", () => {
  it("renders a textarea element", () => {
    render(<Textarea aria-label="Bio" />);

    expect(screen.getByRole("textbox", { name: "Bio" })).toBeInTheDocument();
  });

  it("applies passed attributes", () => {
    render(<Textarea aria-label="Description" placeholder="Write here..." required rows={4} />);

    const textarea = screen.getByRole("textbox", { name: "Description" });
    expect(textarea).toHaveAttribute("placeholder", "Write here...");
    expect(textarea).toHaveAttribute("rows", "4");
    expect(textarea).toBeRequired();
  });
});