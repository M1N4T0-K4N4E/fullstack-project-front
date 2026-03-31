import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const apiMock = {
  canScrollPrev: vi.fn(() => true),
  canScrollNext: vi.fn(() => true),
  scrollPrev: vi.fn(),
  scrollNext: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

let currentApi: typeof apiMock | null = apiMock;

vi.mock("embla-carousel-react", () => ({
  default: vi.fn(() => [vi.fn(), currentApi]),
}));

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";

describe("Carousel", () => {
  it("renders carousel region and slides", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    expect(screen.getByRole("region")).toBeInTheDocument();
    expect(screen.getByText("Slide 1")).toBeInTheDocument();
  });

  it("renders navigation buttons", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Only slide</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );

    expect(screen.getByRole("button", { name: "Previous slide" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next slide" })).toBeInTheDocument();
  });

  it("handles keyboard navigation and setApi callback", () => {
    const setApi = vi.fn();

    render(
      <Carousel setApi={setApi}>
        <CarouselContent>
          <CarouselItem>Slide A</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );

    const region = screen.getByRole("region");
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    fireEvent.keyDown(region, { key: "ArrowRight" });

    expect(apiMock.scrollPrev).toHaveBeenCalled();
    expect(apiMock.scrollNext).toHaveBeenCalled();
    expect(setApi).toHaveBeenCalledWith(apiMock);
  });

  it("renders vertical orientation classes", () => {
    const { container } = render(
      <Carousel orientation="vertical">
        <CarouselContent>
          <CarouselItem>Vertical slide</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );

    expect(container.querySelector('[data-slot="carousel-content"] > div')).toHaveClass("flex-col");
    expect(container.querySelector('[data-slot="carousel-item"]')).toHaveClass("pt-4");
  });

  it("throws when useCarousel is used outside provider", () => {
    function Probe() {
      useCarousel();
      return <div />;
    }

    expect(() => render(<Probe />)).toThrow("useCarousel must be used within a <Carousel />");
  });

  it("handles null api safely", () => {
    currentApi = null;
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Null api slide</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    expect(container.querySelector('[data-slot="carousel"]')).toBeInTheDocument();
    currentApi = apiMock;
  });

  it("falls back orientation from opts axis when orientation is falsy", () => {
    const { container } = render(
      <Carousel orientation={null as never} opts={{ axis: "y" } as never}>
        <CarouselContent>
          <CarouselItem>Axis driven slide</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    expect(container.querySelector('[data-slot="carousel-item"]')).toHaveClass("pt-4");
  });

  it("falls back to horizontal when opts axis is not y", () => {
    const { container } = render(
      <Carousel orientation={null as never} opts={{ axis: "x" } as never}>
        <CarouselContent>
          <CarouselItem>Axis x slide</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    expect(container.querySelector('[data-slot="carousel-item"]')).toHaveClass("pl-4");
  });

  it("guards onSelect when callback receives undefined api", () => {
    apiMock.on.mockImplementation((_event: string, cb: (api: unknown) => void) => {
      cb(undefined);
      return apiMock;
    });

    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Callback guard</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    expect(screen.getByText("Callback guard")).toBeInTheDocument();
    apiMock.on.mockReset();
  });
});
