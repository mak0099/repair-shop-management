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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { supplierSchema, SupplierFormValues, Supplier } from "../supplier.schema"
import { useCreateSupplier, useUpdateSupplier } from "../supplier.api"

const SUPPLIERS_BASE_HREF = "/dashboard/inventory/suppliers"

interface SupplierFormProps {
  initialData?: Supplier | null
  onSuccess?: (data: Supplier) => void
  isViewMode?: boolean
}

export function SupplierForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: SupplierFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { mutate: createSupplier, isPending: isCreating } = useCreateSupplier()
  const { mutate: updateSupplier, isPending: isUpdating } = useUpdateSupplier()

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isViewMode = mode === "view"

  const isPending = isCreating || isUpdating
  const isEditMode = !!initialData && mode !== "create"

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData || {
      company_name: "",
      contact_person: "",
      email: "",
      phone: "",
      vat_number: "",
      address: "",
      city: "",
      isActive: true,
    },
  })

  const onFormError = (errors: FieldErrors<SupplierFormValues>) => {
    console.error("Supplier form validation errors:", errors)
    toast.error("Please fill all required fields correctly.")
  }

  const handleCancel = () => {
    if (onSuccess) {
      onSuccess(initialData as Supplier)
    } else {
      router.push(SUPPLIERS_BASE_HREF)
    }
  }

  function onSubmit(data: SupplierFormValues) {
    if (isEditMode && initialData) {
      updateSupplier(
        { id: initialData.id, data },
        {
          onSuccess: (updatedSupplier: Supplier) => {
            toast.success("Supplier updated successfully")
            queryClient.invalidateQueries({ queryKey: ["suppliers"] })
            if (onSuccess) {
              onSuccess(updatedSupplier)
            } else {
              router.push(SUPPLIERS_BASE_HREF)
            }
          },
          onError: (error) => {
            toast.error("Failed to update supplier: " + error.message)
          },
        }
      )
    } else {
      createSupplier(data, {
        onSuccess: (newSupplier) => {
          toast.success("Supplier created successfully")
          queryClient.invalidateQueries({ queryKey: ["suppliers"] })
          if (onSuccess) {
            onSuccess(newSupplier)
          } else {
            router.push(SUPPLIERS_BASE_HREF)
          }
        },
        onError: (error) => {
          toast.error("Failed to create supplier: " + error.message)
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-4">
        <Card>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                control={form.control}
                name="company_name"
                label="Company Name"
                required
                readOnly={isViewMode}
                placeholder="e.g., Apple Inc."
              />
              <TextField
                control={form.control}
                name="contact_person"
                label="Contact Person"
                readOnly={isViewMode}
                placeholder="e.g., Tim Cook"
              />
              <TextField
                control={form.control}
                name="vat_number"
                label="VAT Number"
                readOnly={isViewMode}
                placeholder="e.g., IT12345678901"
              />
              <TextField control={form.control} name="email" label="Email" type="email" readOnly={isViewMode} placeholder="e.g., supplier@apple.com" />
              <TextField control={form.control} name="phone" label="Phone" required readOnly={isViewMode} placeholder="e.g., +1234567890" />
              <TextField control={form.control} name="city" label="City" readOnly={isViewMode} placeholder="e.g., Cupertino" />
              <CheckboxField control={form.control} name="isActive" label="Is Active?" disabled={isViewMode} className="rounded-md border p-3" />
            </div>
            <TextareaField control={form.control} name="address" label="Address" readOnly={isViewMode} placeholder="e.g., 1 Apple Park Way" />
          </CardContent>
        </Card>

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
                {isEditMode ? "Save Changes" : "Save Supplier"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  )
}
