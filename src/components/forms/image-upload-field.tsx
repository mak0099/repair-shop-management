"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Control, FieldValues, Path, useController } from "react-hook-form"
import { Upload, X, Image as ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { FieldLabel } from "./field-label"

interface ImageUploadFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label: string
  initialImage?: string | null
  className?: string
  isViewMode?: boolean
  layout?: "default" | "compact"
}

export function ImageUploadField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  initialImage,
  className,
  isViewMode = false,
  layout = "default",
}: ImageUploadFieldProps<TFieldValues>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(initialImage || null)
  const [isInitialImageError, setInitialImageError] = useState(false)
  const [prevInitialImage, setPrevInitialImage] = useState(initialImage)

  if (initialImage !== prevInitialImage) {
    setPrevInitialImage(initialImage)
    setPreview(initialImage || null)
    setInitialImageError(false)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onChange(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        setInitialImageError(false) // Clear any previous error
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    onChange(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Reset file input
    }
  }

  const hasImage = !!preview
  const showFallback = !hasImage || (isInitialImageError && preview === initialImage)

  if (layout === "compact") {
    return (
      <FormItem className={className}>
        <FieldLabel label={label} className="text-[10px]" />
        <div
          className={cn(
            "relative h-20 w-full border rounded bg-slate-50 overflow-hidden group flex items-center justify-center",
            { "border-destructive": !!error }
          )}
        >
          {showFallback ? (
            !isViewMode ? (
              <label className="flex items-center justify-center h-full w-full cursor-pointer hover:bg-slate-100 transition-colors">
                <Upload className="h-5 w-5 text-slate-300" />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif, image/webp"
                />
              </label>
            ) : (
              <ImageIcon className="h-8 w-8 text-slate-300" />
            )
          ) : (
            <>
              <Image
                src={preview!}
                alt="Image preview"
                fill
                className="object-cover"
                onError={() => {
                  if (preview === initialImage) {
                    setInitialImageError(true)
                  }
                }}
              />
              {!isViewMode && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </>
          )}
        </div>
        <FormMessage />
      </FormItem>
    )
  }

  return (
    <FormItem className={className}>
      <FieldLabel label={label} />
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "relative flex h-24 w-24 items-center justify-center rounded-md border border-dashed bg-muted/40 text-muted-foreground",
            { "border-destructive": !!error }
          )}
        >
          {showFallback ? (
            <ImageIcon className="h-10 w-10" />
          ) : (
            <Image
              src={preview!}
              alt="Image preview"
              fill
              className="rounded-md object-contain"
              onError={() => {
                if (preview === initialImage) {
                  setInitialImageError(true)
                }
              }}
            />
          )}
        </div>
        {!isViewMode && (
          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              {hasImage ? "Change Image" : "Upload Image"}
            </Button>
            {hasImage && (
              <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleRemoveImage}>
                <X className="mr-2 h-4 w-4" />
                Remove Image
              </Button>
            )}
            <FormControl>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif, image/webp"
              />
            </FormControl>
          </div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  )
}