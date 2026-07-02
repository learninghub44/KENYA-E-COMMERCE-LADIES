import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Rating } from "../rating"

describe("Rating", () => {
  it("renders the correct aria-label", () => {
    render(<Rating value={4} max={5} />)
    const el = screen.getByRole("img")
    expect(el).toHaveAttribute("aria-label", "4 out of 5 stars")
  })

  it("renders correct number of filled stars", () => {
    const { container } = render(<Rating value={3} max={5} />)
    const stars = container.querySelectorAll("svg")
    expect(stars).toHaveLength(5)
  })

  it("renders the numeric value when showValue is true", () => {
    render(<Rating value={4.5} showValue />)
    expect(screen.getByText("4.5")).toBeInTheDocument()
  })

  it("renders with correct size class", () => {
    render(<Rating value={3} size="lg" />)
    const stars = screen.getByRole("img")
    expect(stars.className).toContain("inline-flex")
  })
})
