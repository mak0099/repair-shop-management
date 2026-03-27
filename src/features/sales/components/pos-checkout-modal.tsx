"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { ArrowRight, Receipt } from "lucide-react"

import { usePOS } from "../pos-context"
import { SaleInvoiceView } from "./sale-invoice-view"
import { POSCheckoutForm } from "./pos-checkout-form"
import { Sale } from "../sales.schema"
import { PrintableDialog } from "@/components/shared/printable-dialog"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function POSCheckoutModal({ disabled }: { disabled: boolean }) {
  const { cart, totals, selectedCustomerId, selectedCustomerName, clearCart } = usePOS()
  const [open, setOpen] = useState(false)
  const [completedSale, setCompletedSale] = useState<Sale | null>(null)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [formKey, setFormKey] = useState(0) // Increment to remount form

  // Validation helper
  const getValidationErrors = () => {
    const errors: string[] = []
    
    if (!selectedCustomerId || selectedCustomerId.trim() === "") {
      errors.push("Please select a customer for this sale")
    }
    
    const itemsWithoutPrice = cart.filter(i => !i.price || i.price <= 0)
    if (itemsWithoutPrice.length > 0) {
      itemsWithoutPrice.forEach(item => {
        errors.push(`Please enter sale price for '${item.name}'`)
      })
    }
    
    const itemsWithoutIMEI = cart.filter(i => i.isSerialized && (!i.selectedIMEI || i.selectedIMEI.trim() === ""))
    if (itemsWithoutIMEI.length > 0) {
      itemsWithoutIMEI.forEach(item => {
        errors.push(`Please enter IMEI for '${item.name}'`)
      })
    }
    
    return errors
  }

  // Handle invoice dialog close
  const handleInvoiceDialogClose = useCallback(
    (isOpen: boolean) => {
      setInvoiceDialogOpen(isOpen)
      // When invoice dialog closes, close main dialog and clear cart
      if (!isOpen && completedSale) {
        setOpen(false)
        setFormKey(prev => prev + 1)
        setCompletedSale(null)
        clearCart()
      }
    },
    [completedSale, clearCart]
  )

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Reset by remounting form (increment key)
      setFormKey(prev => prev + 1)
      setCompletedSale(null)
    }
  }

  const handleCheckoutClick = () => {
    const errors = getValidationErrors()
    
    if (errors.length > 0) {
      toast.error(errors[0])
      errors.slice(1).forEach(error => toast.error(error))
      return
    }
    
    // Reset form to get fresh context values
    setFormKey(prev => prev + 1)
    setOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <Button 
          onClick={handleCheckoutClick}
          className="w-full bg-primary hover:bg-primary/90 font-bold h-12 text-base shadow-md shadow-primary/20 transition-all active:scale-[0.98]" 
          disabled={disabled}
        >
          PROCEED TO PAYMENT
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <DialogContent className="sm:max-w-[600px]">
          <POSCheckoutForm
            key={formKey}
            customerId={selectedCustomerId}
            customerName={selectedCustomerName}
            cart={cart}
            totals={totals}
            onSuccess={(sale) => {
              // Store sale and open invoice dialog
              setCompletedSale(sale)
              setInvoiceDialogOpen(true)
              setOpen(false) // Close checkout modal
            }}
            onClose={() => handleOpenChange(false)}
            onClearCart={undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Auto-open Invoice Print Dialog after Sale Creation */}
      {completedSale && (
        <PrintableDialog
          isOpen={invoiceDialogOpen}
          onOpenChange={handleInvoiceDialogClose}
          title="Sales Invoice"
          icon={<Receipt className="h-4 w-4" />}
          printableElementId="printable-sale-invoice"
          className="max-w-4xl p-0 overflow-hidden h-[95vh]"
        >
          <SaleInvoiceView sale={completedSale} />
        </PrintableDialog>
      )}
    </>
  )
}
