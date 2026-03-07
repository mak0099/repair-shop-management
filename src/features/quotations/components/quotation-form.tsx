"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, Package, Loader2, Calculator, Receipt } from "lucide-react"
import { toast } from "sonner"

import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { FormFooter } from "@/components/forms/form-footer"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { CustomerSelectField } from "@/features/customers"
import { ItemSelectField } from "@/features/items"

import { quotationSchema, QuotationFormValues, Quotation } from "../quotations.schema"
import { useCreateQuotation, useUpdateQuotation, fetchItemDetailsForQuotation } from "../quotations.api"
import { DEFAULT_TAX_RATE } from "../../sales/sales.constants"

export function QuotationForm({ initialData, onSuccess, isViewMode }: { initialData?: Quotation | null, onSuccess: () => void, isViewMode?: boolean }) {
  const { mutate: createQuote, isPending: isCreating } = useCreateQuotation()
  const { mutate: updateQuote, isPending: isUpdating } = useUpdateQuotation()
  const [isFetchingItem, setIsFetchingItem] = useState(false)

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: initialData || {
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: [],
      subtotal: 0,
      totalTax: 0,
      totalDiscount: 0,
      grandTotal: 0,
      notes: "",
      tempItemId: ""
    }
  })

  const { control, watch, setValue, getValues, handleSubmit } = form
  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  // ১. আইটেম অ্যাড করার লজিক
  const handleAddItem = async () => {
    const productId = getValues("tempItemId")
    if (!productId) return

    try {
      setIsFetchingItem(true)
      const details = await fetchItemDetailsForQuotation(productId) 

      append({
        productId: productId,
        name: details.name,
        quantity: 1,
        price: details.salePrice || 0,
        subtotal: details.salePrice || 0,
        type: details.type || "PRODUCT",
        tax: 0,
        discount: 0
      })

      setValue("tempItemId", "")
      toast.success(`${details.name} added`)
    } catch (error) {
      toast.error("Failed to fetch item details")
    } finally {
      setIsFetchingItem(false)
    }
  }

  // ২. ক্যালকুলেশন ফিক্স: watchedItems এর ওপর ডিপেন্ড করে রিয়েল টাইম আপডেট
  const watchedItems = watch("items")
  const totalDiscount = watch("totalDiscount")

  useEffect(() => {
    // প্রতিটি আইটেমের প্রাইস এবং কোয়ান্টিটি রিয়েল টাইমে ক্যালকুলেট করা
    const subtotal = watchedItems.reduce((acc, item) => {
        const p = parseFloat(String(item.price)) || 0;
        let q = parseInt(String(item.quantity)) || 0;
        
        // নেগেটিভ কোয়ান্টিটি আটকানোর জন্য লজিক
        if (q < 0) q = 0; 
        
        return acc + (p * q);
    }, 0)
    
    const tax = subtotal * DEFAULT_TAX_RATE
    const discount = parseFloat(String(totalDiscount)) || 0
    const grandTotal = Math.max(0, subtotal + tax - discount)

    // ফর্মের ভ্যালুগুলো আপডেট করা যা হেডার এবং ফুটারে রিফ্লেক্ট করবে
    setValue("subtotal", subtotal, { shouldValidate: true })
    setValue("totalTax", tax, { shouldValidate: true })
    setValue("grandTotal", grandTotal, { shouldValidate: true })
    
  }, [watchedItems, totalDiscount, setValue])

  // ৩. সেভ/আপডেট লজিক
  const onSubmit = (data: QuotationFormValues) => {
    const callbacks = {
        onSuccess: () => {
          toast.success(`Quotation ${initialData ? "updated" : "created"} successfully`)
          onSuccess()
        },
        onError: (err: any) => toast.error(err?.message || "Operation failed")
    }

    if (initialData?.id) {
        updateQuote({ id: initialData.id, data }, callbacks)
    } else {
        createQuote(data, callbacks)
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full bg-white relative">
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Header: Customer & Total */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2 space-y-4">
                <CustomerSelectField name="customerId" control={control} label="Customer" readOnly={isViewMode} required />
                <div className="grid grid-cols-2 gap-4">
                  <DatePickerField name="validUntil" control={control} label="Valid Until" readOnly={isViewMode} />
                  <TextField name="totalDiscount" control={control} label="Global Discount (€)" type="number" disabled={isViewMode} />
                </div>
              </div>
              
              {/* Dynamic Header Total: watch("grandTotal") এর মাধ্যমে আপডেট হবে */}
              <div className="bg-slate-50 p-7 rounded-3xl border border-slate-100 flex flex-col items-center justify-center shadow-inner transition-all duration-300">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimate Total</span>
                <h2 className="text-4xl font-black text-blue-600 tracking-tighter transition-all">
                    €{Number(watch("grandTotal")).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
              </div>
            </div>

            {/* Item Search Area */}
            {!isViewMode && (
              <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 flex items-end gap-3 shadow-sm">
                <div className="flex-1">
                  <ItemSelectField name="tempItemId" control={control} label="Search Part or Service" />
                </div>
                <Button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!watch("tempItemId") || isFetchingItem}
                  className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-bold text-xs shadow-lg shadow-blue-200"
                >
                  {isFetchingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  ADD TO QUOTE
                </Button>
              </div>
            )}

            {/* Items List */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 p-3 border-b text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Package className="h-3.5 w-3.5" /> Line Items Breakdown
              </div>
              
              <div className="divide-y divide-slate-100">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-white hover:bg-slate-50/30 transition-all duration-200">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5">
                        <p className="text-xs font-bold text-slate-800 leading-none mb-1">{field.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono tracking-tighter uppercase">{field.productId}</p>
                      </div>
                      <div className="col-span-3">
                        <TextField name={`items.${index}.price`} control={control} label="Price (€)" type="number" disabled={isViewMode} />
                      </div>
                      <div className="col-span-2">
                        {/* Negative input prevention in UI */}
                        <TextField name={`items.${index}.quantity`} control={control} label="Qty" type="number" min="1" disabled={isViewMode} />
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-3 text-right">
                        <div>
                          <span className="text-[9px] font-bold text-slate-300 uppercase block mb-1">Subtotal</span>
                          <span className="text-xs font-black text-slate-800">
                            €{(Number(watch(`items.${index}.price`) || 0) * Number(watch(`items.${index}.quantity`) || 0)).toLocaleString()}
                          </span>
                        </div>
                        {!isViewMode && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg" 
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-300 bg-white">
                    <Receipt className="h-10 w-10 mb-2 opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-widest italic">Scanning items needed...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <TextareaField name="notes" control={control} label="Terms & Conditions" rows={4} readOnly={isViewMode} placeholder="e.g. 1-year warranty on parts..." />
              
              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-3 h-fit">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>€{Number(watch("subtotal")).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Estimated Tax ({(DEFAULT_TAX_RATE * 100)}%)</span>
                  <span>€{Number(watch("totalTax")).toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Grand Total</span>
                  <span className="text-2xl font-black text-blue-600 tracking-tighter">€{Number(watch("grandTotal")).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {!isViewMode && (
            <FormFooter 
                isPending={isCreating || isUpdating} 
                isEditMode={!!initialData}
                onCancel={onSuccess} 
                saveLabel={initialData ? "Update Quotation" : "Save Quotation"}
                className="p-6 bg-white border-t shadow-[0_-10px_40px_rgba(0,0,0,0.02)]" 
            />
          )}
        </form>
      </Form>
    </FormProvider>
  )
}