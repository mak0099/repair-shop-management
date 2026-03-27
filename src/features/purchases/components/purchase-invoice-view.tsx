"use client"

import { Hash, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CurrencyText } from "@/components/shared/data-table-cells"
import { ProductPurchase } from "../purchases.schema"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"

interface PurchaseInvoiceViewProps {
  purchase: ProductPurchase
}

export function PurchaseInvoiceView({ purchase }: PurchaseInvoiceViewProps) {
  const { data: shopProfile } = useShopProfile()

  return (
    <div id="printable-purchase-voucher" className="p-10 print:p-0 overflow-y-auto print:overflow-y-visible h-full bg-background">
      <div className="max-w-[750px] mx-auto space-y-10">

          {/* Header Section */}
          <div className="flex justify-between items-start border-b-2 border-border pb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">{shopProfile?.name || "ARIF REPAIR SHOP"}</h1>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {shopProfile?.address || "Official Inventory Record"}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium">
                {shopProfile?.phone} {shopProfile?.email && `• ${shopProfile.email}`}
              </div>
            </div>
            <div className="text-right space-y-2">
              <Badge className={`${purchase.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-amber-500/10 text-amber-600 dark:text-amber-500'} border-none uppercase font-black text-[9px] px-3 py-1`}>
                {purchase.paymentStatus}
              </Badge>
              <p className="text-xs font-black text-foreground mt-2">#{purchase.purchaseNumber}</p>
            </div>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-8 text-xs border-b border-border/50 pb-8">
            <div className="space-y-2">
              <p className="font-black text-muted-foreground uppercase text-[9px] tracking-widest">Supplier Information</p>
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <p className="font-bold text-foreground text-sm uppercase">{purchase.supplierId}</p>
                <p className="text-muted-foreground mt-1">Ref: {purchase.billNumber || 'N/A'}</p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <p className="font-black text-muted-foreground uppercase text-[9px] tracking-widest">Voucher Details</p>
              <p className="font-bold text-foreground text-sm">
                Date: {new Date(purchase.purchaseDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-muted-foreground">Status: {purchase.status}</p>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="space-y-4">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-muted text-muted-foreground">
                  <th className="py-3 px-4 font-bold uppercase text-left rounded-l-lg">Item Description & Serials</th>
                  <th className="py-3 px-2 text-center font-bold uppercase">Qty</th>
                  <th className="py-3 px-2 text-right font-bold uppercase">Unit Cost</th>
                  <th className="py-3 px-4 text-right font-bold uppercase rounded-r-lg">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {purchase.items.map((item, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-5 px-4">
                      <p className="font-black text-foreground uppercase text-sm mb-1">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground font-bold mb-3 tracking-tighter">SKU: {item.productId}</p>

                      {/* --- Serial Numbers Display --- */}
                      {item.isSerialized && item.serialList && item.serialList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {item.serialList.map((sn, sIdx) => (
                            <span key={sIdx} className="inline-flex items-center gap-1 bg-muted border border-border text-muted-foreground text-[9px] px-2 py-0.5 rounded font-mono font-bold">
                              <Hash className="h-2.5 w-2.5 opacity-50" /> {sn.imei}
                              {sn.condition && <span className="ml-1 font-normal opacity-70">({sn.condition})</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-5 px-2 text-center font-black text-foreground text-sm">{item.quantity}</td>
                    <td className="py-5 px-2 text-right text-muted-foreground font-bold"><CurrencyText amount={item.costPrice} /></td>
                    <td className="py-5 px-4 text-right font-black text-foreground text-sm"><CurrencyText amount={item.subtotal} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="flex justify-end pt-6">
            <div className="w-72 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="text-sm text-foreground"><CurrencyText amount={purchase.subtotal} /></span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b pb-4">
                <span>Paid to Supplier</span>
                <span className="text-sm text-foreground"><CurrencyText amount={purchase.paidAmount} /></span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-black uppercase text-foreground">Total Balance Due</span>
                <span className="text-2xl font-black text-destructive tracking-tighter">
                  <CurrencyText amount={purchase.dueAmount} />
                </span>
              </div>
            </div>
          </div>

          {/* Footer / Signature */}
          <div className="pt-20 grid grid-cols-2 gap-20">
            <div className="border-t border-border pt-4 text-center">
              <p className="text-[10px] font-black uppercase text-muted-foreground">Authorized Signature</p>
            </div>
            <div className="border-t border-border pt-4 text-center">
              <p className="text-[10px] font-black uppercase text-muted-foreground">Supplier Stamp</p>
            </div>
          </div>
        </div>
      </div>
    )
  }