import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import React from "react"

vi.mock("unified", () => {
  return {
    unified: () => {
      let renderers: Record<string, unknown> | undefined

      const api = {
        use: (_plugin: unknown, options?: { components?: Record<string, unknown> }) => {
          if (options?.components) {
            renderers = options.components
          }
          return api
        },
        processSync: () => {
          for (const renderer of Object.values(renderers ?? {})) {
            if (typeof renderer === "function") {
              ;(renderer as (props?: Record<string, unknown>) => unknown)({
                children: "content",
                href: "https://example.com",
                src: "https://example.com/a.png",
                alt: "Alt",
              })
            }
          }

          return {
            result: <div data-testid="mock-node">mocked markdown node</div>,
          }
        },
      }

      return api
    },
  }
})

import { MarkdownBlock } from "@/components/app/markdown-block/markdown-block"

describe("MarkdownBlock renderer map", () => {
  it("invokes all internal renderer functions through rehype-react options", () => {
    render(<MarkdownBlock content="ignored content" />)

    expect(screen.getByTestId("mock-node")).toBeInTheDocument()
  })
})
