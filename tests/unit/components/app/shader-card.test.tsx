import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShaderCard } from "@/components/app/shader-card";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("ShaderCard", () => {
  it("renders card details and destination link", () => {
    render(
      <ShaderCard
        url="/shader/abc123"
        name="Nebula Waves"
        username="mudrock"
        like={42}
        dislike={3}
      />,
    );

    expect(screen.getByText("Nebula Waves")).toBeInTheDocument();
    expect(screen.getByText("mudrock")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/shader/abc123");
  });

  it("uses fallback values when optional display fields are missing", () => {
    const { container } = render(
      <ShaderCard
        {...({
          url: undefined,
          name: undefined,
          username: "anonymous",
          like: undefined,
          dislike: undefined,
        } as unknown as React.ComponentProps<typeof ShaderCard>)}
      />,
    );

    expect(screen.getByText("Untitled")).toBeInTheDocument();
    expect(screen.getByText("anonymous")).toBeInTheDocument();

    const link = container.querySelector("a");
    expect(link).toBeTruthy();
    expect(link).toHaveAttribute("href", "");

    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(2);
  });
});
