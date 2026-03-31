import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("Label", () => {
  it("renders label text", () => {
    render(<Label>Username</Label>);

    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("applies htmlFor attribute", () => {
    render(
      <div>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </div>,
    );

    expect(screen.getByText("Email")).toHaveAttribute("for", "email");
  });
});