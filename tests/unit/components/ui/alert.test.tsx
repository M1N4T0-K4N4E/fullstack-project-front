import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";

describe("Alert", () => {
  it("renders alert with title and description", () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>This action cannot be undone.</AlertDescription>
      </Alert>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("applies variant data attributes through classes", () => {
    render(<Alert variant="destructive">Danger zone</Alert>);

    expect(screen.getByRole("alert")).toHaveTextContent("Danger zone");
  });

  it("renders alert action slot", () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Notice</AlertTitle>
        <AlertDescription>Read this</AlertDescription>
        <AlertAction>Dismiss</AlertAction>
      </Alert>,
    );

    expect(screen.getByText("Dismiss")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="alert-action"]')).toBeInTheDocument();
  });
});