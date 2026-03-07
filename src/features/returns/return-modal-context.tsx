"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
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

  const openModal = useCallback(({ initialData = null, isViewMode = false } = {}) => {
    setState({ isOpen: true, initialData, isViewMode })
  }, [])

  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  return (
    <ReturnModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      
      <Dialog open={state.isOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden h-[90vh] flex flex-col">
          {state.isViewMode && state.initialData ? (
            <ReturnInvoiceView data={state.initialData} />
          ) : (
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
          )}
        </DialogContent>
      </Dialog>
    </ReturnModalContext.Provider>
  )
}

export const useReturnModal = () => {
  const context = useContext(ReturnModalContext)
  if (!context) throw new Error("useReturnModal must be used within ReturnModalProvider")
  return context
}