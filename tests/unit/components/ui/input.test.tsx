import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input aria-label="Username" />);

    expect(screen.getByRole("textbox", { name: "Username" })).toBeInTheDocument();
  });

  it("applies passed attributes", () => {
    render(<Input aria-label="Email" type="email" placeholder="name@example.com" required />);

    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("placeholder", "name@example.com");
    expect(input).toBeRequired();
  });
});