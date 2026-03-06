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

import { purchaseSchema, PurchaseFormValues, ProductPurchase, PurchaseItem } from "../purchases.schema"
import { useCreatePurchase, fetchItemDetailsForPurchase } from "../purchases.api"
import { PurchaseInvoiceDialog } from "./purchase-invoice-dialog"

export function PurchaseForm({ initialData, onSuccess, isViewMode }: { initialData?: ProductPurchase | null, onSuccess: () => void, isViewMode?: boolean }) {
  const { mutate: createPurchase, isPending } = useCreatePurchase()
  const [isFetchingItem, setIsFetchingItem] = useState(false)

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
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
      const details = await fetchItemDetailsForPurchase(productId) as PurchaseItem;

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
    } catch (error) {
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full bg-white">

          {/* ১. Top Header with View Invoice Button */}
          {isViewMode && initialData && (
            <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Transaction Mode</span>
                <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded">READ ONLY</span>
              </div>

              {/* সরাসরি এই ডায়ালগটি ব্যবহার করুন */}
              <PurchaseInvoiceDialog purchase={initialData} />
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ২. Supplier name fix: Ensure value is showing correctly in view mode */}
              <SupplierSelectField
                name="supplierId"
                control={control}
                label="Supplier"
                readOnly={isViewMode}
              />
              <DatePickerField name="purchaseDate" control={control} label="Date" readOnly={isViewMode} />
            </div>

            {!isViewMode && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-end gap-4">
                <div className="flex-1">
                  <ItemSelectField
                    name="tempItemId"
                    control={control}
                    label="Search Part/Item"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!watch("tempItemId") || isFetchingItem}
                  className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-bold text-xs"
                >
                  {isFetchingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  ADD ITEM
                </Button>
              </div>
            )}

            <div className="border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-100 p-3 border-b text-slate-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag className="h-3.5 w-3.5 text-slate-500" /> Voucher Items
              </div>
              <div className="divide-y">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800">{field.name}</p>
                          {field.isSerialized && (
                            <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Serialized</span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400">SKU: {field.productId}</p>
                      </div>
                      <div className="col-span-3">
                        <TextField name={`items.${index}.costPrice`} control={control} label="Cost (€)" type="number" disabled={isViewMode} />
                      </div>
                      <div className="col-span-2">
                        <TextField
                          name={`items.${index}.quantity`}
                          control={control}
                          label="Qty"
                          type="number"
                          disabled={isViewMode || field.isSerialized}
                          className={field.isSerialized ? "bg-slate-50 opacity-60 font-bold" : ""}
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-3 text-right">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total</span>
                          <span className="text-xs font-black">€{(watch(`items.${index}.costPrice`) * watch(`items.${index}.quantity`)).toLocaleString()}</span>
                        </div>
                        {!isViewMode && (
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-500" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {field.isSerialized && (
                      <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-slate-400" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                              {isViewMode ? "IMEI / SN" : "Enter IMEI / SN"}
                            </span>
                          </div>

                          {!isViewMode && (
                            <Button
                              type="button"
                              variant="outline"
                              className="h-6 px-2 text-[9px] font-bold text-blue-600 border-blue-200 hover:bg-blue-50"
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
                                className="h-8 text-[10px] pr-7 bg-white"
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
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500"
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

            <div className="flex justify-end pt-4 border-t">
              <div className="w-full md:w-1/2 space-y-4 bg-slate-50 p-6 rounded-2xl border">
                <div className="flex justify-between items-center text-slate-600 font-bold uppercase text-[11px]">
                  <span>Grand Total</span>
                  <span className="text-xl font-black text-slate-900">€{watch("totalAmount").toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t">
                  <TextField name="paidAmount" control={control} label="Amount Paid (€)" type="number" disabled={isViewMode} />
                </div>
                <div className="flex justify-between items-center pt-2 text-red-600 font-black">
                  <span className="text-[10px] uppercase tracking-widest">Balance Due</span>
                  <span className="text-lg">€{watch("dueAmount").toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {!isViewMode && (
            <FormFooter isPending={isPending} onCancel={onSuccess} submitLabel="Complete Purchase" className="p-6 bg-slate-50 border-t" />
          )}
        </form>
      </Form>
    </FormProvider>
  )
}