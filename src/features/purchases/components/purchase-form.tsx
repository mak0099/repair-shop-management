"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray, FormProvider, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, ShoppingBag, Loader2, Hash, X } from "lucide-react"
import { toast } from "sonner"

import { TextField } from "@/components/forms/text-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { SelectField } from "@/components/forms/select-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { CurrencyText } from "@/components/shared/data-table-cells"
import { ImageUploadField } from "@/components/forms/image-upload-field"
import { FormFooter } from "@/components/forms/form-footer"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ItemSelectField } from "@/features/items"
import { SupplierSelectField } from "@/features/suppliers"
import { AttributeSelectField } from "@/features/attributes"
import { MasterSettingSelectField } from "@/features/master-settings"

import { purchaseSchema, PurchaseFormValues, ProductPurchase } from "../purchases.schema"
import { useCreatePurchase, fetchItemDetailsForPurchase } from "../purchases.api"
import { PurchaseInvoiceView } from "./purchase-invoice-view"
import { PrintableDialog } from "@/components/shared/printable-dialog"
import { FileText } from "lucide-react"

export function PurchaseForm({ initialData, onSuccess, isViewMode }: { initialData?: ProductPurchase | null, onSuccess: () => void, isViewMode?: boolean }) {
  const { mutate: createPurchase, isPending } = useCreatePurchase()
  const [isFetchingItem, setIsFetchingItem] = useState(false)

  const form = useForm<PurchaseFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(purchaseSchema) as any,
    defaultValues: {
      supplierId: initialData?.supplierId || "",
      purchaseDate: initialData?.purchaseDate ? new Date(initialData.purchaseDate) : new Date(),
      items: initialData?.items || [],
      subtotal: initialData?.subtotal || 0,
      totalAmount: initialData?.totalAmount || 0,
      paidAmount: initialData?.paidAmount || 0,
      dueAmount: initialData?.dueAmount || 0,
      paymentMethod: initialData?.paymentMethod || "CASH",
      status: initialData?.status || "COMPLETED",
      notes: initialData?.notes || "",
      tempItemId: ""
    }
  })

  const { control, watch, setValue, getValues, handleSubmit } = form
  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  const handleAddItem = async () => {
    const productId = getValues("tempItemId")
    if (!productId) return

    try {
      setIsFetchingItem(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const details = await fetchItemDetailsForPurchase(productId) as any;

      append({
        productId: productId,
        name: details.name,
        quantity: 1,
        costPrice: details.purchasePrice || 0,
        subtotal: details.purchasePrice,
        isSerialized: details.isSerialized,
        serialList: details.isSerialized ? [{ imei: "", batteryHealth: "", condition: "", isBoxIncluded: false, isChargerIncluded: false }] : []
      })

      setValue("tempItemId", "")
    } catch {
      toast.error("Failed to fetch item details")
    } finally {
      setIsFetchingItem(false)
    }
  }

  const watchedItems = watch("items")
  const itemsStr = JSON.stringify(watchedItems)
  const paidAmount = watch("paidAmount")

  useEffect(() => {
    const subtotal = (watchedItems || []).reduce((acc, item) => {
      const price = Number(item.costPrice) || 0;
      const qty = Number(item.quantity) || 0;
      return acc + (price * qty);
    }, 0);
    setValue("subtotal", subtotal)
    setValue("totalAmount", subtotal)
    setValue("dueAmount", subtotal - (Number(paidAmount) || 0))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsStr, paidAmount, setValue])

  const onSubmit = (data: PurchaseFormValues) => {
    createPurchase(data, { onSuccess })
  }

  const onInvalid = (errors: FieldErrors<PurchaseFormValues>) => {
    if (errors.items?.root?.message) {
      toast.error(errors.items.root.message)
    } else if (errors.items?.message) {
      toast.error(errors.items.message as string)
    } else {
      toast.error("Please fill in all required fields correctly.")
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any, onInvalid as any)} className="flex flex-col h-full bg-background">

          {/* ১. Top Header with View Invoice Button */}
          {isViewMode && initialData && (
            <div className="flex items-center justify-between px-6 py-3 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Transaction Mode</span>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[9px] font-bold px-2 py-0.5 rounded">READ ONLY</span>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ২. Supplier name fix: Ensure value is showing correctly in view mode */}
              <SupplierSelectField
                name="supplierId"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={control as any}
                label="Supplier"
                required
                readOnly={isViewMode}
              />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <DatePickerField name="purchaseDate" control={control as any} label="Date" required readOnly={isViewMode} />
            </div>

            {!isViewMode && (
              <div className="bg-muted/50 p-4 rounded-xl border border-border flex items-end gap-4">
                <div className="flex-1">
                  <ItemSelectField
                    name="tempItemId"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    control={control as any}
                    label="Search Part/Item"
                    canAdd
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!watch("tempItemId") || isFetchingItem}
                  className="bg-primary hover:bg-primary/90 h-10 px-6 font-bold text-xs"
                >
                  {isFetchingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  ADD ITEM
                </Button>
              </div>
            )}

            <div className="border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-muted p-3 border-b border-border text-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" /> Voucher Items
              </div>
              <div className="divide-y divide-border">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-card hover:bg-muted/50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-foreground">{field.name}</p>
                          {field.isSerialized && (
                            <span className="bg-primary/10 text-primary text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Serialized</span>
                          )}
                        </div>
                        <p className="text-[9px] text-muted-foreground">SKU: {field.productId}</p>
                      </div>
                      <div className="col-span-3">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <TextField name={`items.${index}.costPrice`} control={control as any} label="Cost (€)" type="number" min={0} disabled={isViewMode} />
                      </div>
                      <div className="col-span-2">
                        <TextField
                          name={`items.${index}.quantity`}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          control={control as any}
                          label="Qty"
                          type="number"
                          min={1}
                          readOnly={isViewMode || field.isSerialized}
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-3 text-right">
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase block">Total</span>
                          <span className="text-xs font-black text-foreground">
                            <CurrencyText amount={(Number(watch(`items.${index}.costPrice`)) || 0) * (Number(watch(`items.${index}.quantity`)) || 0)} />
                          </span>
                        </div>
                        {!isViewMode && (
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {field.isSerialized && (
                      <div className="mt-4 pt-4 border-t border-dashed border-border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                              {isViewMode ? "IMEI / SN" : "Enter IMEI / SN"}
                            </span>
                          </div>

                          {!isViewMode && (
                            <Button
                              type="button"
                              variant="outline"
                              className="h-6 px-2 text-[9px] font-bold text-primary border-primary/20 hover:bg-primary/10"
                              onClick={() => {
                                const currentSerials = watch(`items.${index}.serialList`) || [];
                                const updatedSerials = [...currentSerials, { imei: "", batteryHealth: "", condition: "", isBoxIncluded: false, isChargerIncluded: false }];
                                setValue(`items.${index}.serialList`, updatedSerials);
                                setValue(`items.${index}.quantity`, updatedSerials.length);
                              }}
                            >
                              + ADD UNIT
                            </Button>
                          )}
                        </div>
                        <div className="flex flex-col gap-3 mt-3">
                          {watchedItems[index]?.serialList?.map((_, sIndex) => (
                            <div key={sIndex} className="p-4 bg-muted/40 rounded-xl border border-border">
                              <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Unit #{sIndex + 1} Details
                                </span>
                                {!isViewMode && watchedItems[index].serialList.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentSerials = [...watchedItems[index].serialList];
                                      currentSerials.splice(sIndex, 1);
                                      setValue(`items.${index}.serialList`, currentSerials);
                                      setValue(`items.${index}.quantity`, currentSerials.length);
                                    }}
                                    className="text-destructive hover:text-destructive/80 flex items-center gap-1 text-[9px] font-bold uppercase transition-colors"
                                  >
                                    <Trash2 className="h-3 w-3" /> Remove Unit
                                  </button>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <TextField control={control as any} name={`items.${index}.serialList.${sIndex}.imei`} label="IMEI / SN" required={!isViewMode} readOnly={isViewMode} />
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <TextField control={control as any} name={`items.${index}.serialList.${sIndex}.batteryHealth`} label="Battery %" placeholder="e.g. 95" readOnly={isViewMode} />
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <AttributeSelectField control={control as any} name={`items.${index}.serialList.${sIndex}.condition`} attributeKey="GRADE" label="Grade" readOnly={isViewMode} />
                                
                                <div className="md:col-span-2 flex flex-col md:flex-row gap-4 mt-1 md:mt-0 md:pt-6">
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                  <CheckboxField control={control as any} name={`items.${index}.serialList.${sIndex}.isBoxIncluded`} label="Box Included" disabled={isViewMode} />
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                  <CheckboxField control={control as any} name={`items.${index}.serialList.${sIndex}.isChargerIncluded`} label="Charger Included" disabled={isViewMode} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
               {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
               <SelectField name="status" control={control as any} label="Status" options={[{ label: "Completed", value: "COMPLETED" }, { label: "Pending", value: "PENDING" }, { label: "Cancelled", value: "CANCELLED" }]} required readOnly={isViewMode} />
               {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
               <MasterSettingSelectField type="PAYMENT_METHOD" name="paymentMethod" control={control as any} label="Payment Method" required readOnly={isViewMode} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <TextareaField name="notes" control={control as any} label="Notes" rows={4} readOnly={isViewMode} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <ImageUploadField 
                control={control as any} 
                name="receiptImage" 
                label="Supplier Receipt / Invoice (Photo)" 
                initialImage={initialData?.receiptImage as string | null} 
                isViewMode={isViewMode} 
                layout="compact" 
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <div className="w-full md:w-1/2 space-y-4 bg-muted/50 p-6 rounded-2xl border border-border">
                <div className="flex justify-between items-center text-muted-foreground font-bold uppercase text-[11px]">
                  <span>Grand Total</span>
                  <span className="text-xl font-black text-foreground"><CurrencyText amount={watch("totalAmount")} /></span>
                </div>
                <div className="pt-4 border-t border-border">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <TextField name="paidAmount" control={control as any} label="Amount Paid" type="number" min={0} disabled={isViewMode} />
                </div>
                <div className="flex justify-between items-center pt-2 text-destructive font-black">
                  <span className="text-[10px] uppercase tracking-widest">Balance Due</span>
                  <span className="text-lg"><CurrencyText amount={watch("dueAmount")} /></span>
                </div>
              </div>
            </div>
          </div>

          {!isViewMode && (
            <FormFooter isPending={isPending} onCancel={onSuccess} saveLabel="Complete Purchase" />
          )}
        </form>
      </Form>
    </FormProvider>
  )
}