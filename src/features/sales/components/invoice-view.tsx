"use client"

import Image from "next/image"
import { Receipt, Printer } from "lucide-react"
import { Sale } from "../sales.schema"
import { format } from "date-fns";
import { Button } from "@/components/ui/button"
import { useInvoiceSetup } from "@/features/invoice-setup/invoice-setup.api"
import { INVOICE_PAPER_SIZES } from "@/features/invoice-setup/invoice-setup.constants"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"

interface InvoiceViewProps {
  sale: Sale
}

export function InvoiceView({ sale }: InvoiceViewProps) {
  const invoiceSetupQuery = useInvoiceSetup();
  const shopProfileQuery = useShopProfile();
  
  const invoiceSetup = invoiceSetupQuery.data;
  const shopProfile = shopProfileQuery.data;
  
  const isLoading = invoiceSetupQuery.isLoading || shopProfileQuery.isLoading;

  if (isLoading || !invoiceSetup || !shopProfile) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading invoice...</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: shopProfile?.currency || 'EUR' }).format(amount);
  };

  const formatDate = (date: Date) => {
    if (!invoiceSetup?.dateFormat) return new Date(date).toLocaleDateString('it-IT');
    try {
      return format(new Date(date), invoiceSetup.dateFormat);
    } catch {
      return new Date(date).toLocaleDateString('it-IT'); // Fallback
    }
  };

  const getPageSize = () => {
    switch (invoiceSetup?.templateSize) {
      case INVOICE_PAPER_SIZES.A5: return "A5";
      case INVOICE_PAPER_SIZES.THERMAL_80: return "80mm auto";
      default: return "A4";
    }
  };

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header for Web - Hidden on Print */}
      <div className="flex justify-between items-center p-4 border-b print:hidden bg-slate-50 pr-12">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-black uppercase tracking-widest">Invoice Details</span>
        </div>
        <Button onClick={handlePrint} size="sm" className="bg-slate-900 gap-2 h-8 text-[11px] font-bold">
          <Printer className="h-3.5 w-3.5" /> PRINT INVOICE
        </Button>
      </div>

      {/* The Actual Receipt Content */}
      <div id="printable-invoice" className="p-8 md:p-12 print:p-0 overflow-y-auto flex-1">
        <div className="max-w-[800px] mx-auto space-y-8">

          {/* Company Info */}
          <div className="flex justify-between items-start border-b pb-6">
            <div className="space-y-1 flex flex-row gap-2">
              {invoiceSetup?.showLogo && (
                shopProfile?.logoUrl ? (
                  <div className="relative h-16 w-24">
                    <Image src={shopProfile.logoUrl} alt="Logo" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="h-10 w-32 bg-slate-100 rounded flex items-center justify-center text-[10px] text-slate-400 font-bold mb-2">
                    SHOP LOGO
                  </div>
                )
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">{invoiceSetup?.shopName || shopProfile?.name || "NOME OFFICINA"}</h1>
                <p className="text-xs text-slate-500 font-medium">{invoiceSetup?.shopAddress || shopProfile?.address || "Indirizzo, Città, CAP"}</p>
                <p className="text-xs text-slate-500 font-medium">{invoiceSetup?.shopContact || [shopProfile?.phone, shopProfile?.email].filter(Boolean).join(" • ") || "Contatto (Tel/Email)"}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-black text-slate-400 uppercase tracking-widest">{invoiceSetup?.invoiceTitle || "RICEVUTA"}</h2>
              <p className="text-xs font-bold text-slate-700 mt-1">{invoiceSetup?.invoiceNumberLabel || "Fattura N"}: {sale.invoiceNumber}</p>
              <p className="text-[10px] text-slate-400">{invoiceSetup?.dateLabel || "Data"}: {formatDate(new Date(sale.createdAt))}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4 py-4 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{invoiceSetup?.customerInfoLabel || "Dati Cliente"}</p>
              <p className="font-black text-slate-800">{sale.customerName || "Walk-in Customer"}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{invoiceSetup?.paymentMethodLabel || "Metodo di Pagamento"}</p>
              <p className="font-black text-slate-800 uppercase">{sale.paymentMethod}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="py-2 font-black uppercase">{invoiceSetup?.itemColumnLabel || "Descrizione"}</th>
                <th className="py-2 font-black uppercase text-center">{invoiceSetup?.quantityColumnLabel || "Qtà"}</th>
                <th className="py-2 font-black uppercase text-right">{invoiceSetup?.priceColumnLabel || "Prezzo"}</th>
                <th className="py-2 font-black uppercase text-right">{invoiceSetup?.totalColumnLabel || "Totale"}</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b border-slate-200">
              {sale.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-medium text-slate-700">
                    <span className="font-bold block">{item.name}</span>
                    <span className="text-[9px] text-slate-400 uppercase">{item.type}</span>
                  </td>
                  <td className="py-3 text-center font-bold text-slate-600">{item.quantity}</td>
                  <td className="py-3 text-right text-slate-600">{formatCurrency(item.price)}</td>
                  <td className="py-3 text-right font-black text-slate-900">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="flex justify-end pt-4">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>{invoiceSetup?.subtotalLabel || "Subtotale"}</span>
                <span className="font-bold">{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{invoiceSetup?.taxLabel || "IVA"}</span>
                <span className="font-bold">{formatCurrency(sale.totalTax)}</span>
              </div>
              {sale.totalDiscount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>{invoiceSetup?.discountLabel || "Sconto"}</span>
                  <span className="font-bold">-{formatCurrency(sale.totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-slate-900 border-t-2 border-slate-900 pt-2">
                <span>{invoiceSetup?.grandTotalLabel || "Totale Generale"}</span>
                <span>{formatCurrency(sale.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 pt-1 font-bold">
                <span>{invoiceSetup?.amountPaidLabel || "Importo Pagato"}</span>
                <span>{formatCurrency(sale.amountReceived)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-12 space-y-8">
            <div className="text-left border-t border-dashed pt-4 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{invoiceSetup?.thankYouMessage || "Grazie per averci scelto!"}</p>
              <p className="text-[9px] text-slate-400 whitespace-pre-wrap">
                {invoiceSetup?.termsAndConditions || "La merce venduta non si cambia."}
              </p>
            </div>

            {invoiceSetup?.showSignature && (
              <div className="flex justify-end pt-8">
                <div className="border-t border-slate-400 w-40 text-center pt-1 text-[10px] font-bold text-slate-600">
                  {invoiceSetup?.signatureLabel || "Firma Autorizzata"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Global Styles for Print */}
      <style jsx global>{`
        @page {
          size: ${getPageSize()};
          margin: 0;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}