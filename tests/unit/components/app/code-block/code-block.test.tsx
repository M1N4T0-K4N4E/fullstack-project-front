import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { CodeBlock } from "@/components/app/code-block/code-block"

describe("CodeBlock", () => {
  it("renders the block title", () => {
    render(<CodeBlock name="main.ts" />)

    expect(screen.getByText("main.ts")).toBeInTheDocument()
  })

  it("shows loading fallback when no initial content is provided", () => {
    render(<CodeBlock name="empty.ts" />)

    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("renders resolved async initial content", async () => {
    render(<CodeBlock name="async.ts" initial={Promise.resolve(<code>const ok = true</code>)} />)

    expect(await screen.findByText("const ok = true")).toBeInTheDocument()
  })
})
