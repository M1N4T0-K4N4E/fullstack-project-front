import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { MarkdownBlock } from "@/components/app/markdown-block/markdown-block"

describe("MarkdownBlock", () => {
  it("renders markdown content with styled elements", () => {
    const content = [
      "# Heading One",
      "## Heading Two",
      "Paragraph with [link](https://example.com), **bold**, *italic* and `inline` code.",
      "",
      "> Quoted line",
      "",
      "- Bullet item",
      "1. Ordered item",
      "",
      "```ts",
      "const ok = true",
      "```",
      "",
      "![Alt image](https://example.com/a.png)",
      "",
      "---",
    ].join("\n")

    render(<MarkdownBlock content={content} />)

    expect(screen.getByRole("heading", { level: 1, name: "Heading One" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: "Heading Two" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "link" })).toHaveAttribute("href", "https://example.com")
    expect(screen.getByText("bold").tagName).toBe("STRONG")
    expect(screen.getByText("italic").tagName).toBe("EM")
    expect(screen.getByText("inline").tagName).toBe("CODE")
    expect(screen.getByText("Quoted line")).toBeInTheDocument()
    expect(screen.getByText("Bullet item").tagName).toBe("LI")
    expect(screen.getByText("Ordered item").tagName).toBe("LI")
    expect(screen.getByText("const ok = true")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Alt image" })).toHaveAttribute("src", "https://example.com/a.png")
  })
})
