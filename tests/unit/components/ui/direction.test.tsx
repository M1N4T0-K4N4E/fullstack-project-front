import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { useDirection } from "@/components/ui/direction";
import { DirectionProvider } from "@/components/ui/direction";

describe("DirectionProvider", () => {
  it("renders children", () => {
    render(
      <DirectionProvider direction="rtl" dir={"rtl"}>
        <div>Directional content</div>
      </DirectionProvider>,
    );

    expect(screen.getByText("Directional content")).toBeInTheDocument();
  });

  it("supports ltr direction", () => {
    render(
      <DirectionProvider direction="ltr" dir={"rtl"}>
        <div>LTR content</div>
      </DirectionProvider>,
    );

    expect(screen.getByText("LTR content")).toBeInTheDocument();
  });

  it("falls back to dir when direction is undefined", () => {
    function Probe() {
      return <div>{useDirection()}</div>;
    }

    render(
      <DirectionProvider dir="rtl">
        <Probe />
      </DirectionProvider>,
    );

    expect(screen.getByText("rtl")).toBeInTheDocument();
  });
});
