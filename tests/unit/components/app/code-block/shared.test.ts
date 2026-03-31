import { describe, expect, it, vi, beforeEach } from "vitest"
import { Fragment } from "react"

vi.mock("shiki/bundle/web", () => ({
  codeToHast: vi.fn(),
}))

vi.mock("hast-util-to-jsx-runtime", () => ({
  toJsxRuntime: vi.fn(),
}))

import { codeToHast } from "shiki/bundle/web"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { highlight } from "@/components/app/code-block/shared"

describe("highlight", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("builds HAST with requested language and min-dark theme", async () => {
    vi.mocked(codeToHast).mockResolvedValueOnce({ type: "root" } as never)
    vi.mocked(toJsxRuntime).mockReturnValueOnce({ type: "pre" } as never)

    await highlight("const x = 1", "ts")

    expect(codeToHast).toHaveBeenCalledWith("const x = 1", {
      lang: "ts",
      theme: "min-dark",
    })
  })

  it("converts the produced HAST tree into a JSX element", async () => {
    const hastTree = { type: "root", children: [] }
    const element = { type: "pre", props: { children: "ok" } }

    vi.mocked(codeToHast).mockResolvedValueOnce(hastTree as never)
    vi.mocked(toJsxRuntime).mockReturnValueOnce(element as never)

    const result = await highlight("return true", "javascript")

    expect(toJsxRuntime).toHaveBeenCalledWith(
      hastTree,
      expect.objectContaining({
        Fragment,
        jsx: expect.any(Function),
        jsxs: expect.any(Function),
      }),
    )
    expect(result).toBe(element)
  })
})
