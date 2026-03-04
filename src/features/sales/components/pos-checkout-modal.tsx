"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { usePOS } from "../pos-context"
import { useCreateSale } from "../sales.api"
import { saleSchema, SaleFormValues } from "../sales.schema"
import { PAYMENT_METHODS } from "../sales.constants"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { RadioGroupField } from "@/components/forms/radio-group-field"
import { Form } from "@/components/ui/form"

export function POSCheckoutModal({ disabled }: { disabled: boolean }) {
  const { totals, cart, selectedCustomerId, clearCart } = usePOS()
  const { mutate: createSale, isPending } = useCreateSale()
  const [open, setOpen] = useState(false)

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
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

  const { control, watch, setValue, handleSubmit } = form
  const amountReceived = watch("amountReceived") || 0
  const changeAmount = Math.max(0, amountReceived - totals.grandTotal)

  const onConfirm = (data: SaleFormValues) => {
    createSale({
      ...data,
      customerId: selectedCustomerId,
      items: cart, // Always sync current cart
      changeAmount
    }, {
      onSuccess: () => {
        toast.success("Sale Recorded Successfully")
        clearCart()
        setOpen(false)
        form.reset()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold h-11" disabled={disabled}>
          PROCEED TO CHECKOUT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-slate-50 border-b">
          <DialogTitle className="text-sm font-black uppercase tracking-widest text-slate-600">Complete Payment</DialogTitle>
        </DialogHeader>
        
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={handleSubmit(onConfirm)} className="p-6 space-y-6">
              {/* Grand Total Display */}
              <div className="bg-blue-600 p-6 rounded-xl text-center shadow-lg shadow-blue-100">
                <p className="text-[10px] text-blue-100 uppercase font-bold tracking-widest mb-1">Grand Total Payable</p>
                <h2 className="text-4xl font-black text-white">৳{totals.grandTotal.toLocaleString()}</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Custom RadioGroupField for Payment Method */}
                <RadioGroupField 
                  control={control} 
                  name="paymentMethod" 
                  label="Payment Method" 
                  required
                  options={PAYMENT_METHODS.map(m => ({ label: m.label, value: m.value }))}
                />

                <div className="grid grid-cols-2 gap-4">
                  <TextField 
                    control={control} 
                    name="amountReceived" 
                    label="Amount Tendered" 
                    type="number" 
                    required 
                  />
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Change Back</label>
                    <div className="h-10 px-3 bg-emerald-50 border border-emerald-100 rounded-md flex items-center justify-end font-black text-emerald-700">
                      ৳{changeAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <TextareaField control={control} name="notes" label="Special Notes" placeholder="Any additional info..." />
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-black bg-slate-900 hover:bg-black text-white rounded-xl shadow-xl"
                  disabled={isPending || (amountReceived < totals.grandTotal)}
                >
                  {isPending ? "PROCESSING..." : "FINALIZE & PRINT INVOICE"}
                </Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}