import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

describe("Tabs", () => {
  it("renders tabs trigger and active content", () => {
    render(
      <Tabs defaultValue="tab-1">
        <TabsList>
          <TabsTrigger value="tab-1">Tab One</TabsTrigger>
          <TabsTrigger value="tab-2">Tab Two</TabsTrigger>
        </TabsList>
        <TabsContent value="tab-1">Content One</TabsContent>
        <TabsContent value="tab-2">Content Two</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole("tab", { name: "Tab One" })).toBeInTheDocument();
    expect(screen.getByText("Content One")).toBeInTheDocument();
  });

  it("applies list variant attribute", () => {
    const { container } = render(
      <Tabs defaultValue="tab-1">
        <TabsList variant="line">
          <TabsTrigger value="tab-1">Tab</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(container.querySelector('[data-slot="tabs-list"]')).toHaveAttribute("data-variant", "line");
  });
});
