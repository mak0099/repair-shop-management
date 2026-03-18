"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, ShoppingBag, Loader2, Hash, X } from "lucide-react"
import { toast } from "sonner"

import { TextField } from "@/components/forms/text-field"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { FormFooter } from "@/components/forms/form-footer"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ItemSelectField } from "@/features/items"
import { SupplierSelectField } from "@/features/suppliers"

import { purchaseSchema, PurchaseFormValues, ProductPurchase } from "../purchases.schema"
import { useCreatePurchase, fetchItemDetailsForPurchase } from "../purchases.api"
import { PurchaseInvoiceView } from "./purchase-invoice-view"

export function PurchaseForm({ initialData, onSuccess, isViewMode }: { initialData?: ProductPurchase | null, onSuccess: () => void, isViewMode?: boolean }) {
  const { mutate: createPurchase, isPending } = useCreatePurchase()
  const [isFetchingItem, setIsFetchingItem] = useState(false)

  const form = useForm<PurchaseFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(purchaseSchema) as any,
    defaultValues: initialData || {
      purchaseDate: new Date(),
      items: [],
      subtotal: 0,
      totalAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
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
        serialList: details.isSerialized ? [""] : []
      })

      setValue("tempItemId", "")
    } catch {
      toast.error("Failed to fetch item details")
    } finally {
      setIsFetchingItem(false)
    }
  }

  const watchedItems = watch("items")
  const paidAmount = watch("paidAmount")

  useEffect(() => {
    const subtotal = watchedItems.reduce((acc, item) => acc + (Number(item.costPrice) * Number(item.quantity)), 0)
    setValue("subtotal", subtotal)
    setValue("totalAmount", subtotal)
    setValue("dueAmount", subtotal - (paidAmount || 0))
  }, [watchedItems, paidAmount, setValue])

  const onSubmit = (data: PurchaseFormValues) => {
    createPurchase(data, { onSuccess })
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="flex flex-col h-full bg-background">

          {/* ১. Top Header with View Invoice Button */}
          {isViewMode && initialData && (
            <div className="flex items-center justify-between px-6 py-3 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Transaction Mode</span>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-[9px] font-bold px-2 py-0.5 rounded">READ ONLY</span>
              </div>

              {/* সরাসরি এই ডায়ালগটি ব্যবহার করুন */}
              <PurchaseInvoiceView purchase={initialData} />
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
                readOnly={isViewMode}
              />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <DatePickerField name="purchaseDate" control={control as any} label="Date" readOnly={isViewMode} />
            </div>

            {!isViewMode && (
              <div className="bg-muted/50 p-4 rounded-xl border border-border flex items-end gap-4">
                <div className="flex-1">
                  <ItemSelectField
                    name="tempItemId"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    control={control as any}
                    label="Search Part/Item"
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
                        <TextField name={`items.${index}.costPrice`} control={control as any} label="Cost (€)" type="number" disabled={isViewMode} />
                      </div>
                      <div className="col-span-2">
                        <TextField
                          name={`items.${index}.quantity`}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          control={control as any}
                          label="Qty"
                          type="number"
                          disabled={isViewMode || field.isSerialized}
                          className={field.isSerialized ? "bg-muted opacity-60 font-bold" : ""}
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-3 text-right">
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase block">Total</span>
                          <span className="text-xs font-black text-foreground">€{(watch(`items.${index}.costPrice`) * watch(`items.${index}.quantity`)).toLocaleString()}</span>
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
                                const updatedSerials = [...currentSerials, ""];
                                setValue(`items.${index}.serialList`, updatedSerials);
                                setValue(`items.${index}.quantity`, updatedSerials.length);
                              }}
                            >
                              + ADD UNIT
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {watchedItems[index]?.serialList?.map((_, sIndex) => (
                            <div key={sIndex} className="relative group">
                              <Input
                                placeholder={`IMEI/SN ${sIndex + 1}`}
                                className="h-8 text-[10px] pr-7 bg-background"
                                readOnly={isViewMode}
                                // ৩. Focus fix: tabIndex={-1} prevents focus on view mode
                                tabIndex={isViewMode ? -1 : 0}
                                {...form.register(`items.${index}.serialList.${sIndex}`)}
                              />
                              {!isViewMode && watchedItems[index].serialList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentSerials = [...watchedItems[index].serialList];
                                    currentSerials.splice(sIndex, 1);
                                    setValue(`items.${index}.serialList`, currentSerials);
                                    setValue(`items.${index}.quantity`, currentSerials.length);
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <div className="w-full md:w-1/2 space-y-4 bg-muted/50 p-6 rounded-2xl border border-border">
                <div className="flex justify-between items-center text-muted-foreground font-bold uppercase text-[11px]">
                  <span>Grand Total</span>
                  <span className="text-xl font-black text-foreground">€{watch("totalAmount").toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-border">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <TextField name="paidAmount" control={control as any} label="Amount Paid (€)" type="number" disabled={isViewMode} />
                </div>
                <div className="flex justify-between items-center pt-2 text-destructive font-black">
                  <span className="text-[10px] uppercase tracking-widest">Balance Due</span>
                  <span className="text-lg">€{watch("dueAmount").toLocaleString()}</span>
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