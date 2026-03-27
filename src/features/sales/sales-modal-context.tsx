"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Receipt } from "lucide-react"
import { Sale } from "./sales.schema"
import { PrintableDialog } from "@/components/shared/printable-dialog"
import { SaleInvoiceView } from "./components/sale-invoice-view"

interface SalesModalState {
  sale: Sale | null
  isOpen: boolean
}

interface SalesModalContextType {
  openInvoice: (sale: Sale) => void
  closeModal: () => void
}

const SalesModalContext = createContext<SalesModalContextType | undefined>(undefined)

export function SalesModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SalesModalState>({ sale: null, isOpen: false })

  const openInvoice = (sale: Sale) => setState({ sale, isOpen: true })
  const closeModal = () => setState({ sale: null, isOpen: false })

  return (
    <SalesModalContext.Provider value={{ openInvoice, closeModal }}>
      {children}
      {state.sale && (
        <PrintableDialog
          isOpen={state.isOpen}
          onOpenChange={closeModal}
          title="Sales Invoice"
          icon={<Receipt className="h-4 w-4" />}
          printableElementId="printable-sale-invoice"
          className="max-w-4xl p-0 overflow-hidden h-[95vh]"
        >
          <SaleInvoiceView sale={state.sale} />
        </PrintableDialog>
      )}
    </SalesModalContext.Provider>
  )
}

export const useSalesModal = () => {
  const context = useContext(SalesModalContext)
  if (!context) throw new Error("useSalesModal must be used within SalesModalProvider")
  return context
}