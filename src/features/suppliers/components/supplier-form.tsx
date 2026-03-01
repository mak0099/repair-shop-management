"use client"

import { useState } from "react"
import { useForm, FieldErrors } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { FormFooter } from "@/components/forms/form-footer"

import { supplierSchema, SupplierFormValues, Supplier } from "../supplier.schema"
import { useCreateSupplier, useUpdateSupplier } from "../supplier.api"

interface SupplierFormProps {
  initialData?: Supplier | null
  /**
   * onSuccess logic handles both successful submission 
   * and modal closing for 'Cancel/Close' buttons.
   */
  onSuccess?: (data?: Supplier) => void
  isViewMode?: boolean
}

export function SupplierForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: SupplierFormProps) {
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
    defaultValues: initialData ? {
      company_name: initialData.company_name,
      contact_person: initialData.contact_person || "",
      email: initialData.email || "",
      phone: initialData.phone,
      vat_number: initialData.vat_number || "",
      address: initialData.address || "",
      city: initialData.city || "",
      isActive: initialData.isActive,
    } : {
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

  /**
   * Simple close handler for modal-based forms.
   */
  const handleClose = () => {
    if (onSuccess) {
      onSuccess(initialData || undefined)
    }
  }

  function onSubmit(data: SupplierFormValues) {
    const mutationCallbacks = {
      onSuccess: (res: Supplier) => {
        toast.success(`Supplier ${isEditMode ? "updated" : "created"} successfully`)
        queryClient.invalidateQueries({ queryKey: ["suppliers"] })
        if (onSuccess) onSuccess(res)
      },
      onError: (error: Error) => {
        toast.error(`Error: ${error.message}`)
      },
    }

    if (isEditMode && initialData) {
      updateSupplier({ id: initialData.id, data }, mutationCallbacks)
    } else {
      createSupplier(data, mutationCallbacks)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-4 p-1">
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                label="VAT / Trade License"
                readOnly={isViewMode}
                placeholder="Business ID"
              />
              <TextField 
                control={form.control} 
                name="email" 
                label="Email" 
                type="email" 
                readOnly={isViewMode} 
                placeholder="supplier@example.com" 
              />
              <TextField 
                control={form.control} 
                name="phone" 
                label="Phone" 
                required 
                readOnly={isViewMode} 
                placeholder="+880..." 
              />
              <TextField 
                control={form.control} 
                name="city" 
                label="City" 
                readOnly={isViewMode} 
                placeholder="Dhaka" 
              />
              <div className="pt-2">
                <CheckboxField 
                  control={form.control} 
                  name="isActive" 
                  label="Active Supplier" 
                  description="Visible in purchasing modules if active"
                  disabled={isViewMode} 
                  className="rounded-xl border border-slate-100 p-4 bg-slate-50/50" 
                />
              </div>
            </div>
            <TextareaField 
              control={form.control} 
              name="address" 
              label="Full Office/Warehouse Address" 
              readOnly={isViewMode} 
              placeholder="Enter full address..." 
            />
          </CardContent>
        </Card>

        <FormFooter
          isViewMode={isViewMode}
          isEditMode={isEditMode}
          isPending={isPending}
          onCancel={() => onSuccess?.(initialData!)}
          onEdit={() => setMode("edit")}
          onReset={() => form.reset()}
          saveLabel={isEditMode ? "Save Changes" : "Create Supplier"}
          className="pt-4 border-t border-slate-100"
        />
      </form>
    </Form>
  )
}