import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@base-ui/react", () => {
  const make = (Tag: "div" | "button" | "input" | "span" = "div") =>
    React.forwardRef<HTMLElement, Record<string, unknown> & { children?: React.ReactNode }>(
      ({ children, alignOffset, sideOffset, asChild, ...props }, ref) =>
        React.createElement(Tag, { ...props, ref }, children as React.ReactNode),
    );

  const Root = make();
  const Portal = make();
  const Positioner = make();
  const Popup = make();
  const List = make();
  const Item = make();
  const Group = make();
  const GroupLabel = make();
  const Collection = React.forwardRef<
    HTMLElement,
    Record<string, unknown> & { children?: React.ReactNode | ((item: unknown, index: number) => React.ReactNode) }
  >(({ children, ...props }, ref) => {
    const content = typeof children === "function" ? children({}, 0) : children;
    return React.createElement("div", { ...props, ref }, content as React.ReactNode);
  });
  const Empty = make();
  const Separator = make();
  const Chips = make();
  const Chip = make();
  const Trigger = make("button");
  const Value = make("span");
  const Clear = make("button");
  const ChipRemove = make("button");
  const Input = React.forwardRef<HTMLElement, Record<string, unknown>>(
    ({ render, ...props }, ref) => {
      if (React.isValidElement(render)) {
        return React.cloneElement(render as React.ReactElement<Record<string, unknown>>, {
          ...props,
          ref,
        });
      }
      return React.createElement("input", { ...props, ref });
    },
  );
  const ItemIndicator = make("span");

  return {
    Combobox: {
      Root,
      Value,
      Trigger,
      Clear,
      Input,
      Portal,
      Positioner,
      Popup,
      List,
      Item,
      ItemIndicator,
      Group,
      GroupLabel,
      Collection,
      Empty,
      Separator,
      Chips,
      Chip,
      ChipRemove,
    },
  };
});

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

describe("Combobox", () => {
  it("renders combobox input", () => {
    render(
      <Combobox>
        <ComboboxInput aria-label="Search options" />
      </Combobox>,
    );

    expect(screen.getByLabelText("Search options")).toBeInTheDocument();
  });

  it("renders popup list when open", () => {
    render(
      <Combobox open>
        <ComboboxInput aria-label="Choose" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="a">Option A</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );

    expect(screen.getByText("Option A")).toBeInTheDocument();
  });

  it("renders combobox wrappers, chips, and helper hook", () => {
    const anchorRef = React.createRef<HTMLDivElement>();

    function AnchorProbe() {
      const anchorRef = useComboboxAnchor();
      return <div ref={anchorRef} data-testid="anchor-probe" />;
    }

    const { container } = render(
      <Combobox>
        <AnchorProbe />
        <div ref={anchorRef} data-testid="chips-anchor" />
        <ComboboxValue>Selected</ComboboxValue>
        <ComboboxInput aria-label="Full combobox" showTrigger showClear />
        <ComboboxContent anchor={anchorRef}>
          <ComboboxCollection>
            {() => (
              <ComboboxGroup>
                <ComboboxLabel>Group</ComboboxLabel>
                <ComboboxList>
                  <ComboboxItem value="a">A</ComboboxItem>
                </ComboboxList>
              </ComboboxGroup>
            )}
          </ComboboxCollection>
          <ComboboxSeparator />
          <ComboboxEmpty>No results</ComboboxEmpty>
        </ComboboxContent>
        <ComboboxChips>
          <ComboboxChip>Chip 1</ComboboxChip>
          <ComboboxChip showRemove={false}>Chip 2</ComboboxChip>
          <ComboboxChipsInput aria-label="chips input" />
        </ComboboxChips>
      </Combobox>,
    );

    expect(screen.getByTestId("anchor-probe")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="combobox-value"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="combobox-content"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="combobox-list"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="combobox-item"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="combobox-group"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="combobox-label"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="combobox-collection"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="combobox-empty"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="combobox-separator"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="combobox-chips"]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="combobox-chip"]')).toHaveLength(2);
    expect(container.querySelector('[data-slot="combobox-chip-input"]')).toBeInTheDocument();
  });
});
