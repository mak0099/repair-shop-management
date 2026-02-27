"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface InvoiceSetupModalContextType {
  openModal: () => void
  closeModal: () => void
}

const InvoiceSetupModalContext = createContext<InvoiceSetupModalContextType | undefined>(undefined)

export function InvoiceSetupProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])

  return (
    <InvoiceSetupModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {/* You can add a specific Setup Modal here if needed, 
          but usually invoice setup is a direct page form. */}
    </InvoiceSetupModalContext.Provider>
  )
}

export function useInvoiceSetupModal() {
  const context = useContext(InvoiceSetupModalContext)
  if (!context) throw new Error("useInvoiceSetupModal must be used within an InvoiceSetupProvider")
  return context
}