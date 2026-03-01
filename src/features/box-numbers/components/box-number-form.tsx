"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FieldErrors, Resolver } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Edit3, Package } from "lucide-react"

import { TextField } from "@/components/forms/text-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FormFooter } from "@/components/forms/form-footer"

import { boxNumberSchema, type BoxNumber } from "../box-number.schema"
import { useCreateBoxNumber, useUpdateBoxNumber } from "../box-number.api"
import { BOX_NUMBERS_BASE_HREF } from "@/config/paths"

interface BoxNumberFormProps {
  initialData?: BoxNumber | null
  onSuccess?: (data: BoxNumber) => void
  isViewMode?: boolean
}

/**
 * Updated BoxNumberForm to match the new boolean 'isActive' schema.
 * Implements the Circuit-Breaker type casting to avoid TypeScript inference loops.
 */
export function BoxNumberForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: BoxNumberFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { mutate: createBoxNumber, isPending: isCreating } = useCreateBoxNumber()
  const { mutate: updateBoxNumber, isPending: isUpdating } = useUpdateBoxNumber()

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )

  const isViewMode = mode === "view"
  const isPending = isCreating || isUpdating
  const isEditMode = !!initialData && mode !== "create"

  /**
   * Form initialization.
   * We cast the resolver to bypass the 'unknown' type inference bug.
   */
  const form = useForm<BoxNumber>({
    resolver: zodResolver(boxNumberSchema) as unknown as Resolver<BoxNumber>,
    defaultValues: initialData
      ? {
        ...initialData,
        description: initialData.description || "",
      }
      : {
        name: "",
        location: "",
        description: "",
        isActive: true, // Matching the boolean default from your new schema
      },
  })

  const onFormError = (errors: FieldErrors<BoxNumber>) => {
    console.error("Form Validation Errors:", errors)
    toast.error("Please fill the required fields correctly.")
  }

  function onSubmit(data: BoxNumber) {
    if (isEditMode && initialData?.id) {
      updateBoxNumber(
        { id: initialData.id, data },
        {
          onSuccess: (updatedData) => {
            toast.success("Box details updated successfully.")
            queryClient.invalidateQueries({ queryKey: ["box-numbers"] })
            onSuccess ? onSuccess(updatedData) : router.push(BOX_NUMBERS_BASE_HREF)
          },
          onError: (error) => toast.error(error.message),
        }
      )
    } else {
      createBoxNumber(data, {
        onSuccess: (newData) => {
          toast.success("New Box created successfully.")
          queryClient.invalidateQueries({ queryKey: ["box-numbers"] })
          onSuccess ? onSuccess(newData) : router.push(BOX_NUMBERS_BASE_HREF)
        },
        onError: (error) => toast.error(error.message),
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-6 p-1">

        {/* Mode Indicator Header */}
        <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
          <div className="flex items-center gap-3 text-blue-700 font-semibold text-sm">
            <Package className="h-5 w-5" />
            <span className="uppercase tracking-wider">
              {isViewMode ? "View Details" : isEditMode ? "Edit Box" : "Create New Box"}
            </span>
          </div>
          {isViewMode && (
            <Button size="sm" variant="outline" onClick={() => setMode("edit")} className="bg-white hover:bg-blue-50">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Configuration
            </Button>
          )}
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            control={form.control}
            name="name"
            label="Box Name / Number"
            placeholder="e.g. Box-A1"
            required
            readOnly={isViewMode}
            inputClassName="focus:ring-blue-500"
          />

          <TextField
            control={form.control}
            name="location"
            label="Storage Location"
            placeholder="e.g. Shelf 4, Row B"
            required
            readOnly={isViewMode}
            inputClassName="focus:ring-blue-500"
          />
        </div>

        <TextField
          control={form.control}
          name="description"
          label="Additional Description"
          placeholder="Brief notes about this box..."
          readOnly={isViewMode}
          inputClassName="focus:ring-blue-500"
        />

        {/* Status Toggle */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 w-full md:w-fit min-w-[200px]">
          <CheckboxField
            control={form.control}
            name="isActive"
            label="Mark as Active"
            disabled={isViewMode}
          />
          <p className="text-[10px] text-muted-foreground mt-1 ml-6">
            Inactive boxes may be hidden from selection lists.
          </p>
        </div>

        <FormFooter
          isViewMode={isViewMode}
          isEditMode={isEditMode}
          isPending={isPending}
          onCancel={() => onSuccess?.(initialData!)}
          onEdit={() => setMode("edit")}
          onReset={() => form.reset()}
          saveLabel={isEditMode ? "Update Changes" : "Save Box Number"}
          className="pt-6 border-t mt-6"
        />
      </form>
    </Form>
  )
}