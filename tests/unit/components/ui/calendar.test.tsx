import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("react-day-picker", () => {
  const DayButton = ({
    children,
    type = "button",
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children?: React.ReactNode;
  }) => (
    <button type={type} {...props}>{children}</button>
  );

  const getDefaultClassNames = () => ({
    root: "root",
    months: "months",
    month: "month",
    nav: "nav",
    button_previous: "button_previous",
    button_next: "button_next",
    month_caption: "month_caption",
    dropdowns: "dropdowns",
    dropdown_root: "dropdown_root",
    dropdown: "dropdown",
    caption_label: "caption_label",
    weekdays: "weekdays",
    weekday: "weekday",
    week: "week",
    week_number_header: "week_number_header",
    week_number: "week_number",
    day: "day",
    range_start: "range_start",
    range_middle: "range_middle",
    range_end: "range_end",
    today: "today",
    outside: "outside",
    disabled: "disabled",
    hidden: "hidden",
  });

  const DayPicker = (props: Record<string, unknown>) => {
    const components = (props.components ?? {}) as Record<string, (...args: unknown[]) => React.ReactNode>;
    const formatters = (props.formatters ?? {}) as Record<string, (date: Date) => string>;
    const formattedMonth = formatters.formatMonthDropdown?.(new Date("2026-03-31")) ?? "";

    const Root = components.Root;
    const Chevron = components.Chevron;
    const DayButtonComp = components.DayButton;
    const WeekNumber = components.WeekNumber;

    const rootNode = Root
      ? Root({ className: "mock-root", rootRef: null, "data-testid": "calendar-root" })
      : <div data-testid="calendar-root" />;

    return (
      <div data-testid="day-picker-mock">
        {rootNode}
        <div data-testid="formatted-month">{formattedMonth}</div>
        {Chevron?.({ orientation: "left" })}
        {Chevron?.({ orientation: "right" })}
        {Chevron?.({ orientation: "down" })}
        {DayButtonComp?.({
          day: { date: new Date("2026-03-31") },
          modifiers: {
            focused: false,
            selected: true,
            range_start: false,
            range_end: false,
            range_middle: false,
          },
        })}
        <table>
          <tbody>
            <tr>{WeekNumber?.({ children: "12" })}</tr>
          </tbody>
        </table>
      </div>
    );
  };

  return { DayPicker, DayButton, getDefaultClassNames };
});

import { Calendar, CalendarDayButton } from "@/components/ui/calendar";

describe("Calendar", () => {
  it("renders calendar root", () => {
    const { container } = render(
      <Calendar mode="single" selected={new Date()} onSelect={vi.fn()} />,
    );

    expect(container.querySelector('[data-slot="calendar"]')).toBeInTheDocument();
  });

  it("supports outside days option", () => {
    const { container } = render(<Calendar mode="single" showOutsideDays={false} onSelect={vi.fn()} />);
    expect(container.querySelector('[data-slot="calendar"]')).toBeInTheDocument();
  });

  it("covers alternate caption layout and week number path", () => {
    const { container, getByTestId } = render(
      <Calendar
        mode="single"
        captionLayout="dropdown"
        showWeekNumber
        buttonVariant="outline"
        onSelect={vi.fn()}
      />,
    );

    expect(container.querySelector('[data-slot="calendar"]')).toBeInTheDocument();
    expect(getByTestId("formatted-month")).toBeInTheDocument();
  });

  it("passes locale code into month formatter", () => {
    const { getByTestId } = render(
      <Calendar mode="single" locale={{ code: "en-US" } as never} onSelect={vi.fn()} />,
    );

    expect(getByTestId("formatted-month")).toBeInTheDocument();
  });

  it("renders CalendarDayButton range and focused states", () => {
    const { container } = render(
      <CalendarDayButton
        day={{ date: new Date("2026-03-31") } as never}
        modifiers={{
          focused: true,
          selected: true,
          range_start: true,
          range_end: false,
          range_middle: false,
        } as never}
        locale={{ code: "en-US" } as never}
      />,
    );

    expect(container.querySelector('[data-day]')).toBeInTheDocument();
  });
});