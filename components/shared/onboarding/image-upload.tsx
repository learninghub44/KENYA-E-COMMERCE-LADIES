"use client"

import { useState, useRef } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { Button } from "../../ui/button"
import { createSupabaseBrowserClient } from "../../../lib/supabase/client"

interface ImageUploadProps {
  currentImage?: string | null
  onUpload: (url: string) => void
  folder?: string
  accept?: string
  maxSizeMB?: number
  className?: string
  label?: string
  aspect?: "square" | "banner"
}

export function ImageUpload({
  currentImage,
  onUpload,
  folder = "uploads",
  accept = "image/*",
  maxSizeMB = 5,
  className,
  label = "Upload image",
  aspect = "square",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB`)
      return
    }

    setError(null)
    setUploading(true)

    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    try {
      const supabase = createSupabaseBrowserClient()
      const ext = file.name.split(".").pop() ?? "jpg"
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(path, file, { contentType: file.type, upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from("public").getPublicUrl(path)
      onUpload(urlData.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setPreview(currentImage ?? null)
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    setPreview(null)
    onUpload("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        className="hidden"
        aria-label={label}
      />

      {preview ? (
        <div className="relative group">
          <div
            className={`overflow-hidden rounded-lg border bg-muted ${
              aspect === "banner" ? "aspect-[3/1]" : "aspect-square"
            }`}
          >
            <img
              src={preview}
              alt={label}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Replace
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 ${
            aspect === "banner" ? "aspect-[3/1]" : "aspect-square"
          }`}
        >
          {uploading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8" />
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs">Max {maxSizeMB}MB</span>
            </>
          )}
        </button>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  )
}
