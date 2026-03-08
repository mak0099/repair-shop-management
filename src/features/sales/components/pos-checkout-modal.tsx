"use client"

import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { CreditCard, Banknote, Smartphone, Check, ArrowRight, Calculator, Coins, Euro } from "lucide-react"
import { z } from "zod"

import { usePOS } from "../pos-context"
import { useCreateSale } from "../sales.api"
import { saleSchema, SaleFormValues } from "../sales.schema"
import { PAYMENT_METHODS } from "../sales.constants"
import { InvoiceView } from "./invoice-view"
import { Sale } from "../sales.schema"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { FormField } from "@/components/ui/form"
import { CurrencyText } from "@/components/shared/data-table-cells"
import { TextField } from "@/components/forms/text-field"

export function POSCheckoutModal({ disabled }: { disabled: boolean }) {
  const { totals, cart, selectedCustomerId, clearCart } = usePOS()
  const { mutate: createSale, isPending } = useCreateSale()
  const [open, setOpen] = useState(false)
  const [completedSale, setCompletedSale] = useState<Sale | null>(null)
  const { data: shopProfile } = useShopProfile()
  const currency = shopProfile?.currency || "BDT"

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema.extend({
      totalDiscount: z.coerce.number(),
      grandTotal: z.coerce.number(),
      amountReceived: z.coerce.number(),
      customerId: z.string().min(1, "Customer is required"),
    })),
    defaultValues: {
      customerId: selectedCustomerId,
      items: cart,
      subtotal: totals.subtotal,
      totalTax: totals.tax,
      totalDiscount: totals.discount,
      grandTotal: totals.grandTotal,
      paymentMethod: "CASH",
      amountReceived: totals.grandTotal,
      changeAmount: 0,
      notes: ""
    }
  })

  const { control, watch, setValue, handleSubmit, reset } = form
  const amountReceived = Number(watch("amountReceived") || 0)
  const grandTotal = Number(watch("grandTotal") || 0)
  const paymentMethod = watch("paymentMethod")
  const changeAmount = Math.max(0, amountReceived - grandTotal)
  const dueAmount = Math.max(0, grandTotal - amountReceived)
  const baseTotal = totals.subtotal + totals.tax

  // Sync form values when modal opens or totals change
  useEffect(() => {
    if (open) {
      const roundedTotal = Number(totals.grandTotal.toFixed(2))
      setValue("subtotal", totals.subtotal)
      setValue("totalTax", totals.tax)
      setValue("totalDiscount", totals.discount)
      setValue("grandTotal", roundedTotal)
      setValue("items", cart)
      setValue("customerId", selectedCustomerId)
      // Reset amount received to grand total
      setValue("amountReceived", roundedTotal)
    }
  }, [open, totals, cart, selectedCustomerId, setValue])

  const onConfirm = (data: SaleFormValues) => {
    const paymentStatus = data.amountReceived >= data.grandTotal ? "PAID" : (data.amountReceived > 0 ? "PARTIAL" : "UNPAID")
    
    createSale({
      ...data,
      customerId: selectedCustomerId,
      items: cart,
      changeAmount,
      paymentStatus
    }, {
      onSuccess: (data) => {
        toast.success("Sale Recorded Successfully")
        clearCart()
        reset()
        setCompletedSale(data as Sale)
      }
    })
  }

  const onErrors = (errors: any) => {
    console.error("Form Validation Errors:", errors)
    const firstErrorKey = Object.keys(errors)[0]
    const firstError = errors[firstErrorKey] as any

    if (firstError?.message) {
      toast.error(`${firstErrorKey === 'customerId' ? 'Customer' : firstErrorKey}: ${firstError.message}`)
    } else if (Array.isArray(firstError)) {
      toast.error("Please check item details in the cart")
    } else {
      toast.error("Please check all required fields")
    }
  }

  const handleQuickAmount = (amount: number) => {
    setValue("amountReceived", amount)
  }

  const handleDiscountChange = (val: string) => {
    const newDiscount = parseFloat(val) || 0
    const newTotal = Math.max(0, baseTotal - newDiscount)
    setValue("grandTotal", Number(newTotal.toFixed(2)))
    // Update receive amount to match new total
    setValue("amountReceived", Number(newTotal.toFixed(2)))
  }

  const handleTotalChange = (val: string) => {
    const newTotal = parseFloat(val) || 0
    const newDiscount = Math.max(0, baseTotal - newTotal)
    setValue("totalDiscount", Number(newDiscount.toFixed(2)))
    // Update receive amount to match new total
    setValue("amountReceived", newTotal)
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "CASH": return <Banknote className="h-5 w-5" />
      case "CARD": return <CreditCard className="h-5 w-5" />
      case "MOBILE_PAYMENT": return <Smartphone className="h-5 w-5" />
      default: return <CreditCard className="h-5 w-5" />
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setTimeout(() => setCompletedSale(null), 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 font-bold h-12 text-base shadow-md shadow-blue-200 transition-all active:scale-[0.98]" 
          disabled={disabled}
        >
          PROCEED TO PAYMENT
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("p-0 gap-0 overflow-hidden bg-white transition-all duration-300", completedSale ? "sm:max-w-[900px] h-[90vh]" : "sm:max-w-[600px]")}>
        {completedSale ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
              <InvoiceView sale={completedSale} />
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <Button onClick={() => handleOpenChange(false)} className="bg-slate-900 text-white hover:bg-slate-800 font-bold">
                Close & Start New Sale
              </Button>
            </div>
          </div>
        ) : (
        <>
        <DialogHeader className="p-4 bg-white border-b sticky top-0 z-10">
          <DialogTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-slate-800">
            <Calculator className="h-5 w-5 text-blue-600" />
            Checkout & Payment
          </DialogTitle>
        </DialogHeader>
        
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onConfirm, onErrors)} className="flex flex-col">
            <div className="p-4 space-y-5 overflow-y-auto max-h-[70vh]">
              
              {/* Total Banner */}
              <div className="flex flex-col items-center justify-center py-4 bg-slate-900 rounded-xl shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Total Payable Amount</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter"><CurrencyText amount={totals.grandTotal} /></span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Method</Label>
                <FormField
                  control={control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <div className="flex gap-2">
                      {PAYMENT_METHODS.map((method) => (
                        <label
                          key={method.value}
                          className={cn(
                            "cursor-pointer relative flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border transition-all duration-200",
                            field.value === method.value
                              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-600"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            {...field}
                            value={method.value}
                            checked={field.value === method.value}
                            onChange={() => field.onChange(method.value)}
                          />
                          {getPaymentIcon(method.value)}
                          <span className="text-[10px] font-bold uppercase tracking-wide">{method.label}</span>
                          {field.value === method.value && (
                            <div className="absolute top-1 right-1 h-3 w-3 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="h-2 w-2 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* Discount & Final Price Adjustment */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                 <TextField
                    control={control}
                    name="totalDiscount"
                    label="Discount"
                    labelClassName="text-[10px] font-bold text-slate-500 uppercase"
                    className="space-y-1"
                    type="number"
                    icon={<Euro className="h-4 w-4 text-slate-400" />}
                    inputClassName="h-10 bg-white font-bold border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                 />
                 <TextField
                    control={control}
                    name="grandTotal"
                    label="Total Selling Price"
                    labelClassName="text-[10px] font-bold text-slate-500 uppercase"
                    className="space-y-1"
                    type="number"
                    icon={<Euro className="h-4 w-4 text-slate-400" />}
                    inputClassName="h-10 bg-white font-bold border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleTotalChange(e.target.value)}
                 />
              </div>

              {/* Amount & Change Calculation */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="space-y-2">
                  <TextField
                    control={control}
                    name="amountReceived"
                    label="Receive Amount"
                    type="number"
                    icon={<Euro className="h-4 w-4 text-slate-400" />}
                    inputClassName="h-10 bg-white font-bold border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder="0.00"
                    onFocus={(e) => e.target.select()}
                  />
                  
                  {/* Quick Cash Suggestions */}
                  {paymentMethod === "CASH" && (
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="h-6 text-[10px] font-bold bg-white px-2"
                        onClick={() => handleQuickAmount(grandTotal)}
                      >
                        Exact
                      </Button>
                      {[5, 10, 20, 50, 100, 200, 500].map(amt => (
                        amt > grandTotal && (
                          <Button 
                            key={amt}
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-[10px] font-medium bg-white text-slate-600 px-2"
                            onClick={() => handleQuickAmount(amt)}
                          >
                            <CurrencyText amount={amt} minimumFractionDigits={0} maximumFractionDigits={0} />
                          </Button>
                        )
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {dueAmount > 0 ? "Due Amount" : "Change Return"}
                  </Label>
                  <div className={cn(
                    "h-10 flex items-center px-3 rounded-lg border-2 font-mono text-lg font-bold transition-colors",
                    dueAmount > 0 
                      ? "bg-red-50 border-red-100 text-red-600"
                      : changeAmount > 0 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                      : "bg-slate-100 border-slate-200 text-slate-400"
                  )}>
                    <CurrencyText amount={dueAmount > 0 ? dueAmount : changeAmount} />  
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transaction Notes</Label>
                <FormField
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <Textarea 
                      {...field} 
                      placeholder="Optional notes about this sale..." 
                      className="min-h-[60px] bg-white border-slate-200 resize-none text-xs"
                    />
                  )}
                />
              </div>
            </div>

            <div className="p-4 bg-white border-t mt-auto">
              <Button 
                type="submit" 
                className={cn(
                  "w-full h-12 text-base font-black uppercase tracking-widest rounded-xl shadow-xl transition-all",
                  "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-200 hover:-translate-y-0.5"
                )}
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  dueAmount > 0 ? `Confirm with Due (${currency} ${dueAmount.toFixed(2)})` : "Complete Sale"
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
        </>
        )}
      </DialogContent>
    </Dialog>
  )
}