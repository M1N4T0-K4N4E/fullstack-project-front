import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  CardAction,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

describe("Card", () => {
  it("renders card content", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
          <CardAction>Edit</CardAction>
        </CardHeader>
        <CardContent>Main content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>,
    );

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Manage your account settings")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Main content")).toBeInTheDocument();
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("applies size data attribute", () => {
    const { container } = render(<Card size="sm">Compact</Card>);

    const card = container.querySelector('[data-slot="card"]');
    expect(card).toHaveAttribute("data-size", "sm");
  });
});