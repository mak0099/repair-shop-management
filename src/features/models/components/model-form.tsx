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
import { BrandComboboxField } from "@/features/brands"

import { modelSchema, ModelFormValues, Model } from "../model.schema"
import { useCreateModel, useUpdateModel } from "../model.api"

const MODELS_BASE_HREF = "/dashboard/options/models" // Based on folder structure, might need adjustment

interface ModelFormProps {
  initialData?: Model | null
  onSuccess?: (data: Model) => void
  isViewMode?: boolean
}

export function ModelForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: ModelFormProps) {
  const router = useRouter()
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
    defaultValues: initialData || {
      name: "",
      brand_id: "",
      isActive: true,
    },
  })

  const onFormError = (errors: FieldErrors<ModelFormValues>) => {
    console.error("Model form validation errors:", errors)
    toast.error("Please fill all required fields correctly.")
  }

  const handleCancel = () => {
    if (onSuccess) {
      onSuccess(initialData as Model)
    } else {
      router.push(MODELS_BASE_HREF)
    }
  }

  function onSubmit(data: ModelFormValues) {
    if (isEditMode && initialData) {
      updateModel(
        { id: initialData.id, data },
        {
          onSuccess: (updatedModel: Model) => {
            toast.success("Model updated successfully")
            queryClient.invalidateQueries({ queryKey: ["models"] })
            if (onSuccess) {
              onSuccess(updatedModel)
            } else {
              router.push(MODELS_BASE_HREF)
            }
          },
          onError: (error) => {
            toast.error("Failed to update model: " + error.message)
          },
        }
      )
    } else {
      createModel(data, {
        onSuccess: (newModel) => {
          toast.success("Model created successfully")
          queryClient.invalidateQueries({ queryKey: ["models"] })
          if (onSuccess) {
            onSuccess(newModel)
          } else {
            router.push(MODELS_BASE_HREF)
          }
        },
        onError: (error) => {
          toast.error("Failed to create model: " + error.message)
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
          <TextField
            control={form.control}
            name="name"
            label="Model Name"
            placeholder="e.g., iPhone 15 Pro"
            required
            readOnly={isViewMode}
          />
          <BrandComboboxField
            control={form.control}
            name="brand_id"
            required
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
            <Button variant="outline" type="button" onClick={handleCancel}>Close</Button>
          ) : (
            <>
              <Button variant="outline" type="button" onClick={handleCancel}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Save Model"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  )
}
