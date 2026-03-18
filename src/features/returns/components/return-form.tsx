"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, useFieldArray, FormProvider, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Package, Loader2, RotateCcw, FileText, User, AlertTriangle, X, Search, ArrowRight, Printer } from "lucide-react"
import { toast } from "sonner"

import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { SelectField } from "@/components/forms/select-field"
import { FormFooter } from "@/components/forms/form-footer"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { CustomerSelectField } from "@/features/customers"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import { returnSchema, ReturnFormValues, SaleReturn } from "../returns.schema"
import { useCreateReturn, useUpdateReturn, fetchSaleByInvoice } from "../returns.api"
import { Sale, SaleItem } from "@/features/sales/sales.schema"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"

const CONDITION_OPTIONS = [
  { label: "Resalable (Good)", value: "RESALABLE" },
  { label: "Defective (Damaged)", value: "DEFECTIVE" },
  { label: "Open Box", value: "OPEN_BOX" },
]

const STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Completed (Refunded)", value: "COMPLETED" },
  { label: "Rejected", value: "REJECTED" },
]

export function ReturnForm({ initialData, onSuccess, isViewMode }: { initialData?: SaleReturn | null, onSuccess: (data?: SaleReturn) => void, isViewMode?: boolean }) {
  const { mutate: createReturn, isPending: isCreating } = useCreateReturn()
  const { mutate: updateReturn, isPending: isUpdating } = useUpdateReturn()
  const [isSearching, setIsSearching] = useState(false)
  const [originalSale, setOriginalSale] = useState<Sale | null>(null)
  const [invoiceSearch, setInvoiceSearch] = useState("")
  const { data: shopProfile } = useShopProfile()
  const currency = shopProfile?.currency || "BDT"

  const form = useForm<ReturnFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(returnSchema) as any,
    defaultValues: initialData || {
      returnDate: new Date(),
      items: [],
      subtotal: 0,
      restockingFee: 0,
      totalRefundAmount: 0,
      status: "PENDING",
      notes: "",
      saleId: "" // Optional link to original sale
    }
  })

  const { control, watch, setValue, getValues, handleSubmit } = form
  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  // 1. Invoice Search Logic
  const handleSearchInvoice = async () => {
    if (!invoiceSearch) return
    try {
      setIsSearching(true)
      const sale = await fetchSaleByInvoice(invoiceSearch)
      
      if (sale) {
        setOriginalSale(sale)
        setValue("customerId", sale.customerId || "")
        setValue("saleId", sale.invoiceNumber) // Using invoice number as ID reference
        toast.success("Invoice found")
      } else {
        toast.error("Invoice not found")
        setOriginalSale(null)
      }
    } catch {
      toast.error("Error searching invoice")
    } finally {
      setIsSearching(false)
    }
  }

  // 2. Add Item from Invoice Logic
  const handleAddFromInvoice = (item: SaleItem) => {
    const currentItems = getValues("items")
    if (currentItems.some(i => i.productId === item.productId)) {
      return toast.error("Item already added to return list")
    }

    append({
      productId: item.productId,
      name: item.name,
      quantity: 1,
      price: item.price,
      subtotal: item.price,
      condition: "RESALABLE",
      soldQuantity: item.quantity // Store original qty for validation
    })
  }

  // 3. Real-time Calculations & Validation
  const watchedItemsValue = useWatch({ control, name: "items" })
  const watchedItems = useMemo(() => watchedItemsValue || [], [watchedItemsValue])
  const restockingFee = useWatch({ control, name: "restockingFee" }) || 0

  useEffect(() => {
    const subtotal = watchedItems.reduce((acc, item, index) => {
        const p = parseFloat(String(item.price)) || 0
        let q = parseInt(String(item.quantity)) || 0
        
        // Validate against sold quantity
        if (item.soldQuantity && q > item.soldQuantity) {
            q = item.soldQuantity
            // We need to defer this update to avoid render loop, or handle in UI
            // For now, calculation uses capped value
        }
        if (q < 0) q = 0
        
        const itemSubtotal = p * q

        // Update item subtotal if changed
        if (item.subtotal !== itemSubtotal) {
          setValue(`items.${index}.subtotal`, itemSubtotal, { shouldValidate: false })
        }
        
        return acc + itemSubtotal
    }, 0)
    
    const fee = parseFloat(String(restockingFee)) || 0
    const totalRefund = Math.max(0, subtotal - fee)

    setValue("subtotal", subtotal, { shouldValidate: false })
    setValue("totalRefundAmount", totalRefund, { shouldValidate: false })
    
  }, [watchedItemsValue, restockingFee, setValue, watchedItems])

  // 4. Submit Logic
  const onSubmit = (data: ReturnFormValues) => {
    const callbacks = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSuccess: (response: any) => {
          toast.success(`Return ${initialData ? "updated" : "processed"} successfully`)
          onSuccess(response)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => toast.error(err?.message || "Operation failed")
    }

    if (initialData?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateReturn({ id: initialData.id, data: data as any }, callbacks)
    } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createReturn(data as any, callbacks)
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="flex flex-col h-full bg-background relative">
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Header: Customer & Refund Total */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 bg-muted/50 p-5 rounded-2xl border border-border space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <User className="h-4 w-4" />
                    <div className="flex-1 flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase tracking-widest">Customer & Sale Info</h3>
                        {isViewMode && (
                            <Button type="button" variant="outline" size="sm" onClick={() => window.print()} className="h-7 text-[10px] gap-2 hidden md:flex">
                                <Printer className="h-3 w-3" /> Print Receipt
                            </Button>
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Invoice Search / Display */}
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Original Invoice #</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    value={invoiceSearch}
                                    onChange={(e) => setInvoiceSearch(e.target.value)}
                                    placeholder="Search Invoice..."
                                    className="pl-9 bg-background"
                                    readOnly={isViewMode || !!initialData}
                                />
                            </div>
                            {!isViewMode && !initialData && (
                                <Button type="button" onClick={handleSearchInvoice} disabled={isSearching || !invoiceSearch}>
                                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <CustomerSelectField name="customerId" control={control as any} label="Customer" readOnly={true} /> 
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <DatePickerField name="returnDate" control={control as any} label="Return Date" readOnly={isViewMode} />

                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextField name="saleId" control={control as any} label="Linked Invoice (Ref)" readOnly={true} disabled />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <SelectField name="status" control={control as any} label="Return Status" options={STATUS_OPTIONS} readOnly={isViewMode} placeholder="Select Status" />
                </div>
              </div>
              
              {/* Dynamic Refund Total Card */}
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center h-full min-h-[120px]">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-1">
                    <RotateCcw className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Total Refund</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter text-foreground transition-all">
                    {currency} {Number(watch("totalRefundAmount")).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
                {Number(restockingFee) > 0 && (
                    <span className="text-[10px] text-muted-foreground font-medium mt-1">
                        After {currency} {Number(restockingFee).toLocaleString()} fee
                    </span>
                )}
              </div>
            </div>

            {/* Original Sale Items Selection */}
            {!isViewMode && originalSale && (
              <div className="bg-primary/10 border border-primary/20 rounded-2xl overflow-hidden">
                <div className="bg-primary/20 p-3 border-b border-primary/20 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-primary">
                        <Package className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Available Items from Invoice #{originalSale.invoiceNumber}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary">{new Date(originalSale.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="p-2">
                    <table className="w-full text-left text-xs">
                        <thead className="text-primary/80 font-bold uppercase">
                            <tr>
                                <th className="px-3 py-2">Item</th>
                                <th className="px-3 py-2 text-center">Sold Qty</th>
                                <th className="px-3 py-2 text-right">Sold Price</th>
                                <th className="px-3 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/20">
                            {originalSale.items.map((item) => (
                                <tr key={item.productId} className="hover:bg-primary/5">
                                    <td className="px-3 py-2 font-medium text-foreground">{item.name}</td>
                                    <td className="px-3 py-2 text-center text-muted-foreground">{item.quantity}</td>
                                    <td className="px-3 py-2 text-right text-muted-foreground">{currency} {item.price.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-right">
                                        <Button 
                                            type="button" 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-6 text-[10px] bg-background border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                                            onClick={() => handleAddFromInvoice(item)}
                                        >
                                            Return <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
            )}

            {/* Items List */}
            {fields.length > 0 && (
            <div className="border border-border rounded-2xl overflow-hidden shadow-sm bg-card">
              <div className="bg-muted/80 p-3 border-b text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                    <RotateCcw className="h-3.5 w-3.5" /> Items to Return
                </div>
                <Badge variant="secondary" className="text-[9px]">{fields.length} Items</Badge>
              </div>
              
              <div className="pb-5">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-card text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-4 py-3 w-[30%] text-xs font-bold uppercase">Item Details</th>
                                <th className="px-4 py-3 w-[20%] text-xs font-bold uppercase">Condition</th>
                                <th className="px-4 py-3 w-[15%] text-right text-xs font-bold uppercase">Refund Price</th>
                                <th className="px-4 py-3 w-[10%] text-center text-xs font-bold uppercase">Qty</th>
                                <th className="px-4 py-3 w-[20%] text-right text-xs font-bold uppercase">Total</th>
                                {!isViewMode && <th className="px-4 py-3 w-[5%]"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {fields.map((field, index) => (
                                <tr key={field.id} className="hover:bg-muted/50 transition-colors group">
                                    <td className="px-4 py-3 align-top">
                                        <p className="font-bold text-foreground text-xs">{field.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{field.productId}</p>
                                    </td>
                                    <td className="px-2 py-1 align-top">
                                        <SelectField 
                                            name={`items.${index}.condition`} 
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            control={control as any}
                                            label="Condition"
                                            options={CONDITION_OPTIONS}
                                            placeholder="Condition"
                                            readOnly={isViewMode}
                                            className="h-8 text-xs"
                                        />
                                    </td>
                                    <td className="px-4 py-1 align-top">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        <TextField name={`items.${index}.price`} control={control as any} type="number" disabled={isViewMode} className="text-right h-8 text-xs" />
                                    </td>
                                    <td className="px-2 py-1 align-top">
                                        <TextField 
                                            name={`items.${index}.quantity`} 
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            control={control as any}
                                            type="number" 
                                            min="1" 
                                            max={watchedItems[index]?.soldQuantity}
                                            disabled={isViewMode} 
                                            className="text-center h-8 text-xs" 
                                        />
                                        {watchedItems[index]?.soldQuantity && (
                                            <p className="text-[9px] text-center text-muted-foreground mt-3">Max: {watchedItems[index].soldQuantity}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-1 align-top text-right">
                                        <span className="text-xs font-black text-foreground block py-2">
                                            {currency} {(Number(watchedItems[index]?.price || 0) * Number(watchedItems[index]?.quantity || 0)).toLocaleString()}
                                        </span>
                                    </td>
                                    {!isViewMode && (
                                        <td className="px-4 py-1 align-top text-right">
                                            <button type="button" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive transition-colors p-1.5">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
              </div>
            </div>
            )}

            {/* Summary Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Reason & Notes</h3>
                 </div>
                 {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                 <TextareaField name="notes" control={control as any} label="Notes" rows={3} readOnly={isViewMode} placeholder="Reason for return..." className="bg-muted/50 border-border" />
                 
                 <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex gap-3 items-start">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <div className="text-[10px] text-amber-800 dark:text-amber-300">
                        <p className="font-bold">Stock Adjustment</p>
                        <p>Items marked as <strong>Resalable</strong> or <strong>Open Box</strong> will be automatically added back to inventory upon completion.</p>
                    </div>
                 </div>
              </div>
              
              <div className="bg-card p-6 rounded-2xl border border-border space-y-4 h-fit shadow-sm">
                <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span>Subtotal Refund</span>
                  <span>{currency} {Number(watch("subtotal")).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span>Restocking Fee</span>
                  <div className="w-24">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextField name="restockingFee" control={control as any} type="number" disabled={isViewMode} className="h-7 text-right text-xs text-destructive" placeholder="0.00" />
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground text-right italic">Fee for repackaging/damage</p>
                <div className="pt-4 border-t border-dashed border-border flex justify-between items-center">
                  <span className="text-xs font-black text-foreground uppercase tracking-widest">Total Refund</span>
                  <span className="text-2xl font-black text-foreground tracking-tighter">{currency} {Number(watch("totalRefundAmount")).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {!isViewMode && (
            <FormFooter 
                isPending={isCreating || isUpdating} 
                isEditMode={!!initialData}
                onCancel={() => onSuccess()} 
                saveLabel={initialData ? "Update Return" : "Process Return"}
            />
          )}
        </form>
      </Form>
    </FormProvider>
  )
}
