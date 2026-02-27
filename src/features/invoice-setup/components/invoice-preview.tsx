"use client"

import { useFormContext } from "react-hook-form";
import { InvoiceSetup } from "../invoice-setup.schema";

export function InvoicePreview() {
  const { watch } = useFormContext<InvoiceSetup>();
  const values = watch();

  return (
    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 bg-white shadow-inner sticky top-6">
      <div className="text-center border-b pb-4 mb-4">
        <div className="h-8 w-24 bg-slate-100 mx-auto mb-2 rounded flex items-center justify-center text-[10px] text-slate-400">LOGO</div>
        <h4 className="font-bold uppercase text-xs">Arif Mobile & Gadget</h4>
      </div>
      
      <div className="flex justify-between text-[10px] mb-4">
        <div>
          <p>Bill To: Customer Name</p>
          <p>Phone: 017XXXXXXXX</p>
        </div>
        <div className="text-right font-mono">
          <p>Invoice: {values.invoicePrefix || "INV"}-{values.nextInvoiceNumber || "1001"}</p>
          <p>Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="min-h-[100px] border-y py-2 mb-4">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">Item</th>
              <th className="text-right py-1">Qty</th>
              <th className="text-right py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1">iPhone 15 Pro (IMEI: 3546...)</td>
              <td className="text-right py-1">1</td>
              <td className="text-right py-1">৳120,000</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <p className="text-[9px] font-bold">Terms & Conditions:</p>
        <p className="text-[8px] whitespace-pre-wrap text-slate-500 italic">
          {values.termsAndConditions || "No terms specified."}
        </p>
      </div>

      {values.showSignature && (
        <div className="mt-8 flex justify-end">
          <div className="border-t border-slate-400 w-32 text-center pt-1 text-[8px]">
            Authorized Signature
          </div>
        </div>
      )}
    </div>
  );
}