"use client"

import { useForm, FormProvider, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { CreditCard, Banknote, Smartphone, Check, Euro, Calculator } from "lucide-react"
import { z } from "zod"

import { useCreateSale } from "../sales.api"
import { saleSchema, SaleFormValues } from "../sales.schema"
import { PAYMENT_METHODS } from "../sales.constants"
import { Sale } from "../sales.schema"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { FormField } from "@/components/ui/form"
import { CurrencyText } from "@/components/shared/data-table-cells"
import { TextField } from "@/components/forms/text-field"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { POSCartItem } from "../pos-context"

interface POSCheckoutFormProps {
  customerId: string | null
  customerName: string | null
  cart: POSCartItem[]
  totals: {
    subtotal: number
    tax: number
    discount: number
    grandTotal: number
  }
  onSuccess?: (sale: Sale) => void
  onClose?: () => void
  onClearCart?: () => void
}

export function POSCheckoutForm({ 
  customerId,
  customerName,
  cart,
  totals,
  onSuccess, 
  onClose,
  onClearCart
}: POSCheckoutFormProps) {
  const { mutate: createSale, isPending } = useCreateSale()

  // Create form with fresh defaultValues from context
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema.extend({
      totalDiscount: z.coerce.number(),
      grandTotal: z.coerce.number(),
      amountReceived: z.coerce.number(),
      customerId: z.string().min(1, "Customer is required"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any,
    defaultValues: {
      customerId: customerId || "",
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

  const { control, setValue, handleSubmit } = form
  const amountReceived = Number(useWatch({ control, name: "amountReceived" }) || 0)
  const grandTotal = Number(useWatch({ control, name: "grandTotal" }) || 0)
  const paymentMethod = useWatch({ control, name: "paymentMethod" })

  const changeAmount = Math.max(0, amountReceived - grandTotal)
  const dueAmount = Math.max(0, grandTotal - amountReceived)

  const onConfirm = (data: SaleFormValues) => {
    console.log("[CHECKOUT] Form submitted with data:", {
      customerId: data.customerId,
      cartItems: cart.length,
      itemsWithoutIMEI: cart.filter(i => i.isSerialized && !i.selectedIMEI).map(i => i.name),
      amountReceived: data.amountReceived,
      grandTotal: data.grandTotal
    })

    // itemType-specific validation
    const hasInvalidSerializedItems = cart.some((item) => {
      const isDeviceOrLoaner = item.type === "PRODUCT" && item.isSerialized
      const hasIMEI = item.selectedIMEI && item.selectedIMEI.trim().length > 0
      
      if (isDeviceOrLoaner && !hasIMEI) {
        return true
      }
      return false
    })

    if (hasInvalidSerializedItems) {
      console.error("[CHECKOUT] Validation failed: Missing IMEI for serialized items")
      toast.error("All device items must have an IMEI/Serial number selected")
      return
    }

    const paymentStatus = data.amountReceived >= data.grandTotal ? "PAID" : (data.amountReceived > 0 ? "PARTIAL" : "UNPAID")
    
    console.log("[CHECKOUT] Creating sale with status:", paymentStatus)
    
    createSale({
      ...data,
      customerId: customerId,
      customerName: customerName || undefined,
      items: cart,
      changeAmount,
      paymentStatus
    }, {
      onSuccess: (response) => {
        console.log("[CHECKOUT] Sale created successfully:", response.id)
        toast.success("Sale Recorded Successfully")
        onClearCart?.()
        onSuccess?.(response as Sale)
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onErrors = (errors: any) => {
    console.error("[CHECKOUT] Validation errors:", errors)
    const errorDetails = Object.entries(errors).map(([key, val]: any) => ({
      field: key,
      message: val?.message || "Invalid"
    }))
    console.table(errorDetails)
    
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

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "CASH": return <Banknote className="h-5 w-5" />
      case "CARD": return <CreditCard className="h-5 w-5" />
      case "MOBILE_PAYMENT": return <Smartphone className="h-5 w-5" />
      default: return <CreditCard className="h-5 w-5" />
    }
  }

  return (
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
                  "h-10 rounded-lg border border-border/50 flex items-center justify-center font-bold text-sm transition-colors",
                  dueAmount > 0 ? "bg-red-500/10 text-red-600 border-red-200/50" : "bg-green-500/10 text-green-600 border-green-200/50"
                )}>
                  <CurrencyText amount={Math.abs(dueAmount)} />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Notes</Label>
              <FormField
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={control as any}
                name="notes"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Add any notes..."
                    className="min-h-12 text-sm bg-background border-border focus:border-primary focus:ring-primary/20 resize-none"
                  />
                )}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t bg-muted/50 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-primary hover:bg-primary/90 font-bold"
            >
              {isPending ? "Processing..." : "Complete Sale"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </>
  )
}
