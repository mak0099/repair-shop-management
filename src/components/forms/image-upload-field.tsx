"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Control, FieldValues, Path, PathValue, useFormContext } from "react-hook-form"
import { Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface ImageUploadFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label: string
  initialImage?: string | null
}

export function ImageUploadField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  initialImage,
}: ImageUploadFieldProps<TFieldValues>) {
  const { setValue } = useFormContext<TFieldValues>()
  const [preview, setPreview] = useState<string | null>(initialImage || null)

  useEffect(() => {
    setPreview(initialImage || null)
  }, [initialImage])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setValue(name, file as PathValue<TFieldValues, Path<TFieldValues>>, { shouldValidate: true })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setValue(name, null as PathValue<TFieldValues, Path<TFieldValues>>, { shouldValidate: true })
    setPreview(null)
  }

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative w-32 h-32">
              {preview ? (
                <>
                  <Image src={preview} alt="Image preview" fill className="object-contain rounded-md" />
                  <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={removeImage}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <label htmlFor={`${name}-upload`} className="w-full h-full border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-accent">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <input id={`${name}-upload`} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}