"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FieldErrors } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { TextField } from "@/components/forms/text-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ImageUploadField } from "@/components/forms/image-upload-field"

import { brandSchema, BrandFormValues } from "../brand.schema"
import { Brand } from "../brand.schema"
import { useCreateBrand, useUpdateBrand } from "../brand.api"
import { BRANDS_BASE_HREF } from "@/config/paths"

interface BrandFormProps {
  initialData?: Brand | null
  onSuccess?: (data: Brand) => void
  isViewMode?: boolean
}

export function BrandForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: BrandFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { mutate: createBrand, isPending: isCreating } = useCreateBrand()
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand()

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isViewMode = mode === "view"

  const isPending = isCreating || isUpdating
  const isEditMode = !!initialData && mode !== "create"

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: initialData
      ? { ...initialData, logo: undefined } // Set logo to undefined to avoid validation issues with URL string
      : {
          name: "",
          logo: undefined,
          isActive: true,
        },
  })

  const onFormError = (errors: FieldErrors<BrandFormValues>) => {
    console.error("Brand form validation errors:", errors)
    toast.error("Please fill all required fields correctly.")
  }

  const handleCancel = () => {
    if (onSuccess) {
      onSuccess(initialData as Brand)
    } else {
      router.push(BRANDS_BASE_HREF)
    }
  }

  function onSubmit(data: BrandFormValues) {
    if (isEditMode && initialData) {
      updateBrand(
        { id: initialData.id, data },
        {
          onSuccess: (updatedBrand: Brand) => {
            toast.success("Brand updated successfully")
            queryClient.invalidateQueries({ queryKey: ["brands"] })
            if (onSuccess) {
              onSuccess(updatedBrand)
            } else {
              router.push(BRANDS_BASE_HREF)
            }
          },
          onError: (error) => {
            toast.error("Failed to update brand: " + error.message)
          },
        }
      )
    } else {
      createBrand(data, {
        onSuccess: (newBrand) => {
          toast.success("Brand created successfully")
          queryClient.invalidateQueries({ queryKey: ["brands"] })
          if (onSuccess) {
            onSuccess(newBrand)
          } else {
            router.push(BRANDS_BASE_HREF)
          }
        },
        onError: (error) => {
          toast.error("Failed to create brand: " + error.message)
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="relative p-4 space-y-4">
        {isViewMode && (
          <div className="absolute top-4 right-4 z-10">
            <Button size="sm" type="button" onClick={(e) => {
              e.preventDefault()
              setMode("edit")
            }}>
              Edit
            </Button>
          </div>
        )}
        <div className={isViewMode ? "pt-10" : ""}>
          <TextField
            control={form.control}
            name="name"
            label="Brand Name"
            placeholder="e.g., Apple"
            required
            readOnly={isViewMode}
          />
          <ImageUploadField
            control={form.control}
            name="logo"
            label="Logo"
            initialImage={initialData?.logo}
          />
          <CheckboxField
            control={form.control}
            name="isActive"
            label="Is Active?"
            className="rounded-md border p-3"
            disabled={isViewMode}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          {isViewMode ? (
            <Button variant="outline" type="button" onClick={handleCancel}>Close</Button>
          ) : (
            <>
              <Button variant="outline" type="button" onClick={handleCancel}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Save Brand"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  )
}