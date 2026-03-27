"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from "react"
import { RotateCcw } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { PrintableDialog } from "@/components/shared/printable-dialog"
import { SaleReturn } from "./returns.schema"
import { ReturnForm } from "./components/return-form"
import { ReturnInvoiceView } from "./components/return-invoice-view"

interface ReturnModalState {
  isOpen: boolean
  initialData?: SaleReturn | null
  isViewMode: boolean
}

interface ReturnModalContextType {
  openModal: (args?: { initialData?: SaleReturn; isViewMode?: boolean }) => void
  closeModal: () => void
}

const ReturnModalContext = createContext<ReturnModalContextType | undefined>(undefined)

export function ReturnModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReturnModalState>({
    isOpen: false,
    initialData: null,
    isViewMode: false,
  })

  const openModal = useCallback(({ initialData, isViewMode = false }: { initialData?: SaleReturn | null, isViewMode?: boolean } = {}) => {
    setState({ isOpen: true, initialData: initialData || null, isViewMode })
  }, [])

  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  return (
    <ReturnModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      
      {state.isViewMode && state.initialData ? (
        <PrintableDialog
          isOpen={state.isOpen}
          onOpenChange={closeModal}
          title="Return Receipt / Credit Note"
          icon={<RotateCcw className="h-4 w-4" />}
          printableElementId="printable-return"
          className="max-w-4xl p-0 overflow-hidden h-[95vh]"
        >
          <ReturnInvoiceView data={state.initialData} />
        </PrintableDialog>
      ) : (
        <Dialog open={state.isOpen && !state.isViewMode} onOpenChange={closeModal}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden h-[95vh] flex flex-col">
            <DialogTitle className="sr-only">Return Form</DialogTitle>
            <ReturnForm 
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
    </ReturnModalContext.Provider>
  )
}

export const useReturnModal = () => {
  const context = useContext(ReturnModalContext)
  if (!context) throw new Error("useReturnModal must be used within ReturnModalProvider")
  return context
}