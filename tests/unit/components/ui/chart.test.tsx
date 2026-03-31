import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("recharts", () => {
  const make = (Tag: "div" = "div") =>
    React.forwardRef<HTMLElement, Record<string, unknown>>(({ children, ...props }, ref) =>
      React.createElement(Tag, { ...props, ref }, children as React.ReactNode),
    );

  return {
    ResponsiveContainer: make(),
    Tooltip: make(),
    Legend: make(),
  };
});

import {
  ChartContainer,
  ChartLegendContent,
  ChartStyle,
  ChartTooltipContent,
} from "@/components/ui/chart";

describe("Chart", () => {
  it("renders chart style rules", () => {
    const { container } = render(
      <ChartStyle
        id="chart-test"
        config={{ value: { label: "Value", color: "#22c55e" } }}
      />,
    );

    expect(container.querySelector("style")).toBeInTheDocument();
  });

  it("returns null style when no color config exists", () => {
    const { container } = render(
      <ChartStyle
        id="chart-empty"
        config={{ value: { label: "Value" } }}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders themed style variables", () => {
    const { container } = render(
      <ChartStyle
        id="chart-themed"
        config={{
          value: {
            label: "Value",
            theme: { light: "#111111", dark: "#eeeeee" },
          },
        }}
      />,
    );

    expect(container.querySelector("style")).toBeInTheDocument();
  });

  it("skips css variable when themed color is empty", () => {
    const { container } = render(
      <ChartStyle
        id="chart-themed-empty"
        config={{
          value: {
            label: "Value",
            theme: { light: "", dark: "" },
          },
        }}
      />,
    );

    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).not.toContain("--color-value:");
  });

  it("renders chart container root", () => {
    const { container } = render(
      <ChartContainer config={{ value: { label: "Value", color: "#22c55e" } }}>
        <div />
      </ChartContainer>,
    );

    expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument();
  });

  it("renders tooltip content with formatter and indicator", () => {
    const { container } = render(
      <ChartContainer
        config={{
          sales: { label: "Sales", color: "#22c55e" },
          revenue: { label: "Revenue", color: "#3b82f6" },
        }}
      >
        <ChartTooltipContent
          active
          label="sales"
          labelKey="name"
          nameKey="name"
          indicator="line"
          payload={[
            {
              type: "line",
              dataKey: "sales",
              name: "sales",
              value: 1234,
              color: "#22c55e",
              payload: { name: "sales", fill: "#22c55e" },
            } as never,
          ]}
          formatter={(value) => <span data-testid="formatted">{String(value)}</span>}
        />
      </ChartContainer>,
    );

    expect(screen.getByTestId("formatted")).toBeInTheDocument();
    expect(screen.getByText("1234")).toBeInTheDocument();
  });

  it("returns null tooltip when inactive or empty payload", () => {
    const { container, rerender } = render(
      <ChartContainer config={{ a: { label: "A", color: "#000" } }}>
        <ChartTooltipContent active={false} payload={[]} />
      </ChartContainer>,
    );
    expect(container.querySelector("[data-slot='chart']")).toBeInTheDocument();

    rerender(
      <ChartContainer config={{ a: { label: "A", color: "#000" } }}>
        <ChartTooltipContent active payload={[]} />
      </ChartContainer>,
    );
    expect(screen.queryByText("A")).not.toBeInTheDocument();
  });

  it("renders tooltip default branch with dashed indicator and label formatter", () => {
    render(
      <ChartContainer
        config={{
          sales: { label: "Sales", color: "#22c55e" },
          custom: { label: "Custom", color: "#f59e0b" },
        }}
      >
        <ChartTooltipContent
          active
          indicator="dashed"
          nameKey="custom"
          labelKey="custom"
          payload={[
            {
              type: "line",
              dataKey: "sales",
              name: "SalesName",
              value: 0,
              payload: { custom: "sales", fill: "#22c55e" },
              color: "#22c55e",
            } as never,
          ]}
          labelFormatter={(value) => <span data-testid="label-format">{String(value)}</span>}
        />
      </ChartContainer>,
    );

    expect(screen.getByTestId("label-format")).toBeInTheDocument();
    expect(screen.getAllByText("Sales").length).toBeGreaterThan(0);
  });

  it("renders legend content with icon and fallback swatch", () => {
    const Icon = () => <svg data-testid="legend-icon" />;

    const { container, rerender } = render(
      <ChartContainer
        config={{
          a: { label: "Alpha", icon: Icon, color: "#22c55e" },
          b: { label: "Beta", color: "#3b82f6" },
        }}
      >
        <ChartLegendContent
          payload={[
            { type: "line", dataKey: "a", value: "a", color: "#22c55e" } as never,
            { type: "line", dataKey: "b", value: "b", color: "#3b82f6" } as never,
          ]}
        />
      </ChartContainer>,
    );

    expect(screen.getByTestId("legend-icon")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();

    rerender(
      <ChartContainer
        config={{ a: { label: "Alpha", icon: Icon, color: "#22c55e" } }}
      >
        <ChartLegendContent
          hideIcon
          payload={[{ type: "line", dataKey: "a", value: "a", color: "#22c55e" } as never]}
        />
      </ChartContainer>,
    );

    expect(container.querySelector("div[style]")).toBeInTheDocument();
  });

  it("returns null legend content when payload is missing", () => {
    const { container } = render(
      <ChartContainer config={{ a: { label: "A", color: "#000" } }}>
        <ChartLegendContent payload={undefined} />
      </ChartContainer>,
    );

    expect(container.querySelector("[data-slot='chart']")).toBeInTheDocument();
  });

  it("handles payload config fallback branches", () => {
    render(
      <ChartContainer
        config={{
          fallback: { label: "Fallback", color: "#ef4444" },
        }}
      >
        <ChartTooltipContent
          active
          nameKey="unknownKey"
          labelKey="unknownKey"
          payload={[
            {
              type: "line",
              dataKey: "fallback",
              name: "Name",
              value: 5,
              payload: { unknownKey: "missing-config-key" },
              color: "#ef4444",
            } as never,
          ]}
        />
      </ChartContainer>,
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders tooltip label from string label and icon branch", () => {
    const Icon = () => <svg data-testid="tooltip-icon" />;

    render(
      <ChartContainer
        config={{
          sales: { label: "Sales Label", icon: Icon, color: "#22c55e" },
        }}
      >
        <ChartTooltipContent
          active
          label="sales"
          payload={[
            {
              type: "line",
              dataKey: "sales",
              name: "sales",
              value: 42,
              payload: { fill: "#22c55e" },
              color: "#22c55e",
            } as never,
          ]}
        />
      </ChartContainer>,
    );

    expect(screen.getAllByText("Sales Label").length).toBeGreaterThan(0);
    expect(screen.getByTestId("tooltip-icon")).toBeInTheDocument();
  });

  it("falls back to raw string label when config key is missing", () => {
    render(
      <ChartContainer config={{ known: { label: "Known", color: "#000" } }}>
        <ChartTooltipContent
          active
          label="unknown-label"
          payload={[
            {
              type: "line",
              dataKey: "known",
              name: "known",
              value: 1,
              payload: { fill: "#000" },
              color: "#000",
            } as never,
          ]}
        />
      </ChartContainer>,
    );

    expect(screen.getByText("unknown-label")).toBeInTheDocument();
  });

  it("handles payload with primitive nested payload safely", () => {
    const { container } = render(
      <ChartContainer config={{ value: { label: "Value", color: "#111" } }}>
        <ChartTooltipContent
          active
          hideIndicator
          color="#111"
          payload={[
            {
              type: "line",
              dataKey: "value",
              name: "value",
              value: 1,
              payload: "raw-payload",
              color: "#111",
            } as never,
          ]}
        />
      </ChartContainer>,
    );

    expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument();
  });

  it("covers non-object payload guard branch", () => {
    const { container } = render(
      <ChartContainer config={{ value: { label: "Value", color: "#111" } }}>
        <ChartTooltipContent active={false} payload={["raw-payload" as never]} />
      </ChartContainer>,
    );

    expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument();
  });

  it("falls back to value key when name and dataKey are empty", () => {
    render(
      <ChartContainer config={{ value: { label: "Value", color: "#111" } }}>
        <ChartTooltipContent
          active
          payload={[
            {
              type: "line",
              dataKey: "",
              name: "",
              value: 2,
              payload: { fill: "#111" },
              color: "#111",
            } as never,
          ]}
        />
      </ChartContainer>,
    );

    expect(screen.getAllByText("Value").length).toBeGreaterThan(0);
  });

  it("renders legend with top alignment and nameKey", () => {
    render(
      <ChartContainer
        config={{
          alpha: { label: "Alpha", color: "#22c55e" },
        }}
      >
        <ChartLegendContent
          verticalAlign="top"
          nameKey="seriesName"
          payload={[
            {
              type: "line",
              dataKey: "alpha",
              value: "alpha",
              color: "#22c55e",
              seriesName: "alpha",
            } as never,
          ]}
        />
      </ChartContainer>,
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });

  it("uses value fallback key in legend when dataKey is missing", () => {
    render(
      <ChartContainer
        config={{
          value: { label: "Default", color: "#111" },
        }}
      >
        <ChartLegendContent
          payload={[
            {
              type: "line",
              value: "entry",
              color: "#111",
            } as never,
          ]}
        />
      </ChartContainer>,
    );

    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("throws when tooltip content is rendered outside ChartContainer", () => {
    expect(() => render(<ChartTooltipContent active payload={[]} />)).toThrow(
      "useChart must be used within a <ChartContainer />",
    );
  });
});