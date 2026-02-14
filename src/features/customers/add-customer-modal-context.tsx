"use client"

import React, { createContext, useCallback, useContext, ReactNode } from "react"

import { useGlobalModal } from "@/components/shared/global-modal-context"
import { Customer } from "./customer.schema"

interface AddCustomerModalContextType {
  openModal: (options?: { onSuccess?: (data: Customer) => void }) => void
  closeModal: () => void
}

const AddCustomerModalContext = createContext<AddCustomerModalContextType | undefined>(undefined)

export function AddCustomerModalProvider({ children }: { children: ReactNode }) {
  const { openModal: openGlobalModal, closeModal: closeGlobalModal } = useGlobalModal()

  const openModal = useCallback(
    (options?: { onSuccess?: (data: Customer) => void }) => {
      openGlobalModal("customerAdd", {
        title: "Add New Customer",
        description: "Create a new customer record.",
        className: "max-w-4xl max-h-[90vh] overflow-y-auto",
        onSuccess: (data) => {
          options?.onSuccess?.(data as Customer)
          closeGlobalModal()
        },
      })
    },
    [openGlobalModal, closeGlobalModal]
  )

  const closeModal = useCallback(() => closeGlobalModal(), [closeGlobalModal])

  return (
    <AddCustomerModalContext.Provider value={{ openModal, closeModal }}>
      {children}
    </AddCustomerModalContext.Provider>
  )
}

export function useAddCustomerModal() {
  const context = useContext(AddCustomerModalContext)
  if (context === undefined) {
    throw new Error("useAddCustomerModal must be used within an AddCustomerModalProvider")
  }
  return context
}