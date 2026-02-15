"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FieldErrors } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { z } from "zod"

import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { RadioGroupField } from "@/components/forms/radio-group-field"
import { BrandComboboxField } from "@/features/brands"
import { ModelComboboxField } from "@/features/models"

import { itemSchema, ItemFormValues, Item } from "../item.schema"
import { useCreateItem, useUpdateItem } from "../item.api"
import { TYPE_OPTIONS } from "../item.constants"

const ITEMS_BASE_HREF = "/dashboard/inventory"

const itemFormSchema = itemSchema.extend({
  specifications: z
    .string()
    .transform((str, ctx) => {
      try {
        const parsed = JSON.parse(str)
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Specifications must be a JSON object.",
          })
          return z.NEVER
        }
        return parsed
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid JSON format.",
        })
        return z.NEVER
      }
    })
    .optional()
    .default({}),
})

type ItemFormSchemaValues = z.infer<typeof itemFormSchema>

interface ItemFormProps {
  initialData?: Item | null
  onSuccess?: (data: Item) => void
  isViewMode?: boolean
}

export function ItemForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: ItemFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { mutate: createItem, isPending: isCreating } = useCreateItem()
  const { mutate: updateItem, isPending: isUpdating } = useUpdateItem()

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isViewMode = mode === "view"

  const isPending = isCreating || isUpdating
  const isEditMode = !!initialData && mode !== "create"

  const form = useForm<ItemFormSchemaValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          specifications: initialData.specifications ? JSON.stringify(initialData.specifications, null, 2) : "{}",
        }
      : {
          name: "",
          sku: "",
          type: "PRODUCT",
          brand_id: "",
          model_id: undefined,
          price: 0,
          cost_price: 0,
          stock_qty: 0,
          specifications: "{}",
          isActive: true,
        },
  })

  const onFormError = (errors: FieldErrors<ItemFormSchemaValues>) => {
    console.error("Item form validation errors:", errors)
    toast.error("Please fill all required fields correctly.")
  }

  const handleCancel = () => {
    if (onSuccess) {
      // In view mode, onSuccess is used to close the modal.
      // We pass initialData to ensure any parent state is not cleared.
      onSuccess(initialData as Item)
    } else {
      router.push(ITEMS_BASE_HREF)
    }
  }

  function onSubmit(data: ItemFormValues) {
    if (isEditMode && initialData) {
      updateItem(
        { id: initialData.id, data },
        {
          onSuccess: (updatedItem: Item) => {
            toast.success("Item updated successfully")
            queryClient.invalidateQueries({ queryKey: ["items"] })
            if (onSuccess) {
              onSuccess(updatedItem)
            } else {
              router.push(ITEMS_BASE_HREF)
            }
          },
          onError: (error) => {
            toast.error("Failed to update item: " + error.message)
          },
        }
      )
    } else {
      createItem(data, {
        onSuccess: (newItem) => {
          toast.success("Item created successfully")
          queryClient.invalidateQueries({ queryKey: ["items"] })
          if (onSuccess) {
            onSuccess(newItem)
          } else {
            router.push(ITEMS_BASE_HREF)
          }
        },
        onError: (error) => {
          toast.error("Failed to create item: " + error.message)
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="relative p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {isViewMode && (
          <div className="absolute top-4 right-4 z-10">
            <Button size="sm" type="button" onClick={(e) => { e.preventDefault(); setMode("edit"); }}>
              Edit
            </Button>
          </div>
        )}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField control={form.control} name="name" label="Item Name" required readOnly={isViewMode} placeholder="e.g., iPhone 15 Pro" />
          <TextField control={form.control} name="sku" label="SKU/Barcode" required readOnly={isViewMode} placeholder="e.g., APL-IP15P-256" />
        </div>

        <RadioGroupField control={form.control} name="type" label="Type" options={TYPE_OPTIONS.filter((o) => o.value !== "all")} required disabled={isViewMode} />

        <BrandComboboxField control={form.control} name="brand_id" required disabled={isViewMode} />

        <ModelComboboxField control={form.control} name="model_id" disabled={isViewMode} />

        <TextField control={form.control} name="price" label="Price" type="number" required readOnly={isViewMode} placeholder="e.g., 999.99" />
        <TextField control={form.control} name="cost_price" label="Cost Price" type="number" required readOnly={isViewMode} placeholder="e.g., 799.00" />
        <TextField control={form.control} name="stock_qty" label="Stock Quantity" type="number" readOnly={isViewMode} placeholder="e.g., 100" />

        <div className="md:col-span-2">
          <TextareaField
            control={form.control}
            name="specifications"
            label="Specifications (JSON)"
            placeholder='{ "color": "Blue", "storage": "256GB" }'
            rows={5}
            readOnly={isViewMode}
          />
        </div>

        <CheckboxField control={form.control} name="isActive" label="Is Active?" className="rounded-md border p-3" disabled={isViewMode} />

        <div className="md:col-span-2 flex justify-end gap-2 pt-4">
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
                {isEditMode ? "Save Changes" : "Save Item"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  )
}
