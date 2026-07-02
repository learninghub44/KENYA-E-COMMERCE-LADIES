import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ShoppingBag } from "lucide-react"
import { EmptyState } from "../empty-state"

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={ShoppingBag}
        title="Cart is empty"
        description="Add items to get started"
      />
    )
    expect(screen.getByText("Cart is empty")).toBeInTheDocument()
    expect(screen.getByText("Add items to get started")).toBeInTheDocument()
  })

  it("has role status for accessibility", () => {
    render(
      <EmptyState
        icon={ShoppingBag}
        title="Empty"
        description="Nothing here"
      />
    )
    expect(screen.getByRole("status")).toBeInTheDocument()
  })
})
