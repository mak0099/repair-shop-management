"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { TextField } from "@/components/forms/text-field"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field"

import { customerSchema, CustomerFormValues, Customer } from "../customer.schema"
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
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || {
      name: "", mobile: "", email: "", phone: "",
      fiscal_code: "", vat: "", sdi_code: "", pec_email: "",
      address: "", location: "", province: "", postal_code: "",
      notes: "", isDealer: false, isActive: true,
    },
  })

  const isDealer = form.watch("isDealer")

  const handleCancel = () => {
    if (onSuccess) {
      onSuccess(initialData as Customer)
    } else {
      router.push(CUSTOMERS_BASE_HREF)
    }
  }

  const onSubmit = (data: CustomerFormValues) => {
    const handleSuccess = (res: Customer) => {
      toast.success(`Customer ${isEditMode ? "updated" : "created"} successfully`)
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      if (onSuccess) {
        onSuccess(res)
      } else {
        router.push(CUSTOMERS_BASE_HREF)
      }
    }

    const handleError = (err: Error) => {
      toast.error(err.message)
    }

    if (isEditMode && initialData) {
      updateCustomer({ id: initialData.id, data }, { onSuccess: handleSuccess, onError: handleError })
    } else {
      createCustomer(data, { onSuccess: handleSuccess, onError: handleError })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="relative shadow-none border-muted-foreground/20">
          {isViewMode && (
            <div className="absolute top-4 right-4 z-10">
              <Button size="sm" type="button" onClick={(e) => {
                e.preventDefault()
                setMode("edit")
              }}>
                Edit
              </Button>
            </div>
          )}
          <CardContent className={cn("p-4 space-y-1", isViewMode && "pt-10")}>

            {/* Section 1: Contact Info (3 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 space-y-3">
              <TextField control={form.control} name="name" label="Name" required={true} readOnly={isViewMode} placeholder="e.g. Mario Rossi" inputClassName="h-10" />
              <TextField control={form.control} name="mobile" label="Mobile" required={true} readOnly={isViewMode} placeholder="+39 340 123 4567" inputClassName="h-10" />
              <TextField control={form.control} name="email" label="Email" type="email" readOnly={isViewMode} placeholder="mario.rossi@email.it" inputClassName="h-10" />
            </div>

            {/* Section 2: Address (Compact Row) */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <TextField control={form.control} name="address" label="Address" readOnly={isViewMode} placeholder="Via Roma, 12" inputClassName="h-10" className="md:col-span-3" />
              <TextField control={form.control} name="location" label="City" readOnly={isViewMode} placeholder="Milano" inputClassName="h-10" className="md:col-span-1" />
              <ComboboxWithAdd disabled={isViewMode} control={form.control} name="province" label="Province" placeholder="Prov." options={PROVINCE_OPTIONS} className="md:col-span-1" />
              <TextField control={form.control} name="postal_code" label="CAP" readOnly={isViewMode} placeholder="20100" inputClassName="h-10" className="md:col-span-1" />
            </div>

            {/* Section 3: Legal & Tax (Highlighted 3 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-dashed">
              <TextField control={form.control} name="fiscal_code" label="Fiscal Code" readOnly={isViewMode} placeholder="RSSMRA80A01H501U" labelClassName="text-[11px] font-bold uppercase text-blue-600" inputClassName="h-8 border-blue-200 bg-blue-50/30 uppercase" />
              <TextField control={form.control} name="vat" label="VAT (P. IVA)" readOnly={isViewMode} placeholder="IT01234567890" labelClassName="text-[11px] font-bold uppercase text-blue-600" inputClassName="h-8 border-blue-200 bg-blue-50/30" />
              <TextField control={form.control} name="phone" label="Landline" readOnly={isViewMode} placeholder="02 1234567" inputClassName="h-10" />
            </div>

            {/* Section 4: Dealer Specific (3 Columns - Conditional) */}
            {isDealer && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2 bg-muted/50 rounded border border-dashed animate-in fade-in slide-in-from-top-1">
                <TextField control={form.control} name="sdi_code" label="SDI Code" readOnly={isViewMode} placeholder="1234567" labelClassName="text-[11px] font-bold uppercase text-blue-700" inputClassName="h-8 bg-white uppercase" />
                <TextField control={form.control} name="pec_email" label="PEC Email" readOnly={isViewMode} placeholder="mario.rossi@legalmail.it" labelClassName="text-[11px] font-bold uppercase text-blue-700" inputClassName="h-8 bg-white" className="md:col-span-2" />
              </div>
            )}

            {/* Footer: Checkboxes & Notes */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex gap-4 border-r pr-4">
                <CheckboxField control={form.control} name="isDealer" label="IS DEALER" disabled={isViewMode} />
                <CheckboxField control={form.control} name="isActive" label="ACTIVE" disabled={isViewMode} />
              </div>
              <TextField control={form.control} name="notes" label="Notes" readOnly={isViewMode} placeholder="Internal notes (e.g. VIP client, prompt payment)..." inputClassName="h-8 text-xs italic" className="flex-1" />
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-2 px-4 pb-4">
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
                  {isEditMode ? "Save Changes" : "Save Customer"}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}