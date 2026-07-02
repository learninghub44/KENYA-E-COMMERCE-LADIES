import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { FormField, FormStatus, DirtyIndicator } from "../form"

describe("FormField", () => {
  it("renders label and children", () => {
    render(
      <FormField label="Email" htmlFor="email">
        <input id="email" />
      </FormField>
    )
    expect(screen.getByText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
  })

  it("shows error message with role alert", () => {
    render(
      <FormField label="Email" htmlFor="email" error="Invalid email">
        <input id="email" />
      </FormField>
    )
    expect(screen.getByText("Invalid email")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  it("renders required indicator visually", () => {
    const { container } = render(
      <FormField label="Name" htmlFor="name" required>
        <input id="name" />
      </FormField>
    )
    const label = container.querySelector("label")
    expect(label?.className).toContain("after:content-['*']")
  })
})

describe("FormStatus", () => {
  it("renders success message", () => {
    render(<FormStatus success="Saved successfully" />)
    expect(screen.getByText("Saved successfully")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  it("renders error message", () => {
    render(<FormStatus error="Failed to save" />)
    expect(screen.getByText("Failed to save")).toBeInTheDocument()
  })

  it("returns null when no status", () => {
    const { container } = render(<FormStatus />)
    expect(container.innerHTML).toBe("")
  })
})

describe("DirtyIndicator", () => {
  it("shows unsaved changes when dirty", () => {
    render(<DirtyIndicator isDirty />)
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument()
  })

  it("shows save time when not dirty and lastSaved provided", () => {
    const date = new Date("2026-07-02T12:00:00")
    render(<DirtyIndicator isDirty={false} lastSaved={date} />)
    expect(screen.getByText(/Saved/)).toBeInTheDocument()
  })
})
