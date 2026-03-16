"use client"

import { Printer, RotateCcw, Receipt } from "lucide-react"
import { SaleReturn } from "../returns.schema"
import { Button } from "@/components/ui/button"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"

export function ReturnInvoiceView({ data }: { data: SaleReturn }) {
  const { data: shopProfile } = useShopProfile()
  const currency = shopProfile?.currency || "BDT"
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Action Header */}
      <div className="flex justify-between items-center p-4 border-b print:hidden bg-muted/50 mr-12">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
          <RotateCcw className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-widest">Return Receipt / Credit Note</span>
        </div>
        <Button onClick={() => window.print()} size="sm" className="gap-2 h-8 text-[11px] font-bold">
          <Printer className="h-3.5 w-3.5" /> PRINT RECEIPT
        </Button>
      </div>

      {/* Printable Content */}
      <div id="printable-return" className="p-8 md:p-16 print:p-0 overflow-y-auto flex-1">
        <div className="max-w-[800px] mx-auto">
          {/* Company Branding */}
          <div className="flex justify-between items-start border-b-4 border-foreground pb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">{shopProfile?.name || "ARIF REPAIR SHOP"}</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{shopProfile?.address || "Professional Tech Solutions"}</p>
              <p className="text-[10px] text-muted-foreground">{shopProfile?.phone} {shopProfile?.email && `• ${shopProfile.email}`}</p>
            </div>
            <div className="text-right space-y-1">
              <h2 className="text-xl font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">CREDIT NOTE</h2>
              <p className="text-sm font-bold text-foreground">#{data.returnNumber}</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-2 gap-12 py-10">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Returned By</p>
              <div className="text-sm">
                <p className="font-black text-foreground">{data.customerName || data.customerId}</p>
              </div>
            </div>
            <div className="space-y-4 text-right">
              <div className="inline-block bg-muted/50 p-3 rounded-lg border">
                <div className="flex items-center justify-end gap-2 text-muted-foreground mb-1">
                  <Receipt className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase">Ref Invoice</span>
                </div>
                <p className="text-sm font-black text-foreground">
                  #{data.saleId}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                    Date: {new Date(data.returnDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs mb-10">
            <thead>
              <tr className="border-b-2 border-foreground">
                <th className="py-3 font-black uppercase">Item Description</th>
                <th className="py-3 font-black uppercase">Condition</th>
                <th className="py-3 font-black uppercase text-center">Qty</th>
                <th className="py-3 font-black uppercase text-right">Refund Price</th>
                <th className="py-3 font-black uppercase text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b border-border">
              {data.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/50">
                  <td className="py-4">
                    <p className="font-bold text-foreground">{item.name}</p>
                    <p className="text-[9px] text-muted-foreground uppercase mt-0.5">{item.productId}</p>
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-1 rounded bg-muted text-[10px] font-bold text-muted-foreground uppercase">
                        {item.condition}
                    </span>
                  </td>
                  <td className="py-4 text-center font-bold text-muted-foreground">{item.quantity}</td>
                  <td className="py-4 text-right text-muted-foreground">{currency} {item.price.toLocaleString()}</td>
                  <td className="py-4 text-right font-black text-foreground">{currency} {item.subtotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaling */}
          <div className="flex justify-end mb-12">
            <div className="w-72 space-y-2.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="font-medium">Subtotal Refund</span>
                <span className="font-bold">{currency} {data.subtotal.toLocaleString()}</span>
              </div>
              {data.restockingFee > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="font-medium">Restocking Fee</span>
                  <span className="font-bold text-destructive">-{currency} {data.restockingFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-foreground border-t-2 border-foreground pt-3 mt-3">
                <span>TOTAL REFUND</span>
                <span>{currency} {data.totalRefundAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Terms & Footer */}
          <div className="bg-muted/50 p-6 rounded-xl border space-y-3">
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Return Policy</h4>
            {shopProfile?.returnPolicy ? (
                <p className="text-[10px] text-muted-foreground whitespace-pre-wrap italic">
                    {shopProfile.returnPolicy}
                </p>
            ) : (
                <ul className="text-[10px] text-muted-foreground space-y-1 list-disc pl-4 italic">
                <li>Refunds are processed to the original payment method or as store credit.</li>
                <li>Restocking fees may apply for open-box items.</li>
                <li>Defective items are subject to inspection before refund approval.</li>
                </ul>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-return, #printable-return * { visibility: visible; }
          #printable-return { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  )
}
