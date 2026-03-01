"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FieldErrors, Resolver } from "react-hook-form" // Added Resolver import
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, Save, X, Edit3, Trash2 } from "lucide-react"

import { TextField } from "@/components/forms/text-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ImageUploadField } from "@/components/forms/image-upload-field"

import { brandSchema, type BrandFormValues, type Brand } from "../brand.schema"
import { useCreateBrand, useUpdateBrand } from "../brand.api"
import { BRANDS_BASE_HREF } from "@/config/paths"
import { FormFooter } from "@/components/forms/form-footer"

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

  /**
   * FIX: Applied the "Circuit Breaker" to break the inference loop.
   * This resolves the 'boolean | undefined' mismatch.
   */
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema) as unknown as Resolver<BrandFormValues>,
    defaultValues: initialData
      ? {
        ...initialData,
        logo: undefined,
        isActive: initialData.isActive ?? true // Ensuring it's never undefined
      }
      : {
        name: "",
        logo: undefined,
        isActive: true, // Boolean Consistency
      },
  })

  const { handleSubmit, control, reset } = form

  const onFormError = (errors: FieldErrors<BrandFormValues>) => {
    console.error("Brand form validation errors:", errors)
    toast.error("Please fill all required fields correctly.")
  }

  const handleCancel = () => {
    if (onSuccess && initialData) {
      onSuccess(initialData)
    } else {
      router.push(BRANDS_BASE_HREF)
    }
  }

  function onSubmit(data: BrandFormValues) {
    if (isEditMode && initialData?.id) {
      updateBrand(
        { id: initialData.id, data },
        {
          onSuccess: (updatedBrand: Brand) => {
            toast.success("Brand updated successfully")
            queryClient.invalidateQueries({ queryKey: ["brands"] })
            onSuccess ? onSuccess(updatedBrand) : router.push(BRANDS_BASE_HREF)
          },
          onError: (error) => toast.error("Update failed: " + error.message),
        }
      )
    } else {
      createBrand(data, {
        onSuccess: (newBrand) => {
          toast.success("Brand created successfully")
          queryClient.invalidateQueries({ queryKey: ["brands"] })
          onSuccess ? onSuccess(newBrand) : router.push(BRANDS_BASE_HREF)
        },
        onError: (error) => toast.error("Creation failed: " + error.message),
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-6 p-1">

        {/* View Mode Header */}
        {isViewMode && (
          <div className="flex justify-end mb-4">
            <Button size="sm" variant="outline" type="button" onClick={() => setMode("edit")}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Brand
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <TextField
              control={control}
              name="name"
              label="Brand Name"
              placeholder="e.g., Apple, Samsung"
              required
              readOnly={isViewMode}
            />
            <ImageUploadField
              control={control}
              name="logo"
              label="Brand Logo"
              initialImage={initialData?.logo}
              isViewMode={isViewMode}
            />
            <div className="pt-2">
              <CheckboxField
                control={control}
                name="isActive"
                label="Mark as Active"
                description="Inactive brands won't show in product selection."
                disabled={isViewMode}
                className="border rounded-lg p-4 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        <FormFooter
          isViewMode={isViewMode}
          isEditMode={isEditMode}
          isPending={isPending}
          onCancel={() => onSuccess?.(initialData!)}
          onEdit={() => setMode("edit")}
          onReset={() => form.reset()}
          saveLabel={isEditMode ? "Update Changes" : "Save Brand"}
          className="pt-6 border-t mt-6"
        />
      </form>
    </Form>
  )
}