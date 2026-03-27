"use client"

import { Receipt } from "lucide-react"
import { SaleReturn } from "../returns.schema"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"

interface ReturnInvoiceViewProps {
  data: SaleReturn
}

export function ReturnInvoiceView({ data }: ReturnInvoiceViewProps) {
  const { data: shopProfile } = useShopProfile()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: shopProfile?.currency || 'BDT'
    }).format(amount)
  }

  return (
    <div id="printable-return" className="p-8 md:p-12 print:p-3 overflow-y-auto print:overflow-y-visible h-full bg-background">
      <div className="max-w-[800px] mx-auto space-y-6 print:space-y-2">
        {/* Company Branding */}
        <div className="flex justify-between items-start border-b pb-6">
          <div className="space-y-1">
            <h1 className="text-xl font-black">{shopProfile?.name || "ARIF REPAIR SHOP"}</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{shopProfile?.address || "Professional Tech Solutions"}</p>
            <p className="text-[10px] text-muted-foreground">{shopProfile?.phone} {shopProfile?.email && `• ${shopProfile.email}`}</p>
          </div>
          <div className="text-right space-y-1">
            <h2 className="text-2xl font-black tracking-tight">CREDIT NOTE</h2>
            <p className="text-sm font-bold text-muted-foreground">Return #: {data.returnNumber}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Returned By</p>
            <p className="font-bold text-sm">{data.customerName || data.customerId}</p>
          </div>
          <div className="space-y-2 text-right">
            <div className="inline-block bg-muted/50 p-3 rounded-lg border">
              <div className="flex items-center justify-end gap-2 text-muted-foreground mb-1">
                <Receipt className="h-3.5 w-3.5" />
                <span className="text-xs font-black uppercase">Ref Invoice</span>
              </div>
              <p className="text-sm font-bold text-foreground">#{data.saleId}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(data.returnDate).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-0 font-black uppercase">Item Description</th>
                <th className="py-2 px-0 font-black uppercase">Condition</th>
                <th className="py-2 px-0 text-center font-black uppercase">Qty</th>
                <th className="py-2 px-0 text-right font-black uppercase">Refund Price</th>
                <th className="py-2 px-0 text-right font-black uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/50">
                  <td className="py-3 px-0">
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-[9px] text-muted-foreground uppercase mt-0.5">{item.productId}</p>
                  </td>
                  <td className="py-3 px-0 text-sm">
                    <span className="px-2 py-1 rounded bg-muted text-[10px] font-bold text-muted-foreground uppercase">
                      {item.condition}
                    </span>
                  </td>
                  <td className="py-3 px-0 text-center font-bold text-sm">{item.quantity}</td>
                  <td className="py-3 px-0 text-right text-sm text-muted-foreground">{formatCurrency(item.price)}</td>
                  <td className="py-3 px-0 text-right text-sm font-semibold">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaling */}
        <div className="space-y-2 border-t pt-4 flex justify-end">
          <div className="w-64 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Subtotal Refund</span>
              <span className="font-semibold">{formatCurrency(data.subtotal)}</span>
            </div>
            {data.restockingFee > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Restocking Fee</span>
                <span className="font-semibold text-destructive">-{formatCurrency(data.restockingFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black border-t pt-2 mt-2">
              <span>TOTAL REFUND</span>
              <span>{formatCurrency(data.totalRefundAmount)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
