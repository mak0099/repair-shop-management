"use client"

import { useFormContext } from "react-hook-form";
import { format } from "date-fns";
import { InvoiceSetup } from "../invoice-setup.schema";

export function InvoicePreview() {
  const { watch } = useFormContext<InvoiceSetup>();
  const values = watch();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatDate = (date: Date) => {
    try {
      return format(date, values.dateFormat || 'dd/MM/yyyy');
    } catch (e) {
      return format(date, 'dd/MM/yyyy'); // Fallback format
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm sticky top-6">
      <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Preview</span>
        <span className="text-[10px] font-bold text-slate-400">{values.templateSize || "A4"}</span>
      </div>

      <div className="p-8 space-y-6 text-xs">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="space-y-1">
            {values.showLogo && (
              <div className="h-8 w-24 bg-slate-100 rounded flex items-center justify-center text-[9px] text-slate-400 font-bold mb-2">
                SHOP LOGO
              </div>
            )}
            <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase">{values.shopName || "NOME OFFICINA"}</h1>
            <p className="text-[10px] text-slate-500 font-medium">{values.shopAddress || "Indirizzo, Città, CAP"}</p>
            <p className="text-[10px] text-slate-500 font-medium">{values.shopContact || "Contatto (Tel/Email)"}</p>
          </div>
          <div className="text-right">
            <h2 className="text-base font-black text-slate-400 uppercase tracking-widest">{values.invoiceTitle || "RICEVUTA"}</h2>
            <p className="text-[10px] font-bold text-slate-700 mt-1">{values.invoiceNumberLabel || "Fattura N"}: {values.invoicePrefix || "INV"}-{values.nextInvoiceNumber || "1001"}</p>
            <p className="text-[9px] text-slate-400">{values.dateLabel || "Data"}: {formatDate(new Date())}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-4 py-2">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{values.customerInfoLabel || "Dati Cliente"}</p>
            <p className="font-black text-slate-800">Walk-in Customer</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{values.paymentMethodLabel || "Metodo di Pagamento"}</p>
            <p className="font-black text-slate-800 uppercase">CASH</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="py-1.5 font-black uppercase">{values.itemColumnLabel || "Descrizione"}</th>
              <th className="py-1.5 font-black uppercase text-center">{values.quantityColumnLabel || "Qtà"}</th>
              <th className="py-1.5 font-black uppercase text-right">{values.priceColumnLabel || "Prezzo"}</th>
              <th className="py-1.5 font-black uppercase text-right">{values.totalColumnLabel || "Totale"}</th>
            </tr>
          </thead>
          <tbody className="divide-y border-b border-slate-200">
            <tr>
              <td className="py-2 font-medium text-slate-700">
                <span className="font-bold block">Sostituzione Schermo iPhone 15</span>
                <span className="text-[9px] text-slate-400 uppercase">SERVIZIO</span>
              </td>
              <td className="py-2 text-center font-bold text-slate-600">1</td>
              <td className="py-2 text-right text-slate-600">{formatCurrency(120)}</td>
              <td className="py-2 text-right font-black text-slate-900">{formatCurrency(120)}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="pt-4 space-y-6">
          <div className="text-left border-t border-dashed pt-4 space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{values.thankYouMessage || "Grazie per averci scelto!"}</p>
            <p className="text-[9px] text-slate-400 whitespace-pre-wrap">
              {values.termsAndConditions || "La merce venduta non si cambia."}
            </p>
          </div>

          {values.showSignature && (
            <div className="flex justify-end pt-4">
              <div className="border-t border-slate-400 w-32 text-center pt-1 text-[9px] font-bold text-slate-600">
                {values.signatureLabel || "Firma Autorizzata"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}