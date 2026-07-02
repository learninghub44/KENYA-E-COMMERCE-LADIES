"use client"

import type { ReactNode } from "react"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button, type ButtonProps } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
  required?: boolean
  hint?: string
}

function FormField({ label, htmlFor, error, children, required, hint }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className={cn(required && "after:ml-0.5 after:text-destructive after:content-['*']")}>
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive" role="alert">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-4 rounded-lg border p-6", className)}>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

interface SubmitButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
}

function SubmitButton({ loading, loadingText, children, disabled, ...props }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  )
}

interface FormStatusProps {
  success?: string | null
  error?: string | null
}

function FormStatus({ success, error }: FormStatusProps) {
  if (!success && !error) return null
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-4 py-3 text-sm",
        success && "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200",
        error && "bg-destructive/10 text-destructive"
      )}
      role="alert"
      aria-live="polite"
    >
      {success && <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {error && <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {success || error}
    </div>
  )
}

interface DirtyIndicatorProps {
  isDirty: boolean
  lastSaved?: Date | null
}

function DirtyIndicator({ isDirty, lastSaved }: DirtyIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
      {isDirty && (
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
          Unsaved changes
        </span>
      )}
      {!isDirty && lastSaved && (
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-green-500" aria-hidden="true" />
          Saved {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}

export { FormField, FormSection, SubmitButton, FormStatus, DirtyIndicator }
