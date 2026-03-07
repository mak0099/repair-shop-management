"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray, FormProvider, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, Package, Loader2, Calculator, Receipt, FileText, User, Calendar, X } from "lucide-react"
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
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"
import { cn } from "@/lib/utils"

export function QuotationForm({ initialData, onSuccess, isViewMode }: { initialData?: Quotation | null, onSuccess: (data?: Quotation) => void, isViewMode?: boolean }) {
  const { mutate: createQuote, isPending: isCreating } = useCreateQuotation()
  const { mutate: updateQuote, isPending: isUpdating } = useUpdateQuotation()
  const [isFetchingItem, setIsFetchingItem] = useState(false)
  const { data: shopProfile } = useShopProfile()
  const currency = shopProfile?.currency || "BDT"
  const taxRate = shopProfile?.taxRate !== undefined ? shopProfile.taxRate / 100 : DEFAULT_TAX_RATE

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
      // toast.success(`${details.name} added`)
    } catch (error) {
      toast.error("Failed to fetch item details")
    } finally {
      setIsFetchingItem(false)
    }
  }

  // ২. ক্যালকুলেশন ফিক্স: watchedItems এর ওপর ডিপেন্ড করে রিয়েল টাইম আপডেট
  const watchedItems = useWatch({ control, name: "items" }) || []
  const totalDiscount = useWatch({ control, name: "totalDiscount" }) || 0

  useEffect(() => {
    // প্রতিটি আইটেমের প্রাইস এবং কোয়ান্টিটি রিয়েল টাইমে ক্যালকুলেট করা
    const subtotal = watchedItems.reduce((acc, item, index) => {
        const p = parseFloat(String(item.price)) || 0;
        let q = parseInt(String(item.quantity)) || 0;
        
        // নেগেটিভ কোয়ান্টিটি আটকানোর জন্য লজিক
        if (q < 0) q = 0; 
        
        const itemSubtotal = p * q;

        // প্রতিটি আইটেমের সাবটোটাল আপডেট করা
        if (item.subtotal !== itemSubtotal) {
          setValue(`items.${index}.subtotal`, itemSubtotal, { shouldValidate: false });
        }
        
        return acc + itemSubtotal;
    }, 0)
    
    const tax = subtotal * taxRate
    const discount = parseFloat(String(totalDiscount)) || 0
    const grandTotal = Math.max(0, subtotal + tax - discount)

    // ফর্মের ভ্যালুগুলো আপডেট করা যা হেডার এবং ফুটারে রিফ্লেক্ট করবে
    setValue("subtotal", subtotal, { shouldValidate: false })
    setValue("totalTax", tax, { shouldValidate: false })
    setValue("grandTotal", grandTotal, { shouldValidate: false })
    
  }, [watchedItems, totalDiscount, setValue, taxRate])

  // ৩. সেভ/আপডেট লজিক
  const onSubmit = (data: QuotationFormValues) => {
    const callbacks = {
        onSuccess: (response: any) => {
          toast.success(`Quotation ${initialData ? "updated" : "created"} successfully`)
          onSuccess(response)
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <User className="h-4 w-4" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Customer Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomerSelectField name="customerId" control={control} label="Select Customer" readOnly={isViewMode} required />
                    <DatePickerField name="validUntil" control={control} label="Valid Until" readOnly={isViewMode} />
                </div>
              </div>
              
              {/* Dynamic Header Total: watch("grandTotal") এর মাধ্যমে আপডেট হবে */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center h-full min-h-[120px]">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calculator className="h-4 w-4 text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Estimated Total</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter text-slate-800 transition-all">
                    {currency} {Number(watch("grandTotal")).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
              </div>
            </div>

            {/* Item Search Area */}
            {!isViewMode && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-end gap-3 shadow-sm">
                <div className="flex-1">
                  <ItemSelectField name="tempItemId" control={control} label="Search Part or Service" />
                </div>
                <Button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!watch("tempItemId") || isFetchingItem}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 font-bold text-xs shadow-sm transition-all"
                >
                  {isFetchingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  ADD TO QUOTE
                </Button>
              </div>
            )}

            {/* Items List */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <div className="bg-slate-50/80 p-3 border-b text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Package className="h-3.5 w-3.5" /> Line Items Breakdown
              </div>
              
              <div className="pb-5">
                {fields.length > 0 ? (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 w-[40%] text-xs font-bold uppercase">Item Details</th>
                                <th className="px-4 py-3 w-[20%] text-right text-xs font-bold uppercase">Unit Price</th>
                                <th className="px-4 py-3 w-[15%] text-center text-xs font-bold uppercase">Qty</th>
                                <th className="px-4 py-3 w-[20%] text-right text-xs font-bold uppercase">Total</th>
                                {!isViewMode && <th className="px-4 py-3 w-[5%]"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {fields.map((field, index) => (
                                <tr key={field.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-4 py-3 align-top">
                                        <p className="font-bold text-slate-700 text-xs">{field.name}</p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{field.productId}</p>
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        <TextField name={`items.${index}.price`} control={control} type="number" disabled={isViewMode} className="text-right h-8 text-xs" />
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        <TextField name={`items.${index}.quantity`} control={control} type="number" min="1" disabled={isViewMode} className="text-center h-8 text-xs" />
                                    </td>
                                    <td className="px-4 py-3 align-top text-right">
                                        <span className="text-xs font-black text-slate-700 block py-2">
                                            {currency} {(Number(watchedItems[index]?.price || 0) * Number(watchedItems[index]?.quantity || 0)).toLocaleString()}
                                        </span>
                                    </td>
                                    {!isViewMode && (
                                        <td className="px-4 py-3 align-top text-right">
                                            <button type="button" onClick={() => remove(index)} className="text-slate-300 hover:text-red-500 transition-colors p-1.5">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (

                  <div className="py-5 flex flex-col items-center justify-center text-slate-300 bg-white">
                    <Receipt className="h-10 w-10 mb-2 opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-widest italic">Scanning items needed...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-slate-500">
                    <FileText className="h-4 w-4" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Notes & Terms</h3>
                 </div>
                 <TextareaField name="notes" control={control} rows={4} readOnly={isViewMode} placeholder="e.g. 1-year warranty on parts..." className="bg-slate-50 border-slate-200" />
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 h-fit shadow-sm">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>{currency} {Number(watch("subtotal")).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Discount</span>
                  <div className="w-24">
                    <TextField name="totalDiscount" control={control} type="number" disabled={isViewMode} className="h-7 text-right text-xs" placeholder="0.00" />
                  </div>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Estimated Tax ({(taxRate * 100)}%)</span>
                  <span>{currency} {Number(watch("totalTax")).toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Grand Total</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">{currency} {Number(watch("grandTotal")).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {!isViewMode && (
            <FormFooter 
                isPending={isCreating || isUpdating} 
                isEditMode={!!initialData}
                onCancel={() => onSuccess()} 
                saveLabel={initialData ? "Update Quotation" : "Save Quotation"}
                className="p-6 bg-white border-t shadow-[0_-10px_40px_rgba(0,0,0,0.02)]" 
            />
          )}
        </form>
      </Form>
    </FormProvider>
  )
}