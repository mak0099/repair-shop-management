"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FieldErrors } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { CategoryComboboxField } from "./category-combobox-field"

import { categorySchema, CategoryFormValues, Category } from "../category.schema"
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

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      parent_id: undefined,
      isActive: true,
    },
  })

  const onFormError = (errors: FieldErrors<CategoryFormValues>) => {
    console.error("Category form validation errors:", errors)
    toast.error("Please fill all required fields correctly.")
  }

  const handleCancel = () => {
    if (onSuccess) {
      onSuccess(initialData as Category)
    } else {
      router.push(CATEGORIES_BASE_HREF)
    }
  }

  function onSubmit(data: CategoryFormValues) {
    if (isEditMode && initialData) {
      updateCategory(
        { id: initialData.id, data },
        {
          onSuccess: (updatedCategory: Category) => {
            toast.success("Category updated successfully")
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            if (onSuccess) {
              onSuccess(updatedCategory)
            } else {
              router.push(CATEGORIES_BASE_HREF)
            }
          },
          onError: (error) => {
            toast.error("Failed to update category: " + error.message)
          },
        }
      )
    } else {
      createCategory(data, {
        onSuccess: (newCategory) => {
          toast.success("Category created successfully")
          queryClient.invalidateQueries({ queryKey: ["categories"] })
          if (onSuccess) {
            onSuccess(newCategory)
          } else {
            router.push(CATEGORIES_BASE_HREF)
          }
        },
        onError: (error) => {
          toast.error("Failed to create category: " + error.message)
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="relative p-4 space-y-4">
        {isViewMode && (
          <div className="absolute top-4 right-4 z-10">
            <Button size="sm" type="button" onClick={(e) => { e.preventDefault(); setMode("edit"); }}>
              Edit
            </Button>
          </div>
        )}
        <div className={isViewMode ? "pt-10" : ""}>
          <TextField control={form.control} name="name" label="Category Name" required readOnly={isViewMode} placeholder="e.g., Smartphones" />
          <TextareaField control={form.control} name="description" label="Description" readOnly={isViewMode} placeholder="A short description of the category." />
          <CategoryComboboxField
            control={form.control}
            name="parent_id"
            label="Parent Category"
            placeholder="Select a parent category (optional)"
            disabled={isViewMode}
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
            <Button variant="outline" type="button" onClick={handleCancel}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Save Category"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  )
}
