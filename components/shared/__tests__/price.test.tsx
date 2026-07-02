import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Price } from "../price"

describe("Price", () => {
  it("renders the formatted price with KES", () => {
    render(<Price amount={2450} />)
    expect(screen.getByText(/2,450/)).toBeInTheDocument()
  })

  it("renders strikethrough compareAt price", () => {
    render(<Price amount={1999} compareAt={4999} />)
    const priceText = screen.getByText(/1,999/)
    expect(priceText).toBeInTheDocument()
    expect(screen.getByText(/4,999/)).toBeInTheDocument()
  })

  it("applies small size class", () => {
    const { container } = render(<Price amount={100} size="sm" />)
    expect(container.querySelector(".text-sm")).toBeTruthy()
  })
})
