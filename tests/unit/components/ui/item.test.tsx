import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";

describe("Item", () => {
  it("renders item composition", () => {
    render(
      <ItemGroup>
        <Item variant="outline" size="sm">
          <ItemHeader>
            <ItemTitle>Profile</ItemTitle>
            <ItemActions>Action</ItemActions>
          </ItemHeader>
          <ItemContent>
            <ItemDescription>Update your profile settings.</ItemDescription>
          </ItemContent>
          <ItemFooter>Footer note</ItemFooter>
        </Item>
      </ItemGroup>,
    );

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Update your profile settings.")).toBeInTheDocument();
    expect(screen.getByText("Footer note")).toBeInTheDocument();
  });

  it("applies item variant and size attributes", () => {
    const { container } = render(
      <Item variant="muted" size="xs">
        Content
      </Item>,
    );

    const item = container.querySelector('[data-slot="item"]');
    expect(item).toHaveAttribute("data-variant", "muted");
    expect(item).toHaveAttribute("data-size", "xs");
  });

  it("renders media variants, separator, and asChild item", () => {
    const { container } = render(
      <ItemGroup>
        <Item asChild>
          <a href="#">As child item</a>
        </Item>
        <ItemMedia variant="icon">I</ItemMedia>
        <ItemMedia variant="image">
          <img src="/x.png" alt="x" />
        </ItemMedia>
        <ItemSeparator />
      </ItemGroup>,
    );

    expect(screen.getByRole("link", { name: "As child item" })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="item-media"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="item-separator"]')).toBeInTheDocument();
  });
});