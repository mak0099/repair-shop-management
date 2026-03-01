"use client"

import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { RadioGroupField } from "@/components/forms/radio-group-field"
import { SelectField } from "@/components/forms/select-field"
import { FormFooter } from "@/components/forms/form-footer"

import { stockAdjustmentSchema, StockAdjustment, StockAdjustmentFormValues } from "../stock-adjustment.schema"
import { useCreateStockAdjustment, useUpdateStockAdjustment } from "../stock-adjustment.api"
import { STOCK_ADJUSTMENT_REASON_OPTIONS, STOCK_ADJUSTMENT_TYPE_OPTIONS } from "../stock-adjustment.constants"
import { StockSelectField } from "@/features/stock"

interface StockAdjustmentFormProps {
  initialData?: StockAdjustment | null
  onSuccess?: (data: StockAdjustment) => void
  isViewMode?: boolean
}

export function StockAdjustmentForm({
  initialData,
  onSuccess,
  isViewMode: initialIsViewMode = false,
}: StockAdjustmentFormProps) {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isViewMode = mode === "view"

  const { mutate: createAdjustment, isPending: isCreating } = useCreateStockAdjustment()
  const { mutate: updateAdjustment, isPending: isUpdating } = useUpdateStockAdjustment()
  const isPending = isCreating || isUpdating

  /**
   * FIX: Use 'StockAdjustmentFormValues' instead of 'StockAdjustment'.
   * This matches the Zod schema and avoids the "id/createdAt" missing error.
   */
  const form = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: initialData ? {
      stockId: initialData.stockId,
      type: initialData.type,
      quantity: initialData.quantity,
      reason: initialData.reason,
      date: initialData.date,
      note: initialData.note || "",
      itemName: initialData.itemName,
      imei: initialData.imei,
      adjustedBy: initialData.adjustedBy,
    } : {
      stockId: "",
      type: "OUT",
      quantity: 1,
      reason: "Inventory Audit",
      date: new Date().toISOString(),
      note: "",
    },
  })

  function onSubmit(data: StockAdjustmentFormValues) {
    const callbacks = {
      onSuccess: (res: StockAdjustment) => {
        toast.success(`Stock adjusted successfully`)
        queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] })
        queryClient.invalidateQueries({ queryKey: ["stock"] })
        onSuccess?.(res)
      },
      onError: (error: Error) => toast.error(error.message),
    }

    if (initialData?.id) {
      /**
       * We pass the ID separately and the 'data' (FormValues) as the body.
       */
      updateAdjustment({ id: initialData.id, data }, callbacks)
    } else {
      createAdjustment(data, callbacks)
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg">Adjustment Details</CardTitle>
              <CardDescription>
                Select the specific stock unit (IMEI) and provide adjustment details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StockSelectField
                  control={form.control}
                  name="stockId"
                  label="Specific Unit (IMEI)"
                  placeholder="Search IMEI or Model..."
                  readOnly={isViewMode || !!initialData}
                />
                <RadioGroupField
                  control={form.control}
                  name="type"
                  label="Movement Direction"
                  options={STOCK_ADJUSTMENT_TYPE_OPTIONS}
                  readOnly={isViewMode}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  control={form.control}
                  name="quantity"
                  label="Quantity"
                  type="number"
                  readOnly={isViewMode}
                />
                <SelectField
                  control={form.control}
                  name="reason"
                  label="Adjustment Reason"
                  options={STOCK_ADJUSTMENT_REASON_OPTIONS}
                  placeholder="Select reason..."
                  readOnly={isViewMode}
                />
              </div>

              <TextareaField
                control={form.control}
                name="note"
                label="Notes / Context"
                placeholder="Ex: Unit found damaged during audit..."
                readOnly={isViewMode}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {!isViewMode && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <p className="font-bold mb-1 uppercase tracking-wider">Stock Impact Warning</p>
                Confirming this will immediately update your inventory levels. 
              </div>
            </div>
          )}

          <FormFooter
            isViewMode={isViewMode}
            isEditMode={!!initialData}
            isPending={isPending}
            onCancel={() => onSuccess?.(initialData as StockAdjustment)}
            onEdit={() => setMode("edit")}
            onReset={() => form.reset()}
            saveLabel="Confirm Adjustment"
            className="pt-4 border-t border-slate-100"
          />
        </form>
      </Form>
    </FormProvider>
  )
}