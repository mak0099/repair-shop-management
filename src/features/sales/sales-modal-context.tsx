"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Sale } from "./sales.schema"

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
      {state.isOpen && state.sale && (
        <SalesModal sale={state.sale} onClose={closeModal} />
      )}
    </SalesModalContext.Provider>
  )
}

// Internal Modal Component
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { InvoiceView } from "./components/invoice-view"

function SalesModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden h-[90vh] flex flex-col">
        <InvoiceView sale={sale} />
      </DialogContent>
    </Dialog>
  )
}

export const useSalesModal = () => {
  const context = useContext(SalesModalContext)
  if (!context) throw new Error("useSalesModal must be used within SalesModalProvider")
  return context
}