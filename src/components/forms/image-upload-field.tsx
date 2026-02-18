"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Control, FieldValues, Path, useController } from "react-hook-form"
import { Upload, X, Image as ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

interface ImageUploadFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label: string
  initialImage?: string | null
  className?: string
  isViewMode?: boolean
}

export function ImageUploadField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  initialImage,
  className,
  isViewMode = false,
}: ImageUploadFieldProps<TFieldValues>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(initialImage || null)
  const [isInitialImageError, setInitialImageError] = useState(false)

  useEffect(() => {
    setPreview(initialImage || null)
    setInitialImageError(false)
  }, [initialImage])

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

  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
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