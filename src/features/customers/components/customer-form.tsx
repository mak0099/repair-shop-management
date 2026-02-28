"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Resolver, FieldValues, Control } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, Save, X, Edit3 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { TextField } from "@/components/forms/text-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { SelectField } from "@/components/forms/select-field"

import { customerSchema, type CustomerFormValues, type Customer } from "../customer.schema"
import { useCreateCustomer, useUpdateCustomer } from "../customer.api"
import { PROVINCE_OPTIONS } from "../customer.constants"
import { CUSTOMERS_BASE_HREF } from "@/config/paths"

interface CustomerFormProps {
  initialData?: Customer | null
  onSuccess?: (data: Customer) => void
  isViewMode?: boolean
}

export function CustomerForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: CustomerFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer()
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer()

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isViewMode = mode === "view"
  const isPending = isCreating || isUpdating
  const isEditMode = !!initialData && mode !== "create"

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as unknown as Resolver<CustomerFormValues>,
    defaultValues: initialData || {
      name: "", mobile: "", email: "", phone: "",
      fiscalCode: "", vat: "", sdiCode: "", pecEmail: "",
      address: "", location: "", province: "", postalCode: "",
      notes: "", isDealer: false, isActive: true,
    },
  })

  const isDealer = form.watch("isDealer")

  const handleCancel = () => {
    if (onSuccess && initialData) {
      onSuccess(initialData)
    } else {
      router.push(CUSTOMERS_BASE_HREF)
    }
  }

  const onSubmit = (data: CustomerFormValues) => {
    const callbacks = {
      onSuccess: (res: Customer) => {
        toast.success(`Customer ${isEditMode ? "updated" : "created"} successfully`)
        queryClient.invalidateQueries({ queryKey: ["customers"] })
        onSuccess ? onSuccess(res) : router.push(CUSTOMERS_BASE_HREF)
      },
      onError: (err: Error) => toast.error(err.message)
    }

    if (isEditMode && initialData?.id) {
      updateCustomer({ id: initialData.id, data }, callbacks)
    } else {
      createCustomer(data, callbacks)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="relative shadow-none border-muted-foreground/20 overflow-hidden">
          {isViewMode && (
            <div className="absolute top-4 right-4 z-10">
              <Button size="sm" type="button" variant="outline" className="shadow-sm" onClick={() => setMode("edit")}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>
          )}

          <CardContent className={cn("p-6 space-y-6", isViewMode && "pt-12")}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField control={form.control} name="name" label="Full Name" required readOnly={isViewMode} />
              <TextField control={form.control} name="mobile" label="Mobile Number" required readOnly={isViewMode} />
              <TextField control={form.control} name="email" label="Email Address" type="email" readOnly={isViewMode} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 border-t pt-4">
              <TextField control={form.control} name="address" label="Street Address" readOnly={isViewMode} className="md:col-span-3" />
              <TextField control={form.control} name="location" label="City/Comune" readOnly={isViewMode} className="md:col-span-1" />

              <SelectField
                control={form.control}
                name="province"
                label="Province"
                placeholder="Select Province"
                searchPlaceholder="Search province..."
                options={PROVINCE_OPTIONS}
                disabled={isViewMode}
                className="md:col-span-1"
              />

              <TextField control={form.control} name="postalCode" label="CAP" readOnly={isViewMode} className="md:col-span-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50/20 rounded-lg border border-blue-100/50">
              <TextField control={form.control} name="fiscalCode" label="Codice Fiscale" readOnly={isViewMode} inputClassName="uppercase font-mono tracking-wider" />
              <TextField control={form.control} name="vat" label="VAT Number (P.IVA)" readOnly={isViewMode} />
              <TextField control={form.control} name="phone" label="Landline" readOnly={isViewMode} />
            </div>

            {isDealer && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-amber-50/20 rounded-lg border border-amber-100/50 animate-in fade-in zoom-in-95">
                <TextField control={form.control} name="sdiCode" label="SDI Code" readOnly={isViewMode} inputClassName="uppercase" />
                <TextField control={form.control} name="pecEmail" label="PEC Email" readOnly={isViewMode} className="md:col-span-2" />
              </div>
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pt-4 border-t">
              <div className="flex gap-4 border-r pr-6 border-slate-200">
                <CheckboxField control={form.control} name="isDealer" label="Dealer" disabled={isViewMode} />
                <CheckboxField control={form.control} name="isActive" label="Active" disabled={isViewMode} />
              </div>
              <TextField control={form.control} name="notes" label="Internal Notes" readOnly={isViewMode} placeholder="Add specific details..." className="flex-1" />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 bg-slate-50/50 p-4 border-t">
            <Button variant="ghost" type="button" onClick={handleCancel}>
              {isViewMode ? "Close" : "Cancel"}
            </Button>
            {!isViewMode && (
              <Button type="submit" disabled={isPending} className="min-w-[150px] bg-slate-900 hover:bg-black transition-colors">
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEditMode ? "Update Customer" : "Create Customer"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}