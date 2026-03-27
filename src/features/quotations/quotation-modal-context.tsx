"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from "react"
import { FileText } from "lucide-react"
import { Quotation } from "./quotations.schema"
import { QuotationForm } from "./components/quotation-form"
import { QuotationInvoiceView } from "./components/quotation-invoice-view"
import { PrintableDialog } from "@/components/shared/printable-dialog"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface QuotationModalState {
  isOpen: boolean
  initialData?: Quotation | null
  isViewMode: boolean
}

interface QuotationModalContextType {
  openModal: (args?: { initialData?: Quotation; isViewMode?: boolean }) => void
  closeModal: () => void
}

const QuotationModalContext = createContext<QuotationModalContextType | undefined>(undefined)

export function QuotationModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuotationModalState>({
    isOpen: false,
    initialData: null,
    isViewMode: false,
  })

  const openModal = useCallback(({ initialData, isViewMode = false }: { initialData?: Quotation | null, isViewMode?: boolean } = {}) => {
    setState({ isOpen: true, initialData: initialData || null, isViewMode })
  }, [])

  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  return (
    <QuotationModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      
      {state.isViewMode && state.initialData ? (
        <PrintableDialog
          isOpen={state.isOpen}
          onOpenChange={closeModal}
          title="Quotation / Estimate"
          icon={<FileText className="h-4 w-4" />}
          printableElementId="printable-quotation"
          className="max-w-4xl p-0 overflow-hidden h-[95vh]"
        >
          <QuotationInvoiceView quotation={state.initialData} />
        </PrintableDialog>
      ) : (
        <Dialog open={state.isOpen && !state.isViewMode} onOpenChange={closeModal}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden h-[95vh] flex flex-col">
            <DialogTitle className="sr-only">Quotation Form</DialogTitle>
            <QuotationForm 
              initialData={state.initialData} 
              onSuccess={(data) => {
                if (data) {
                  openModal({ initialData: data, isViewMode: true })
                } else {
                  closeModal()
                }
              }} 
            />
          </DialogContent>
        </Dialog>
      )}
    </QuotationModalContext.Provider>
  )
}

export const useQuotationModal = () => {
  const context = useContext(QuotationModalContext)
  if (!context) throw new Error("useQuotationModal must be used within QuotationModalProvider")
  return context
}