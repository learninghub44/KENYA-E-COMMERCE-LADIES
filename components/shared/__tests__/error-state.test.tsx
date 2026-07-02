import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ErrorState } from "../error-state"

describe("ErrorState", () => {
  it("renders title and description", () => {
    render(
      <ErrorState
        title="Something went wrong"
        description="Please try again"
      />
    )
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(screen.getByText("Please try again")).toBeInTheDocument()
  })

  it("renders retry button when onRetry provided", () => {
    const onRetry = vi.fn()
    render(
      <ErrorState
        title="Error"
        description="Retry?"
        onRetry={onRetry}
      />
    )
    const button = screen.getByRole("button", { name: /try again/i })
    fireEvent.click(button)
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("has role alert for accessibility", () => {
    render(
      <ErrorState
        title="Error"
        description="An error occurred"
      />
    )
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})
