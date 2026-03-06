"use client"

import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Wallet, MessageSquare, LayoutGrid, Settings2, Edit3, User2 } from "lucide-react"
import { toast } from "sonner"

import { Form } from "@/components/ui/form"
import { TextField } from "@/components/forms/text-field"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { SelectField } from "@/components/forms/select-field"
import { RadioGroupField } from "@/components/forms/radio-group-field"
import { FormFooter } from "@/components/forms/form-footer"
import { Button } from "@/components/ui/button"

import { SupplierSelectField } from "@/features/suppliers"
import { CustomerSelectField } from "@/features/customers"

import { khataSchema, KhataFormValues, KhataEntry } from "../khata.schema"
import {
  KHATA_FLOWS,
  FLOW_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  ADJUSTMENT_REASON_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PARTY_TYPE_OPTIONS
} from "../khata.constants"
import { useCreateKhata, usePartialUpdateKhata } from "../khata.api"

export function KhataForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: any) {
  const { mutate: createKhata, isPending: isCreating } = useCreateKhata()
  const { mutate: updateKhata, isPending: isUpdating } = usePartialUpdateKhata()

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isViewMode = mode === "view"
  const isPending = isCreating || isUpdating

  const form = useForm<KhataFormValues>({
    resolver: zodResolver(khataSchema),
    defaultValues: initialData || {
      date: new Date(),
      direction: "OUT",
      type: "ADJUSTMENT",
      paymentMethod: "CASH",
      partyType: "SUPPLIER",
      amount: 0,
      note: "",
    },
  })

  const { control, handleSubmit, watch } = form
  const currentDirection = watch("direction") as keyof typeof KHATA_FLOWS;
  const partyType = watch("partyType");
  const flowConfig = KHATA_FLOWS[currentDirection] || KHATA_FLOWS.OUT;

  const onSubmit = (data: KhataFormValues) => {
    const callbacks = {
      onSuccess: () => {
        toast.success(`Transaction ${initialData ? "updated" : "saved"} successfully`)
        onSuccess?.()
      },
      onError: (err: Error) => toast.error(err.message)
    }
    if (initialData?.id) {
      updateKhata({ id: initialData.id, data: data as Partial<KhataEntry> }, callbacks)
    } else {
      createKhata(data as KhataEntry, callbacks)
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full bg-slate-50/30">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Section 1: Money & Flow */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl transition-all border border-slate-100 relative ${currentDirection === "IN"
                ? "shadow-[0_10px_30px_rgba(16,185,129,0.06)] bg-white"
                : "shadow-[0_10px_30px_rgba(244,63,94,0.06)] bg-white"
              }`}>
              <SelectField name="direction" control={control} label="Money Flow" options={FLOW_OPTIONS} readOnly={isViewMode} required />
              <TextField name="amount" control={control} label="Amount (€)" type="number" icon={<Wallet className={`h-4 w-4 ${flowConfig.iconColor}`} />} readOnly={isViewMode} required />
            </div>

            {/* Section 2: Ledger Data */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 space-y-6 shadow-sm">
              {/* Row 1: Date & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <DatePickerField name="date" control={control} label="Date" readOnly={isViewMode} required />
                <SelectField name="type" control={control} label="Category" options={TRANSACTION_TYPE_OPTIONS} readOnly={isViewMode} required />
              </div>

              {/* Row 2: Party Selection (RadioGroup Layout Fix) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 bg-slate-50/50 rounded-xl border border-slate-100/50">
                <div className="md:col-span-5">
                  <RadioGroupField
                    layout="partial-horizontal"
                    name="partyType"
                    control={control}
                    label="Party Category"
                    options={PARTY_TYPE_OPTIONS}
                    readOnly={isViewMode}
                  />
                </div>
                <div className="md:col-span-7">
                  {partyType === "SUPPLIER" ? (
                    <SupplierSelectField name="partyId" control={control} label="Select Supplier" readOnly={isViewMode} />
                  ) : (
                    <CustomerSelectField name="partyId" control={control} label="Select Customer" readOnly={isViewMode} />
                  )}
                </div>
              </div>

              {/* Row 3: Method & Reason */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SelectField name="paymentMethod" control={control} label="Payment Method" options={PAYMENT_METHOD_OPTIONS} readOnly={isViewMode} required />
                <SelectField name="adjustmentReason" control={control} label="Adjustment Reason" options={ADJUSTMENT_REASON_OPTIONS} readOnly={isViewMode} />
              </div>

              {/* Row 4: Reference & Note */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <TextField name="referenceId" control={control} label="Ref / Invoice" readOnly={isViewMode} />
                <div className="md:col-span-2">
                  <TextField name="note" control={control} label="Internal Notes" icon={<MessageSquare className="h-3.5 w-3.5 text-slate-300" />} readOnly={isViewMode} />
                </div>
              </div>
            </div>
          </div>

          <FormFooter
            isViewMode={isViewMode}
            isEditMode={mode === "edit"}
            isPending={isPending}
            onCancel={() => onSuccess?.()}
            onEdit={() => setMode("edit")}
            onReset={() => form.reset()}
            saveLabel={initialData ? "Update Record" : "Confirm Entry"}
            className="p-5 bg-white border-t mt-auto shadow-[0_-10px_20px_rgba(0,0,0,0.02)]"
          />
        </form>
      </Form>
    </FormProvider>
  )
}