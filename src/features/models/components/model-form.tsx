"use client"

import { useState } from "react"
import { useForm, FieldErrors } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"

import { TextField } from "@/components/forms/text-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { BrandSelectField } from "@/features/brands"

import { modelSchema, ModelFormValues, Model } from "../model.schema"
import { useCreateModel, useUpdateModel } from "../model.api"

interface ModelFormProps {
  initialData?: Model | null
  /**
   * onSuccess is now primary for both success and closing the modal.
   */
  onSuccess?: (data?: Model) => void
  isViewMode?: boolean
  brandId?: string
}

export function ModelForm({
  initialData,
  onSuccess,
  isViewMode: initialIsViewMode = false,
  brandId,
}: ModelFormProps) {
  const queryClient = useQueryClient()
  const { mutate: createModel, isPending: isCreating } = useCreateModel()
  const { mutate: updateModel, isPending: isUpdating } = useUpdateModel()

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )
  
  const isViewMode = mode === "view"
  const isPending = isCreating || isUpdating
  const isEditMode = !!initialData && mode !== "create"

  const form = useForm<ModelFormValues>({
    resolver: zodResolver(modelSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      brand_id: initialData.brand_id,
      isActive: initialData.isActive,
    } : {
      name: "",
      brand_id: brandId || "",
      isActive: true,
    },
  })

  const onFormError = (errors: FieldErrors<ModelFormValues>) => {
    console.error("Model form validation errors:", errors)
    toast.error("Please correct the highlighted fields.")
  }

  const handleClose = () => {
    if (onSuccess) {
      // Just closing without passing data if cancelled
      onSuccess(initialData || undefined)
    }
  }

  const onSubmit = (data: ModelFormValues) => {
    const handleMutationSuccess = (model: Model) => {
      toast.success(`Model ${isEditMode ? "updated" : "created"} successfully`)
      queryClient.invalidateQueries({ queryKey: ["models"] })
      if (onSuccess) onSuccess(model)
    }

    const handleMutationError = (error: Error) => {
      toast.error(`Error: ${error.message}`)
    }

    if (isEditMode && initialData) {
      updateModel(
        { id: initialData.id, data },
        { onSuccess: handleMutationSuccess, onError: handleMutationError }
      )
    } else {
      createModel(data, {
        onSuccess: handleMutationSuccess,
        onError: handleMutationError
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-5 p-1">
        <div className="grid grid-cols-1 gap-4">
          <TextField
            control={form.control}
            name="name"
            label="Model Name"
            placeholder="e.g., Galaxy S24 Ultra"
            required
            readOnly={isViewMode}
          />

          <BrandSelectField
            control={form.control}
            name="brand_id"
            label="Brand"
            required
            readOnly={isViewMode || !!brandId}
          />

          <div className="pt-2">
            <CheckboxField
              control={form.control}
              name="isActive"
              label="Active for Inventory"
              description="If disabled, this model won't appear in new entries."
              className="rounded-xl border border-slate-100 p-4 bg-slate-50/50"
              disabled={isViewMode}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          {isViewMode ? (
            <Button 
              variant="outline" 
              type="button" 
              onClick={(e) => { e.preventDefault(); setMode("edit"); }}
              className="px-8 border-slate-200"
            >
              Edit Details
            </Button>
          ) : (
            <>
              <Button 
                variant="ghost" 
                type="button" 
                onClick={handleClose} 
                className="text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending} 
                className="min-w-[140px] bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isEditMode ? "Save Changes" : "Create Model"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  )
}