import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";

describe("NativeSelect", () => {
  it("renders select options", () => {
    render(
      <NativeSelect aria-label="Language" defaultValue="ts">
        <NativeSelectOption value="js">JavaScript</NativeSelectOption>
        <NativeSelectOption value="ts">TypeScript</NativeSelectOption>
      </NativeSelect>,
    );

    expect(screen.getByRole("combobox", { name: "Language" })).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("applies size data attribute", () => {
    const { container } = render(<NativeSelect aria-label="Size" size="sm" />);
    expect(container.querySelector('[data-slot="native-select"]')).toHaveAttribute("data-size", "sm");
  });

  it("renders optgroup wrapper", () => {
    render(
      <NativeSelect aria-label="Grouped" defaultValue="a">
        <NativeSelectOptGroup label="Group 1">
          <NativeSelectOption value="a">A</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>,
    );

    expect(screen.getByRole("group", { name: "Group 1" })).toBeInTheDocument();
  });
});
