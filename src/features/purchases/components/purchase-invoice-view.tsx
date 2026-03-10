"use client"

import { useState } from "react"
import { Truck, Printer, FileText, Hash, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductPurchase } from "../purchases.schema"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"

interface PurchaseInvoiceViewProps {
  purchase: ProductPurchase
  trigger?: React.ReactNode
}

export function PurchaseInvoiceView({ purchase, trigger }: PurchaseInvoiceViewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: shopProfile } = useShopProfile()
  const currency = shopProfile?.currency || "BDT"

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-8 gap-2 text-[10px] font-bold border-slate-200 hover:bg-slate-50">
            <FileText className="h-3.5 w-3.5 text-blue-600" /> VIEW INVOICE
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl p-0 overflow-hidden h-[95vh] flex flex-col border-none shadow-2xl">
        {/* --- Action Header (Screen Only) --- */}
        <div className="flex justify-between items-center p-4 border-b print:hidden bg-slate-50/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-700 font-black text-[10px] uppercase tracking-widest">
            <Truck className="h-4 w-4 text-blue-600" /> Purchase Voucher
          </div>
          <div className="flex pr-6">
            <Button onClick={handlePrint} size="sm" className="bg-blue-600 hover:bg-blue-700 gap-2 h-8 text-[11px] font-bold px-4">
              <Printer className="h-3.5 w-3.5" /> PRINT VOUCHER
            </Button>
          </div>
        </div>

        {/* --- Printable Invoice Content --- */}
        <div className="p-10 print:p-0 overflow-y-auto flex-1 bg-white" id="printable-area">
          <div className="max-w-[750px] mx-auto space-y-10">
            
            {/* Header Section */}
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{shopProfile?.name || "ARIF REPAIR SHOP"}</h1>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                  <CheckCircle2 className="h-3 w-3 text-green-500" /> {shopProfile?.address || "Official Inventory Record"}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {shopProfile?.phone} {shopProfile?.email && `• ${shopProfile.email}`}
                </div>
              </div>
              <div className="text-right space-y-2">
                <Badge className={`${purchase.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} border-none uppercase font-black text-[9px] px-3 py-1`}>
                  {purchase.paymentStatus}
                </Badge>
                <p className="text-xs font-black text-slate-900 mt-2">#{purchase.purchaseNumber}</p>
              </div>
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-2 gap-8 text-xs border-b border-slate-50 pb-8">
              <div className="space-y-2">
                <p className="font-black text-slate-400 uppercase text-[9px] tracking-widest">Supplier Information</p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-bold text-slate-800 text-sm uppercase">{purchase.supplierId}</p>
                  <p className="text-slate-400 mt-1">Ref: {purchase.billNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <p className="font-black text-slate-400 uppercase text-[9px] tracking-widest">Voucher Details</p>
                <p className="font-bold text-slate-800 text-sm">
                  Date: {new Date(purchase.purchaseDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-slate-400">Status: {purchase.status}</p>
              </div>
            </div>

            {/* Invoice Table */}
            <div className="space-y-4">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-state-700">
                    <th className="py-3 px-4 font-bold uppercase text-left rounded-l-lg">Item Description & Serials</th>
                    <th className="py-3 px-2 text-center font-bold uppercase">Qty</th>
                    <th className="py-3 px-2 text-right font-bold uppercase">Unit Cost</th>
                    <th className="py-3 px-4 text-right font-bold uppercase rounded-r-lg">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchase.items.map((item, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="py-5 px-4">
                        <p className="font-black text-slate-800 uppercase text-sm mb-1">{item.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold mb-3 tracking-tighter">SKU: {item.productId}</p>
                        
                        {/* --- Serial Numbers Display --- */}
                        {item.isSerialized && item.serialList && item.serialList.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.serialList.map((sn, sIdx) => (
                              <span key={sIdx} className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 text-[9px] px-2 py-0.5 rounded font-mono font-bold">
                                <Hash className="h-2.5 w-2.5 opacity-50" /> {sn}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-5 px-2 text-center font-black text-slate-700 text-sm">{item.quantity}</td>
                      <td className="py-5 px-2 text-right text-slate-600 font-bold">{currency} {item.costPrice.toLocaleString()}</td>
                      <td className="py-5 px-4 text-right font-black text-slate-900 text-sm">{currency} {item.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-end pt-6">
              <div className="w-72 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-sm text-slate-900">{currency} {purchase.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b pb-4">
                  <span>Paid to Supplier</span>
                  <span className="text-sm text-slate-900">{currency} {purchase.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-black uppercase text-slate-900">Total Balance Due</span>
                  <span className="text-2xl font-black text-red-600 tracking-tighter">
                    {currency} {purchase.dueAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer / Signature */}
            <div className="pt-20 grid grid-cols-2 gap-20">
              <div className="border-t border-slate-200 pt-4 text-center">
                <p className="text-[10px] font-black uppercase text-slate-400">Authorized Signature</p>
              </div>
              <div className="border-t border-slate-200 pt-4 text-center">
                <p className="text-[10px] font-black uppercase text-slate-400">Supplier Stamp</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 20px;
          }
        }
      `}</style>
    </Dialog>
  )
}