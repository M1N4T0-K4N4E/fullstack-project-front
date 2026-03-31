import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("px-2", "px-4", "text-sm")).toBe("px-4 text-sm");
  });

  it("handles conditional and empty values", () => {
    expect(cn("base", false && "hidden", undefined, "active")).toBe("base active");
  });
});
