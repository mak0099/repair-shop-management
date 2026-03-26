"use client"

import { Hash, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CurrencyText } from "@/components/shared/data-table-cells"
import { Buyback } from "../buyback.schema"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"

interface BuybackInvoiceViewProps {
  buyback: Buyback
}

export function BuybackInvoiceView({ buyback }: BuybackInvoiceViewProps) {
  const { data: shopProfile } = useShopProfile()

  return (
    <div id="printable-buyback-agreement" className="p-10 print:p-0 overflow-y-auto print:overflow-y-visible h-full bg-background">
      <div className="max-w-[750px] mx-auto space-y-10">

          {/* Header Section */}
          <div className="flex justify-between items-start border-b-2 border-border pb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">{shopProfile?.name || "ARIF REPAIR SHOP"}</h1>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {shopProfile?.address || "Official Trade-in Record"}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium">
                {shopProfile?.phone} {shopProfile?.email && `• ${shopProfile.email}`}
              </div>
            </div>
            <div className="text-right space-y-2">
              <Badge className={`bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-none uppercase font-black text-[9px] px-3 py-1`}>
                {buyback.status}
              </Badge>
              <p className="text-xs font-black text-foreground mt-2">#{buyback.buybackNumber}</p>
            </div>
          </div>

          {/* Declaration Text */}
          <div className="text-[11px] text-muted-foreground leading-relaxed text-justify bg-muted/30 p-4 rounded-xl border border-border/50">
            <span className="font-bold text-foreground">Declaration of Legitimacy:</span> The undersigned seller declares under their own responsibility to be the legitimate owner of the devices listed below and that said devices are free from any legal constraints, are not of illicit origin, and can be freely sold. The buyer acquires the items in the condition they are in, as verified during the inspection.
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-8 text-xs border-b border-border/50 pb-8">
            <div className="space-y-2">
              <p className="font-black text-muted-foreground uppercase text-[9px] tracking-widest">Customer Information</p>
              <div className="p-4 bg-muted/50 rounded-xl border border-border">
                <p className="font-bold text-foreground text-sm uppercase">{buyback.customerId}</p>
                <p className="text-muted-foreground mt-1">ID Ref: {buyback.customerId}</p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <p className="font-black text-muted-foreground uppercase text-[9px] tracking-widest">Agreement Details</p>
              <p className="font-bold text-foreground text-sm">
                Date: {new Date(buyback.buybackDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-muted-foreground">Payment Method: {buyback.paymentMethod}</p>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="space-y-4">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-muted text-muted-foreground">
                  <th className="py-3 px-4 font-bold uppercase text-left rounded-l-lg">Device Description & Details</th>
                  <th className="py-3 px-2 text-center font-bold uppercase">Qty</th>
                  <th className="py-3 px-2 text-right font-bold uppercase">Agreed Price</th>
                  <th className="py-3 px-4 text-right font-bold uppercase rounded-r-lg">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {buyback.items?.map((item, idx) => (
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
                    <td className="py-5 px-2 text-right text-muted-foreground font-bold"><CurrencyText amount={item.agreedPrice} /></td>
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
                <span className="text-sm text-foreground"><CurrencyText amount={buyback.subtotal} /></span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b pb-4">
                <span>Paid to Customer</span>
                <span className="text-sm text-foreground"><CurrencyText amount={buyback.paidAmount} /></span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-black uppercase text-foreground">Total Payout</span>
                <span className="text-2xl font-black text-emerald-600 tracking-tighter">
                  <CurrencyText amount={buyback.totalAmount} />
                </span>
              </div>
            </div>
          </div>

          {/* Footer / Signature */}
          <div className="pt-20 grid grid-cols-2 gap-20">
            <div className="border-t border-border pt-4 text-center">
              <p className="text-[10px] font-black uppercase text-muted-foreground">Seller Signature</p>
            </div>
            <div className="border-t border-border pt-4 text-center">
              <p className="text-[10px] font-black uppercase text-muted-foreground">Shop Representative</p>
            </div>
          </div>
        </div>
    </div>
  )
}