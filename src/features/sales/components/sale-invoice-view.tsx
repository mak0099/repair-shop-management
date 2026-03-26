"use client"

import Image from "next/image"
import { Smartphone, Wrench } from "lucide-react"
import { Sale } from "../sales.schema"
import { format } from "date-fns"
import { useInvoiceSetup } from "@/features/invoice-setup/invoice-setup.api"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"

interface SaleInvoiceViewProps {
  sale: Sale
}

export function SaleInvoiceView({ sale }: SaleInvoiceViewProps) {
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

  return (
    <>
      {/* The Actual Invoice Content - Scrollable */}
      <div id="printable-sale-invoice" className="p-8 md:p-12 print:p-3 overflow-y-auto print:overflow-y-visible h-full">
        <div className="max-w-[800px] mx-auto space-y-6 print:space-y-2">

          {/* Company Info */}
          <div className="flex justify-between items-start border-b pb-6">
            <div className="space-y-1">
              {invoiceSetup?.showLogo !== false && shopProfile.logoUrl && (
                <Image
                  src={shopProfile.logoUrl}
                  alt="Shop Logo"
                  width={80}
                  height={80}
                  className="mb-2"
                />
              )}
              <h1 className="text-xl font-black">{invoiceSetup?.shopName || shopProfile.name}</h1>
              <p className="text-xs text-muted-foreground">{invoiceSetup?.shopAddress || shopProfile.address}</p>
              <p className="text-xs text-muted-foreground">{invoiceSetup?.shopContact || [shopProfile.phone, shopProfile.email].filter(Boolean).join(' • ')}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-2xl font-black tracking-tight">{invoiceSetup?.invoiceTitle || 'SALES INVOICE'}</p>
              <p className="text-xs font-bold text-muted-foreground">{invoiceSetup?.invoiceNumberLabel || 'Invoice #'}: {sale.invoiceNumber}</p>
              <p className="text-xs text-muted-foreground">{invoiceSetup?.dateLabel || 'Date'}: {formatDate(new Date(sale.createdAt))}</p>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">{invoiceSetup?.customerInfoLabel || 'Customer'}</p>
              <p className="font-bold text-sm">{sale.customerName || 'Walk-in Customer'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">{invoiceSetup?.paymentMethodLabel || 'Payment Method'}</p>
              <p className="text-sm font-semibold uppercase">{sale.paymentMethod}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-0 text-xs font-black uppercase">{invoiceSetup?.itemColumnLabel || 'Product / Service'}</th>
                  <th className="text-center py-2 px-0 text-xs font-black uppercase">{invoiceSetup?.quantityColumnLabel || 'Qty'}</th>
                  <th className="text-right py-2 px-0 text-xs font-black uppercase">{invoiceSetup?.priceColumnLabel || 'Unit Price'}</th>
                  <th className="text-right py-2 px-0 text-xs font-black uppercase">{invoiceSetup?.totalColumnLabel || 'Total'}</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3 px-0">
                      <div className="space-y-1">
                        <span className="font-bold text-sm block">{item.name}</span>
                        <div className="flex items-center gap-2">
                          {item.type === "SERVICE" ? (
                            <span className="inline-flex items-center gap-1 text-[8px] text-green-600 dark:text-green-500 font-bold uppercase bg-green-500/10 px-2 py-1 rounded">
                              <Wrench className="h-2.5 w-2.5" /> Service
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[8px] text-blue-600 dark:text-blue-500 font-bold uppercase bg-blue-500/10 px-2 py-1 rounded">
                              Product
                            </span>
                          )}
                          {item.sku && (
                            <span className="text-[8px] text-muted-foreground font-mono">{item.sku}</span>
                          )}
                        </div>
                        {item.isSerialized && item.selectedIMEI && (
                          <div className="flex items-center gap-1 text-[8px] text-muted-foreground mt-1">
                            <Smartphone className="h-2.5 w-2.5" />
                            <span className="font-mono font-bold">SN: {item.selectedIMEI}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-0 text-center font-bold text-sm">{item.quantity}</td>
                    <td className="py-3 px-0 text-right text-sm">{formatCurrency(item.price)}</td>
                    <td className="py-3 px-0 text-right text-sm font-semibold">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary */}
          <div className="space-y-2 border-t pt-4 flex justify-end">
            <div className="w-64">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{invoiceSetup?.subtotalLabel || 'Subtotal'}:</span>
                <span className="font-semibold">{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{invoiceSetup?.taxLabel || 'Tax'}:</span>
                <span className="font-semibold">{formatCurrency(sale.totalTax)}</span>
              </div>
              {sale.totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{invoiceSetup?.discountLabel || 'Discount'}:</span>
                  <span className="font-semibold text-amber-600">-{formatCurrency(sale.totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                <span>{invoiceSetup?.grandTotalLabel || 'Grand Total'}:</span>
                <span>{formatCurrency(sale.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-emerald-600 pt-1">
                <span>{invoiceSetup?.amountPaidLabel || 'Amount Received'}:</span>
                <span>{formatCurrency(sale.amountReceived)}</span>
              </div>
            </div>
          </div>

          {/* Footer with Terms */}
          {invoiceSetup.thankYouMessage && (
            <div className="text-center pt-6 border-t text-xs text-muted-foreground space-y-1">
              <p>{invoiceSetup.thankYouMessage}</p>
              {invoiceSetup.termsAndConditions && (
                <p className="whitespace-pre-wrap text-[10px]">{invoiceSetup.termsAndConditions}</p>
              )}
            </div>
          )}

          {/* Signature Line */}
          {invoiceSetup?.showSignature !== false && (
            <div className="grid grid-cols-2 gap-8 pt-8 print:pt-12">
              <div className="space-y-6">
                <div className="border-t border-gray-400"></div>
                <p className="text-xs text-muted-foreground text-center font-semibold">Customer Signature</p>
              </div>
              <div className="space-y-6">
                <div className="border-t border-gray-400"></div>
                <p className="text-xs text-muted-foreground text-center font-semibold">{invoiceSetup?.signatureLabel || 'Shop Representative'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}