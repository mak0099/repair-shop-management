"use client"

import Image from "next/image"
import { Acceptance } from "../../acceptance.schema"
import { format } from "date-fns"
import { useInvoiceSetup } from "@/features/invoice-setup/invoice-setup.api"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"
import { REPAIR_STATUS_OPTIONS, getStatusColors, STATUS_COLORS } from "../../acceptance.constants"

type InvoiceType = "PENDING" | "IN_PROGRESS" | "READY" | "DELIVERY"

interface AcceptanceInvoiceViewProps {
  acceptance: Acceptance
  invoiceType?: InvoiceType
}

export function AcceptanceInvoiceView({ acceptance, invoiceType = "DELIVERY" }: AcceptanceInvoiceViewProps) {
  const invoiceSetupQuery = useInvoiceSetup()
  const shopProfileQuery = useShopProfile()

  const invoiceSetup = invoiceSetupQuery.data
  const shopProfile = shopProfileQuery.data

  const isLoading = invoiceSetupQuery.isLoading || shopProfileQuery.isLoading

  if (isLoading || !invoiceSetup || !shopProfile) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Loading receipt...</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: shopProfile?.currency || 'BDT' 
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    if (!invoiceSetup?.dateFormat) return new Date(date).toLocaleDateString('en-IN')
    try {
      return format(new Date(date), invoiceSetup.dateFormat)
    } catch {
      return new Date(date).toLocaleDateString('en-IN')
    }
  }

  const statusLabel = REPAIR_STATUS_OPTIONS.find(opt => opt.value === acceptance.currentStatus)?.label || acceptance.currentStatus

  // Determine invoice title based on type
  const getInvoiceTitle = () => {
    switch(invoiceType) {
      case "PENDING": return "REPAIR ESTIMATE"
      case "IN_PROGRESS": return "REPAIR PROGRESS"
      case "READY": return "REPAIR READY"
      case "DELIVERY": return "RECEIPT"
      default: return "RECEIPT"
    }
  }

  // Determine if we should show parts section
  const showParts = invoiceType !== "PENDING" && acceptance.partsUsed && acceptance.partsUsed.length > 0

  const subtotal = acceptance.totalCost || 0
  const advancePaid = acceptance.advancePayment || 0
  const finalPayment = acceptance.finalPayment || 0
  const balanceDue = Math.max(0, subtotal - advancePaid - finalPayment)

  return (
    <>
      {/* The Actual Invoice Content - Scrollable */}
      <div id="printable-invoice" className="p-8 md:p-12 print:p-3 overflow-y-auto print:overflow-y-visible h-full">
        <div className="max-w-[800px] mx-auto space-y-6 print:space-y-2">

          {/* Company Info */}
          <div className="flex justify-between items-start border-b pb-6">
            <div className="space-y-1">
              {shopProfile.logoUrl && (
                <Image 
                  src={shopProfile.logoUrl} 
                  alt="Shop Logo" 
                  width={80} 
                  height={80} 
                  className="mb-2"
                />
              )}
              <h1 className="text-xl font-black">{shopProfile.name}</h1>
              <p className="text-xs text-muted-foreground">{shopProfile.address}</p>
              <p className="text-xs text-muted-foreground">{shopProfile.phone}</p>
              {shopProfile.email && <p className="text-xs text-muted-foreground">{shopProfile.email}</p>}
            </div>
            <div className="text-right space-y-1">
              <p className="text-2xl font-black tracking-tight">{getInvoiceTitle()}</p>
              <p className="text-xs font-bold text-muted-foreground">#{acceptance.acceptanceNumber}</p>
              <p className="text-xs text-muted-foreground">{formatDate(acceptance.acceptanceDate)}</p>
            </div>
          </div>

          {/* Customer & Device Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Customer</p>
              <p className="font-bold text-sm">{acceptance.customer?.name || 'N/A'}</p>
              <p className="text-xs text-muted-foreground">{acceptance.customer?.phone || acceptance.customer?.mobile || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Device Info</p>
              <p className="text-sm"><span className="font-semibold">{acceptance.brand?.name || 'N/A'}</span> {acceptance.model?.name || ''}</p>
              <p className="text-xs text-muted-foreground">IMEI: {acceptance.imei}</p>
              {acceptance.secondaryImei && <p className="text-xs text-muted-foreground">Secondary: {acceptance.secondaryImei}</p>}
            </div>
          </div>

          {/* Repair Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Reported Defect</p>
            <p className="text-sm">{acceptance.defectDescription || 'No description'}</p>
            {acceptance.notes && (
              <>
                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mt-3">Notes</p>
                <p className="text-sm">{acceptance.notes}</p>
              </>
            )}
          </div>

          {/* Parts Used - If Any */}
          {showParts && (
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Parts Used</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-0 text-xs font-black uppercase">Part Name</th>
                    <th className="text-right py-2 px-0 text-xs font-black uppercase">Qty</th>
                    <th className="text-right py-2 px-0 text-xs font-black uppercase">Unit Price</th>
                    <th className="text-right py-2 px-0 text-xs font-black uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptance.partsUsed.map((part, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-0 text-sm">{part.name}</td>
                      <td className="py-2 px-0 text-right text-sm">{part.quantity}</td>
                      <td className="py-2 px-0 text-right text-sm">{formatCurrency(part.price)}</td>
                      <td className="py-2 px-0 text-right text-sm font-semibold">{formatCurrency(part.price * part.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service/Labor Cost:</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            {advancePaid > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Advance Paid:</span>
                <span className="font-semibold text-emerald-600">-{formatCurrency(advancePaid)}</span>
              </div>
            )}
            {invoiceType === "DELIVERY" && (acceptance.finalPayment || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Final Payment:</span>
                <span className="font-semibold text-emerald-600">-{formatCurrency(acceptance.finalPayment || 0)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
              <span>Balance Due:</span>
              <span className={balanceDue > 0 ? "text-amber-600" : "text-emerald-600"}>
                {formatCurrency(balanceDue)}
              </span>
            </div>
          </div>

          {/* Status & Repair Timeline */}
          {(() => {
            const colors = getStatusColors(acceptance.currentStatus as keyof typeof STATUS_COLORS)
            return (
              <div className={`${colors.bg} p-4 rounded-lg space-y-2 border ${colors.accent}`}>
                <p className={`text-xs font-black uppercase ${colors.text} tracking-widest`}>Status</p>
                <p className={`text-sm font-bold ${colors.text}`}>{statusLabel}</p>
                {acceptance.technician?.name && (
                  <p className={`text-xs ${colors.text}`}>Technician: <span className="font-semibold">{acceptance.technician.name}</span></p>
                )}
              </div>
            )
          })()}

          {/* Footer with Terms */}
          {invoiceSetup.thankYouMessage && (
            <div className="text-center pt-6 border-t text-xs text-muted-foreground space-y-1">
              <p>{invoiceSetup.thankYouMessage}</p>
            </div>
          )}

          {/* Signature Line */}
          <div className="grid grid-cols-2 gap-8 pt-8 print:pt-12">
            <div className="space-y-6">
              <div className="border-t border-gray-400"></div>
              <p className="text-xs text-muted-foreground text-center font-semibold">Customer Signature</p>
            </div>
            <div className="space-y-6">
              <div className="border-t border-gray-400"></div>
              <p className="text-xs text-muted-foreground text-center font-semibold">Shop Representative</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
