"use client"

import { FileText, Printer, CalendarClock } from "lucide-react"
import { Quotation } from "../quotations.schema"
import { Button } from "@/components/ui/button"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"

export function QuotationView({ quotation }: { quotation: Quotation }) {
  const { data: shopProfile } = useShopProfile()
  const currency = shopProfile?.currency || "BDT"
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Action Header */}
      <div className="flex justify-between items-center p-4 border-b print:hidden bg-slate-50 pr-28">
        <div className="flex items-center gap-2 text-blue-600">
          <FileText className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-widest">Quotation / Estimate</span>
        </div>
        <Button onClick={() => window.print()} size="sm" className="bg-slate-900 gap-2 h-8 text-[11px] font-bold">
          <Printer className="h-3.5 w-3.5" /> PRINT QUOTE
        </Button>
      </div>

      {/* Printable Content */}
      <div id="printable-quotation" className="p-8 md:p-16 print:p-0 overflow-y-auto flex-1">
        <div className="max-w-[800px] mx-auto">
          {/* Company Branding */}
          <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">{shopProfile?.name || "ARIF REPAIR SHOP"}</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{shopProfile?.address || "Professional Tech Solutions"}</p>
              <p className="text-[10px] text-slate-400">{shopProfile?.phone} {shopProfile?.email && `• ${shopProfile.email}`}</p>
            </div>
            <div className="text-right space-y-1">
              <h2 className="text-xl font-black text-blue-600 uppercase tracking-widest">ESTIMATE</h2>
              <p className="text-sm font-bold text-slate-800">#{quotation.quotationNumber}</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-2 gap-12 py-10">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quoted To</p>
              <div className="text-sm">
                <p className="font-black text-slate-900">{quotation.customerName || quotation.customerId}</p>
              </div>
            </div>
            <div className="space-y-4 text-right">
              <div className="inline-block bg-slate-50 p-3 rounded-lg border">
                <div className="flex items-center justify-end gap-2 text-amber-600 mb-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase">Valid Until</span>
                </div>
                <p className="text-sm font-black text-slate-900">
                  {new Date(quotation.validUntil).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs mb-10">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="py-3 font-black uppercase">Service / Part Description</th>
                <th className="py-3 font-black uppercase text-center">Qty</th>
                <th className="py-3 font-black uppercase text-right">Unit Price</th>
                <th className="py-3 font-black uppercase text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b border-slate-200">
              {quotation.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-4">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase mt-0.5">{item.productId}</p>
                  </td>
                  <td className="py-4 text-center font-bold text-slate-600">{item.quantity}</td>
                  <td className="py-4 text-right text-slate-600">{currency} {item.price.toLocaleString()}</td>
                  <td className="py-4 text-right font-black text-slate-900">{currency} {item.subtotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaling */}
          <div className="flex justify-end mb-12">
            <div className="w-72 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span className="font-medium">Gross Amount</span>
                <span className="font-bold">{currency} {quotation.subtotal.toLocaleString()}</span>
              </div>
              {quotation.totalDiscount > 0 && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="font-medium">Discount</span>
                  <span className="font-bold text-red-500">-{currency} {quotation.totalDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-500">
                <span className="font-medium">Tax (VAT 5%)</span>
                <span className="font-bold">{currency} {quotation.totalTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900 border-t-2 border-slate-900 pt-3 mt-3">
                <span>ESTIMATED TOTAL</span>
                <span>{currency} {quotation.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Terms & Footer */}
          <div className="bg-slate-50 p-6 rounded-xl border space-y-3">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Terms & Conditions</h4>
            {shopProfile?.termsAndConditions ? (
                 <p className="text-[10px] text-slate-500 whitespace-pre-wrap italic">
                    {shopProfile.termsAndConditions}
                 </p>
            ) : (
                <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4 italic">
                <li>This estimate is valid for {new Date(quotation.validUntil).toLocaleDateString()} only.</li>
                <li>Price may vary depending on the actual condition of the device upon disassembly.</li>
                <li>Service warranty applies only to the specific parts replaced.</li>
                </ul>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-quotation, #printable-quotation * { visibility: visible; }
          #printable-quotation { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  )
}