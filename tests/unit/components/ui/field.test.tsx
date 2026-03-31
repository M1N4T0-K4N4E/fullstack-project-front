import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";

describe("Field", () => {
  it("renders field with label and content", () => {
    render(
      <Field>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <FieldContent>
          <input id="name" />
        </FieldContent>
      </Field>,
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("renders description and error", () => {
    render(
      <FieldSet>
        <FieldTitle>Account</FieldTitle>
        <FieldDescription>Enter your details.</FieldDescription>
        <FieldError>Required field.</FieldError>
      </FieldSet>,
    );

    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Enter your details.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Required field.");
  });

  it("renders field group with legend and separator content", () => {
    const { container } = render(
      <FieldGroup>
        <FieldLegend variant="label">Legend label</FieldLegend>
        <Field orientation="horizontal">
          <FieldLabel>Email</FieldLabel>
          <FieldContent>
            <input aria-label="email" />
          </FieldContent>
        </Field>
        <FieldSeparator>OR</FieldSeparator>
      </FieldGroup>,
    );

    expect(screen.getByText("Legend label")).toBeInTheDocument();
    expect(screen.getByText("OR")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="field-separator-content"]')).toBeInTheDocument();
  });

  it("renders unique and multiple errors from errors prop", () => {
    const { rerender } = render(
      <FieldError errors={[{ message: "Same" }, { message: "Same" }]} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Same");

    rerender(
      <FieldError
        errors={[{ message: "A" }, { message: "B" }, { message: "A" }]}
      />,
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("returns null when no error content is available", () => {
    const { queryByRole } = render(<FieldError errors={[]} />);
    expect(queryByRole("alert")).not.toBeInTheDocument();
  });
});