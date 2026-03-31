import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders badge text", () => {
    render(<Badge>New</Badge>);

    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies variant data attribute", () => {
    render(<Badge variant="destructive">Warning</Badge>);

    const badge = screen.getByText("Warning");
    expect(badge).toHaveAttribute("data-variant", "destructive");
  });

  it("supports asChild rendering", () => {
    render(
      <Badge asChild variant="secondary">
        <a href="#">Link badge</a>
      </Badge>,
    );

    const linkBadge = screen.getByRole("link", { name: "Link badge" });
    expect(linkBadge).toHaveAttribute("data-slot", "badge");
    expect(linkBadge).toHaveAttribute("data-variant", "secondary");
  });
});