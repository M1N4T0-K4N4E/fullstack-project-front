import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { Footer } from "@/components/app/footer"

describe("Footer", () => {
  it("renders author attribution text", () => {
    render(<Footer />)

    expect(screen.getByText("Made with ❤️ by boon4681 and mudrock")).toBeInTheDocument()
  })

  it("keeps footer semantic structure", () => {
    render(<Footer />)

    expect(screen.getByRole("contentinfo")).toBeInTheDocument()
  })
})
