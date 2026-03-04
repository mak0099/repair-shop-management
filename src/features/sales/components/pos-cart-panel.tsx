"use client"

import { useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Receipt, Package, Trash2, Plus, Minus, UserPlus } from "lucide-react"

import { usePOS } from "../pos-context"
import { POSCheckoutModal } from "./pos-checkout-modal"
import { CustomerSelectField } from "@/features/customers"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

export function POSCartPanel() {
  const { cart, totals, updateQuantity, removeItem, clearCart, selectedCustomerId, setCustomerId } = usePOS()

  // FIX: Initializing a local form to satisfy CustomerSelectField's useFormContext
  const form = useForm<{ customerId: string }>({
    defaultValues: {
      customerId: selectedCustomerId || ""
    }
  })

  const { control, watch, reset } = form
  const watchedCustomerId = watch("customerId")

  // Sync Form state with POS Context
  useEffect(() => {
    if (watchedCustomerId !== selectedCustomerId) {
      setCustomerId(watchedCustomerId)
    }
  }, [watchedCustomerId, selectedCustomerId, setCustomerId])

  // Sync Context state back to Form (e.g. when cart is cleared)
  useEffect(() => {
    reset({ customerId: selectedCustomerId || "" })
  }, [selectedCustomerId, reset])

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Customer Selection Section wrapped in FormProvider */}
      <div className="p-4 border-b bg-slate-50/50 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-blue-600" /> Current Order
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-[10px] text-red-500 hover:text-red-600 font-bold hover:bg-red-50" 
            onClick={clearCart}
          >
            RESET
          </Button>
        </div>
        
        <FormProvider {...form}>
          <Form {...form}>
            <div className="flex gap-2">
              <div className="flex-1">
                {/* Now useFormContext inside this field will find the Provider */}
                <CustomerSelectField 
                  name="customerId" 
                  control={control} 
                  placeholder="Select Customer..."
                />
              </div>
            </div>
          </Form>
        </FormProvider>
      </div>

      {/* Cart Items List */}
      <ScrollArea className="flex-1">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
            <Package className="h-10 w-10 mb-2 opacity-10" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Cart is empty</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {cart.map((item) => (
              <div key={item.productId} className="flex gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm group hover:border-blue-200 transition-all">
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-bold text-slate-800 truncate mb-0.5">{item.name}</h4>
                  <p className="text-xs font-black text-blue-600">৳{item.price.toLocaleString()}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100/50 border rounded-lg overflow-hidden">
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)} 
                      className="p-1.5 hover:bg-white transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center text-[11px] font-black">{item.quantity}</span>
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)} 
                      className="p-1.5 hover:bg-white transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeItem(item.productId)} 
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer: Summary & Checkout */}
      <div className="p-4 bg-slate-50 border-t space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <span>SUBTOTAL</span>
            <span>৳{totals.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <span>TAX (5%)</span>
            <span>৳{totals.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-200">
            <span>TOTAL</span>
            <span>৳{totals.grandTotal.toLocaleString()}</span>
          </div>
        </div>
        
        <POSCheckoutModal disabled={cart.length === 0} />
      </div>
    </div>
  )
}