"use client"

import { useEffect, useRef, useCallback } from "react"
import { createSupabaseBrowserClient } from "../../../lib/supabase/client"

interface UseAutosaveOptions {
  userId: string | undefined
  table: "profiles" | "sellers"
  recordId: string | undefined
  data: Record<string, unknown>
  enabled?: boolean
  debounceMs?: number
  onSave?: () => void
  onError?: (error: Error) => void
}

export function useAutosave({
  userId,
  table,
  recordId,
  data,
  enabled = true,
  debounceMs = 1500,
  onSave,
  onError,
}: UseAutosaveOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>("")
  const supabaseRef = useRef<ReturnType<typeof createSupabaseBrowserClient> | null>(null)

  useEffect(() => {
    supabaseRef.current = createSupabaseBrowserClient()
  }, [])

  const save = useCallback(async () => {
    if (!userId || !recordId || !supabaseRef.current) return

    const payload = JSON.stringify(data)
    if (payload === lastSavedRef.current) return

    try {
      const currentMeta =
        table === "profiles"
          ? await supabaseRef.current
              .from(table)
              .select("metadata")
              .eq("id", recordId)
              .single()
          : await supabaseRef.current
              .from(table)
              .select("metadata")
              .eq("id", recordId)
              .single()

      const existingMeta = (currentMeta.data?.metadata as Record<string, unknown>) ?? {}
      const updatedMeta = {
        ...existingMeta,
        onboarding: {
          ...(existingMeta.onboarding as Record<string, unknown>),
          ...data,
          lastSavedAt: new Date().toISOString(),
        },
      }

      const { error } = await supabaseRef.current
        .from(table)
        .update({ metadata: updatedMeta, updated_at: new Date().toISOString() })
        .eq("id", recordId)

      if (error) throw error

      lastSavedRef.current = payload
      onSave?.()
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error("Save failed"))
    }
  }, [userId, table, recordId, data, onSave, onError])

  useEffect(() => {
    if (!enabled || !userId || !recordId) return

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(save, debounceMs)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [data, enabled, userId, recordId, debounceMs, save])

  const saveImmediate = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    return save()
  }, [save])

  return { saveImmediate }
}
