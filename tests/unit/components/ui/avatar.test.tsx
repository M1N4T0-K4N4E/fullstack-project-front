import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar";

describe("Avatar", () => {
  it("renders avatar fallback", () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("renders avatar group count", () => {
    render(
      <AvatarGroup>
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+2</AvatarGroupCount>
      </AvatarGroup>,
    );

    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("renders avatar image and badge", () => {
    const { container } = render(
      <Avatar size="lg">
        <AvatarImage src="/avatar.png" alt="User avatar" />
        <AvatarFallback>UA</AvatarFallback>
        <AvatarBadge>•</AvatarBadge>
      </Avatar>,
    );

    expect(screen.getByText("•")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="avatar-badge"]')).toBeInTheDocument();
  });
});