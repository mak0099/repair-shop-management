"use client"

import { useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Receipt, Trash2, Plus, Minus, Smartphone, X } from "lucide-react"

import { usePOS } from "../pos-context"
import { POSCheckoutModal } from "./pos-checkout-modal"
import { CustomerSelectField } from "@/features/customers"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export function POSCartPanel() {
  const { cart, totals, updateQuantity, removeItem, clearCart, selectedCustomerId, setCustomerId, updateItemIMEI, updatePrice } = usePOS()

  const form = useForm({ defaultValues: { customerId: selectedCustomerId || "" } })
  const { control, watch, reset } = form
  const watchedCustomerId = watch("customerId")

  useEffect(() => { if (watchedCustomerId !== selectedCustomerId) setCustomerId(watchedCustomerId) }, [watchedCustomerId])
  useEffect(() => { reset({ customerId: selectedCustomerId || "" }) }, [selectedCustomerId])

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Invoice Header - Compact */}
      <div className="flex-none p-4 border-b bg-slate-50 space-y-3 z-10 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 bg-blue-600 rounded-full" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Order</h2>
          </div>
          {cart.length > 0 && (
             <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] font-bold text-red-500 hover:bg-red-50 hover:text-red-600" onClick={clearCart}>
               <Trash2 className="h-3 w-3 mr-1" /> CLEAR
             </Button>
          )}
        </div>
        
        <FormProvider {...form}>
          <Form {...form}>
            <div className="w-full">
                <CustomerSelectField name="customerId" control={control} placeholder="Select Customer..." />
            </div>
          </Form>
        </FormProvider>
      </div>

      {/* Cart List */}
      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white text-slate-300">
          <Receipt className="h-10 w-10 mb-2 opacity-20" />
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Empty Cart</p>
        </div>
      ) : (
        <ScrollArea className="flex-1 h-0 bg-white">
          <div className="p-2 space-y-2">
            {cart.map((item) => {
              const serials = (item.availableSerials && item.availableSerials.length > 0) 
                  ? item.availableSerials 
                  : ((item as any).serialList || []);

              return (
              <div key={item.cartId} className="group relative p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
                
                {/* Remove Button - Absolute top right */}
                <button 
                    onClick={() => removeItem(item.cartId)} 
                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {/* Item Info */}
                <div className="pr-6 mb-2">
                    <h4 className="text-xs font-bold text-slate-800 leading-tight line-clamp-1">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-mono font-medium text-slate-400">{item.sku || 'NO-SKU'}</span>
                        {item.isSerialized && <span className="text-[8px] px-1 py-0.5 bg-blue-50 text-blue-600 rounded font-bold uppercase">SN</span>}
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-end justify-between gap-2">
                  
                  {/* Quantity / Serial Control */}
                  <div className="flex-1">
                  {item.isSerialized ? (
                        <div className="w-full max-w-[180px]">
                             <Select 
                                value={item.selectedIMEI || ""} 
                                onValueChange={(val) => updateItemIMEI(item.cartId, val)}
                              >
                                <SelectTrigger className="h-7 text-[10px] font-bold bg-slate-50 border-slate-200 focus:ring-0 px-2">
                                  <SelectValue placeholder="Select Serial / IMEI" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                  {serials.length > 0 ? (
                                    serials.map((sn: string) => (
                                      <SelectItem key={sn} value={sn} className="text-[10px] font-medium">
                                          <div className="flex items-center gap-2">
                                              <Smartphone className="h-3 w-3 text-slate-400" />
                                              <span>{sn}</span>
                                          </div>
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className="p-2 text-[10px] text-slate-400 text-center font-medium">No serials found</div>
                                  )}
                                </SelectContent>
                              </Select>
                        </div>
                  ) : (
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg w-fit h-7">
                            <button 
                                onClick={() => updateQuantity(item.cartId, Math.max(1, item.quantity - 1))} 
                                className="h-full px-2 hover:bg-white hover:text-blue-600 rounded-l-lg transition-colors"
                            >
                                <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                            <button 
                                onClick={() => updateQuantity(item.cartId, item.quantity + 1)} 
                                className="h-full px-2 hover:bg-white hover:text-blue-600 rounded-r-lg transition-colors"
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        </div>
                  )}
                  </div>

                  {/* Price */}
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-bold">@</span>
                        <Input 
                            type="number" 
                            className="h-6 w-16 text-right text-[11px] font-bold px-1 py-0 bg-slate-50 border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500"
                            value={item.price}
                            onChange={(e) => updatePrice(item.cartId, parseFloat(e.target.value) || 0)}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>
                    <div className="text-xs font-black text-slate-900">
                        Total: €{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>

                </div>
              </div>
            )})}
          </div>
        </ScrollArea>
      )}

      {/* Checkout Footer - Compact */}
      <div className="flex-none p-4 bg-slate-50 border-t space-y-3 z-10 relative">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
            <span>Subtotal</span>
            <span>€{totals.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
            <span>Tax (VAT)</span>
            <span>€{totals.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
            <span className="text-xs font-black text-slate-700 uppercase">Total Payable</span>
            <span className="text-xl font-black text-blue-600">€{totals.grandTotal.toLocaleString()}</span>
          </div>
        </div>
        
        <POSCheckoutModal disabled={cart.length === 0 || !selectedCustomerId || selectedCustomerId.trim() === "" || cart.some(i => i.isSerialized && !i.selectedIMEI)} />
      </div>
    </div>
  )
}