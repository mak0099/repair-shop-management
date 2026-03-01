"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FieldErrors, Resolver } from "react-hook-form" // Added Resolver
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FormFooter } from "@/components/forms/form-footer"
import { CategorySelectField } from "./category-select-field"

import { categorySchema, type CategoryFormValues, type Category } from "../category.schema"
import { useCreateCategory, useUpdateCategory } from "../category.api"

const CATEGORIES_BASE_HREF = "/dashboard/options/categories"

interface CategoryFormProps {
  initialData?: Category | null
  onSuccess?: (data: Category) => void
  isViewMode?: boolean
}

export function CategoryForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: CategoryFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory()

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isViewMode = mode === "view"
  const isPending = isCreating || isUpdating
  const isEditMode = !!initialData && mode !== "create"

  /**
   * FIX: Applied the Circuit Breaker casting to bypass the Boolean mismatch error.
   */
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as unknown as Resolver<CategoryFormValues>,
    defaultValues: initialData
      ? {
        ...initialData,
        description: initialData.description || "",
        parentId: initialData.parentId || undefined,
        isActive: initialData.isActive ?? true
      }
      : {
        name: "",
        description: "",
        parentId: undefined,
        isActive: true, // Boolean Consistency
      },
  })

  const { control, handleSubmit } = form

  const onFormError = (errors: FieldErrors<CategoryFormValues>) => {
    console.error("Category Validation Errors:", errors)
    toast.error("Please fill the required fields correctly.")
  }

  function onSubmit(data: CategoryFormValues) {
    if (isEditMode && initialData?.id) {
      updateCategory(
        { id: initialData.id, data },
        {
          onSuccess: (updatedCategory: Category) => {
            toast.success("Category updated successfully")
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            onSuccess ? onSuccess(updatedCategory) : router.push(CATEGORIES_BASE_HREF)
          },
          onError: (error) => toast.error("Update failed: " + error.message),
        }
      )
    } else {
      createCategory(data, {
        onSuccess: (newCategory) => {
          toast.success("Category created successfully")
          queryClient.invalidateQueries({ queryKey: ["categories"] })
          onSuccess ? onSuccess(newCategory) : router.push(CATEGORIES_BASE_HREF)
        },
        onError: (error) => toast.error("Creation failed: " + error.message),
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, onFormError)} className="relative p-4 space-y-5">
        {isViewMode && (
          <div className="absolute top-4 right-4 z-10">
            <Button size="sm" variant="outline" type="button" onClick={() => setMode("edit")}>
              Edit Category
            </Button>
          </div>
        )}

        <div className={isViewMode ? "pt-10 space-y-4" : "space-y-4"}>
          <TextField
            control={control}
            name="name"
            label="Category Name"
            required
            readOnly={isViewMode}
            placeholder="e.g., Smartphones"
          />

          <TextareaField
            control={control}
            name="description"
            label="Description"
            readOnly={isViewMode}
            placeholder="A short description of the category."
            className="min-h-[100px]"
          />

          <CategorySelectField
            control={control}
            name="parentId" // Updated from parent_id
            label="Parent Category"
            placeholder="Select a parent category (optional)"
            disabled={isViewMode}
          />

          <div className="pt-2">
            <CheckboxField
              control={control}
              name="isActive"
              label="Mark as Active"
              className="rounded-lg border p-4 bg-slate-50/50"
              disabled={isViewMode}
            />
          </div>
        </div>

        <FormFooter
          isViewMode={isViewMode}
          isEditMode={isEditMode}
          isPending={isPending}
          onCancel={() => onSuccess?.(initialData!)}
          onEdit={() => setMode("edit")}
          onReset={() => form.reset()}
          saveLabel={isEditMode ? "Save Changes" : "Save Category"}
          className="mt-4"
        />
      </form>
    </Form>
  )
}