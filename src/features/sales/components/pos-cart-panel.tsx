"use client"

import { useEffect, useMemo } from "react"
import { useForm, FormProvider, useWatch } from "react-hook-form"
import { Receipt, Trash2, Plus, Minus, Smartphone, X, Package, Wrench } from "lucide-react"

import { usePOS } from "../pos-context"
import { POSCheckoutModal } from "./pos-checkout-modal"
import { CustomerSelectField } from "@/features/customers"
import { useCustomerOptions } from "@/features/customers/customer.api"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CurrencyText } from "@/components/shared/data-table-cells"

export function POSCartPanel() {
  const { cart, totals, updateQuantity, removeItem, clearCart, selectedCustomerId, setCustomerField, updateItemIMEI, updatePrice } = usePOS()
  const { data: customersData } = useCustomerOptions()

  const form = useForm({ defaultValues: { customerId: selectedCustomerId || "" } })
  const { control, reset } = form
  const watchedCustomerId = useWatch({ control, name: "customerId" })

  // Build customer lookup map
  const customerLookup = useMemo(() => {
    const map: Record<string, string> = {}
    if (customersData) {
      customersData.forEach(c => {
        map[c.id] = c.name || ""
      })
    }
    return map
  }, [customersData])

  useEffect(() => { 
    if (watchedCustomerId !== selectedCustomerId) {
      const customerName = watchedCustomerId ? customerLookup[watchedCustomerId] : null
      setCustomerField(watchedCustomerId, customerName || null)
    }
  }, [watchedCustomerId, selectedCustomerId, customerLookup, setCustomerField])
  
  useEffect(() => { 
    reset({ customerId: selectedCustomerId || "" }) 
  }, [selectedCustomerId, reset])

  return (
    <div className="flex flex-col h-full bg-card relative">
      {/* Invoice Header - Compact */}
      <div className="flex-none p-4 border-b bg-muted/50 space-y-3 z-10 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 bg-primary rounded-full" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Order</h2>
          </div>
          {cart.length > 0 && (
             <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] font-bold text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={clearCart}>
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
        <div className="flex-1 flex flex-col items-center justify-center bg-card text-muted-foreground/50">
          <Receipt className="h-10 w-10 mb-2 opacity-20" />
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Empty Cart</p>
        </div>
      ) : (
        <ScrollArea className="flex-1 overflow-hidden bg-card">
          <div className="p-2 space-y-2">
            {cart.map((item) => {
              const serials = (item.availableSerials && item.availableSerials.length > 0) 
                  ? item.availableSerials 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  : ((item as any).serialList || []);

              return (
              <div key={item.cartId} className="group relative p-3 bg-background border border-border rounded-xl shadow-sm hover:border-primary/50 hover:shadow-md transition-all">
                
                {/* Remove Button - Absolute top right */}
                <button 
                    onClick={() => removeItem(item.cartId)} 
                    className="absolute top-2 right-2 p-1 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {/* Item Info */}
                <div className="pr-6 mb-2">
                    <h4 className="text-xs font-bold text-foreground leading-tight line-clamp-1">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-mono font-medium text-muted-foreground">{item.sku || 'NO-SKU'}</span>
                        
                        {/* Item Type Badge */}
                        <div className="flex items-center gap-1">
                          {item.type === "SERVICE" ? (
                            <>
                              <Wrench className="h-3 w-3 text-green-600 dark:text-green-500" />
                              <span className="text-[8px] px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-500 rounded font-bold uppercase">Service</span>
                            </>
                          ) : (
                            <>
                              <Package className="h-3 w-3 text-blue-600 dark:text-blue-500" />
                              <span className="text-[8px] px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded font-bold uppercase">Product</span>
                            </>
                          )}
                        </div>

                        {/* Serialized Badge */}
                        {item.isSerialized && <span className="text-[8px] px-1 py-0.5 bg-primary/10 text-primary rounded font-bold uppercase">SN</span>}
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
                                <SelectTrigger className="h-7 text-[10px] font-bold bg-muted/50 border-border focus:ring-0 px-2">
                                  <SelectValue placeholder="Select Serial / IMEI" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                  {serials.length > 0 ? (
                                    serials.map((sn: string) => (
                                      <SelectItem key={sn} value={sn} className="text-[10px] font-medium">
                                          <div className="flex items-center gap-2">
                                              <Smartphone className="h-3 w-3 text-muted-foreground" />
                                              <span>{sn}</span>
                                          </div>
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className="p-2 text-[10px] text-muted-foreground text-center font-medium">No serials found</div>
                                  )}
                                </SelectContent>
                              </Select>
                        </div>
                  ) : (
                        <div className="flex items-center bg-muted/50 border border-border rounded-lg w-fit h-7">
                            <button 
                                onClick={() => updateQuantity(item.cartId, Math.max(1, item.quantity - 1))} 
                                className="h-full px-2 hover:bg-background hover:text-primary rounded-l-lg transition-colors"
                            >
                                <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-foreground">{item.quantity}</span>
                            <button 
                                onClick={() => updateQuantity(item.cartId, item.quantity + 1)} 
                                className="h-full px-2 hover:bg-background hover:text-primary rounded-r-lg transition-colors"
                            >
                                <Plus className="h-3 w-3" />
                            </button>
                        </div>
                  )}
                  </div>

                  {/* Price */}
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground font-bold">@</span>
                        <Input 
                            type="number" 
                            className="h-6 w-20 text-right text-[11px] font-bold px-1 py-0 bg-muted/50 border-border focus:bg-background focus:ring-1 focus:ring-primary"
                            placeholder="0"
                            value={item.price ? item.price : ""}
                            onChange={(e) => updatePrice(item.cartId, parseFloat(e.target.value) || 0)}
                            onBlur={(e) => {
                              const value = e.target.value.trim()
                              if (!value || isNaN(parseFloat(value))) {
                                updatePrice(item.cartId, 0)
                              }
                            }}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>
                    <div className="text-xs font-black text-foreground">
                        Total: <CurrencyText amount={item.price * item.quantity} />
                    </div>
                  </div>

                </div>
              </div>
            )})}
          </div>
        </ScrollArea>
      )}

      {/* Checkout Footer - Compact */}
      <div className="flex-none p-4 bg-muted/50 border-t space-y-3 z-10 relative">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
            <span>Subtotal</span>
            <span><CurrencyText amount={totals.subtotal} /></span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
            <span>Tax (VAT)</span>
            <span><CurrencyText amount={totals.tax} /></span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-border mt-2">
            <span className="text-xs font-black text-foreground uppercase">Total Payable</span>
            <span className="text-xl font-black text-primary"><CurrencyText amount={totals.grandTotal} /></span>
          </div>
        </div>
        
        <POSCheckoutModal disabled={cart.length === 0} />
      </div>
    </div>
  )
}