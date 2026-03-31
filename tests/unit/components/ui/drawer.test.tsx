import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  DrawerClose,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

describe("Drawer", () => {
  it("renders trigger", () => {
    render(
      <Drawer>
        <DrawerTrigger>Open drawer</DrawerTrigger>
      </Drawer>,
    );

    expect(screen.getByText("Open drawer")).toBeInTheDocument();
  });

  it("renders drawer content when open", () => {
    render(
      <Drawer open>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer title</DrawerTitle>
            <DrawerDescription>Drawer description</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose>Dismiss</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>,
    );

    expect(screen.getByText("Drawer title")).toBeInTheDocument();
    expect(screen.getByText("Drawer description")).toBeInTheDocument();
    expect(screen.getByText("Dismiss")).toBeInTheDocument();
  });
});