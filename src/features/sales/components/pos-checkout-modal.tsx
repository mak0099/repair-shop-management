"use client"

import { useState, useEffect } from "react"
import { useForm, FormProvider, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { CreditCard, Banknote, Smartphone, Check, ArrowRight, Calculator, Euro } from "lucide-react"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"

import { usePOS } from "../pos-context"
import { useCreateSale } from "../sales.api"
import { saleSchema, SaleFormValues } from "../sales.schema"
import { PAYMENT_METHODS } from "../sales.constants"
import { InvoiceView } from "./invoice-view"
import { Sale } from "../sales.schema"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"
import { useInvoiceSetup } from "@/features/invoice-setup/invoice-setup.api"

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
  const queryClient = useQueryClient()
  const invoiceSetupQuery = useInvoiceSetup()
  const currency = shopProfile?.currency || "BDT"

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema.extend({
      totalDiscount: z.coerce.number(),
      grandTotal: z.coerce.number(),
      amountReceived: z.coerce.number(),
      customerId: z.string().min(1, "Customer is required"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any,
    defaultValues: {
      customerId: selectedCustomerId || "",
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

  const { control, setValue, handleSubmit, reset } = form
  const amountReceived = Number(useWatch({ control, name: "amountReceived" }) || 0)
  const grandTotal = Number(useWatch({ control, name: "grandTotal" }) || 0)
  const paymentMethod = useWatch({ control, name: "paymentMethod" })
  const changeAmount = Math.max(0, amountReceived - grandTotal)
  const dueAmount = Math.max(0, grandTotal - amountReceived)
  const baseTotal = totals.subtotal + totals.tax

  // Sync form values when modal opens or totals change
  useEffect(() => {
    if (!open || completedSale) return
    
    const roundedTotal = Number(totals.grandTotal.toFixed(2))
    setValue("subtotal", totals.subtotal)
    setValue("totalTax", totals.tax)
    setValue("totalDiscount", totals.discount)
    setValue("grandTotal", roundedTotal)
    setValue("items", cart)
    setValue("customerId", selectedCustomerId || "")
    // Reset amount received to grand total
    setValue("amountReceived", roundedTotal)
  }, [open, totals.grandTotal, totals.tax, totals.discount, totals.subtotal, cart, selectedCustomerId, setValue, completedSale])

  const onConfirm = (data: SaleFormValues) => {
    const paymentStatus = data.amountReceived >= data.grandTotal ? "PAID" : (data.amountReceived > 0 ? "PARTIAL" : "UNPAID")
    
    createSale({
      ...data,
      customerId: selectedCustomerId,
      items: cart,
      changeAmount,
      paymentStatus
    }, {
      onSuccess: (response) => {
        toast.success("Sale Recorded Successfully")
        reset()
        
        // Ensure invoice-setup and shop-profile data are fetched before showing invoice
        Promise.all([
          queryClient.ensureQueryData({
            queryKey: ["invoice-setup", "current"],
            queryFn: async () => invoiceSetupQuery.data || (await queryClient.getQueryData(["invoice-setup", "current"])),
          }),
          queryClient.ensureQueryData({
            queryKey: ["shop-profile", "current"],
            queryFn: async () => shopProfile || (await queryClient.getQueryData(["shop-profile", "current"])),
          }),
        ]).finally(() => {
          // Show invoice after ensuring data is cached
          setCompletedSale(response as Sale)
          // Clear cart in next render cycle to avoid infinite loop
          Promise.resolve().then(() => clearCart())
        })
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onErrors = (errors: any) => {
    console.error("Form Validation Errors:", errors)
    const firstErrorKey = Object.keys(errors)[0]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          className="w-full bg-primary hover:bg-primary/90 font-bold h-12 text-base shadow-md shadow-primary/20 transition-all active:scale-[0.98]" 
          disabled={disabled}
        >
          PROCEED TO PAYMENT
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("p-0 gap-0 bg-background transition-all duration-300 flex flex-col", completedSale ? "sm:max-w-[900px] h-[90vh]" : "sm:max-w-[600px]")}>
        {completedSale ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <InvoiceView sale={completedSale} />
            </div>
            <div className="flex-shrink-0 p-4 border-t bg-muted/50 flex justify-end">
              <Button onClick={() => handleOpenChange(false)} className="font-bold">
                Close & Start New Sale
              </Button>
            </div>
          </>
        ) : (
        <>
        <DialogHeader className="p-4 bg-background border-b sticky top-0 z-10">
          <DialogTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-foreground">
            <Calculator className="h-5 w-5 text-primary" />
            Checkout & Payment
          </DialogTitle>
        </DialogHeader>
        
        <FormProvider {...form}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <form onSubmit={handleSubmit(onConfirm as any, onErrors)} className="flex flex-col">
            <div className="p-4 space-y-5 overflow-y-auto max-h-[70vh]">
              
              {/* Total Banner */}
              <div className="flex flex-col items-center justify-center py-4 bg-foreground rounded-xl shadow-lg text-background relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Total Payable Amount</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter"><CurrencyText amount={totals.grandTotal} /></span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Payment Method</Label>
                <FormField
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  control={control as any}
                  name="paymentMethod"
                  render={({ field }) => (
                    <div className="flex gap-2">
                      {PAYMENT_METHODS.map((method) => (
                        <label
                          key={method.value}
                          className={cn(
                            "cursor-pointer relative flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border transition-all duration-200",
                            field.value === method.value
                              ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary"
                              : "border-border bg-card text-card-foreground hover:border-border/80 hover:bg-muted/50"
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
                            <div className="absolute top-1 right-1 h-3 w-3 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-2 w-2 text-primary-foreground" strokeWidth={3} />
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* Discount & Final Price Adjustment */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                 <TextField
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    control={control as any}
                    name="totalDiscount"
                    label="Discount"
                    labelClassName="text-[10px] font-bold text-muted-foreground uppercase"
                    className="space-y-1"
                    type="number"
                    icon={<Euro className="h-4 w-4 text-muted-foreground" />}
                    inputClassName="h-10 bg-background font-bold border-border focus:border-primary focus:ring-primary/20"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                 />
                 <TextField
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    control={control as any}
                    name="grandTotal"
                    label="Total Selling Price"
                    labelClassName="text-[10px] font-bold text-muted-foreground uppercase"
                    className="space-y-1"
                    type="number"
                    icon={<Euro className="h-4 w-4 text-muted-foreground" />}
                    inputClassName="h-10 bg-background font-bold border-border focus:border-primary focus:ring-primary/20"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleTotalChange(e.target.value)}
                 />
              </div>

              {/* Amount & Change Calculation */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                <div className="space-y-2">
                  <TextField
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    control={control as any}
                    name="amountReceived"
                    label="Receive Amount"
                    type="number"
                    icon={<Euro className="h-4 w-4 text-muted-foreground" />}
                    inputClassName="h-10 bg-background font-bold border-border focus:border-primary focus:ring-primary/20"
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
                        className="h-6 text-[10px] font-bold bg-background px-2"
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
                            className="h-6 text-[10px] font-medium bg-background text-foreground px-2"
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
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {dueAmount > 0 ? "Due Amount" : "Change Return"}
                  </Label>
                  <div className={cn(
                    "h-10 flex items-center px-3 rounded-lg border-2 font-mono text-lg font-bold transition-colors",
                    dueAmount > 0 
                      ? "bg-destructive/10 border-destructive/20 text-destructive"
                      : changeAmount > 0 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500" 
                      : "bg-muted border-border text-muted-foreground"
                  )}>
                    <CurrencyText amount={dueAmount > 0 ? dueAmount : changeAmount} />  
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Transaction Notes</Label>
                <FormField
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  control={control as any}
                  name="notes"
                  render={({ field }) => (
                    <Textarea 
                      {...field} 
                      placeholder="Optional notes about this sale..." 
                      className="min-h-[60px] bg-background border-border resize-none text-xs"
                    />
                  )}
                />
              </div>
            </div>

            <div className="p-4 bg-background border-t mt-auto">
              <Button 
                type="submit" 
                className={cn(
                  "w-full h-12 text-base font-black uppercase tracking-widest rounded-xl shadow-xl transition-all",
                  "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-primary/20 hover:-translate-y-0.5"
                )}
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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