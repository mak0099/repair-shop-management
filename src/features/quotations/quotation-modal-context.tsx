"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Quotation } from "./quotations.schema"
import { QuotationForm } from "./components/quotation-form"
import { QuotationView } from "./components/quotation-view"

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
      
      <Dialog open={state.isOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden h-[90vh] flex flex-col">
          <DialogTitle className="sr-only">Quotation {state.isViewMode ? "View" : "Form"}</DialogTitle>
          {state.isViewMode && state.initialData ? (
            <QuotationView quotation={state.initialData} />
          ) : (
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
          )}
        </DialogContent>
      </Dialog>
    </QuotationModalContext.Provider>
  )
}

export const useQuotationModal = () => {
  const context = useContext(QuotationModalContext)
  if (!context) throw new Error("useQuotationModal must be used within QuotationModalProvider")
  return context
}