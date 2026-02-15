"use client"

import React, { createContext, useCallback, useContext, ReactNode } from "react"

import { useGlobalModal } from "@/components/shared/global-modal-context"
import { Customer } from "./customer.schema"

interface CustomerModalOptions {
  initialData?: Customer
  onSuccess?: (data: Customer) => void
  isViewMode?: boolean
}

interface CustomerModalContextType {
  openModal: (options?: CustomerModalOptions) => void
  closeModal: () => void
}

const CustomerModalContext = createContext<CustomerModalContextType | undefined>(undefined)

export function CustomerModalProvider({ children }: { children: ReactNode }) {
  const { openModal: openGlobalModal, closeModal: closeGlobalModal } = useGlobalModal()

  const openModal = useCallback(
    (options?: CustomerModalOptions) => {
      const { initialData, onSuccess, isViewMode } = options || {}
      const isEditMode = !!initialData && !isViewMode

      let title = "Add New Customer"
      let description = "Create a new customer record."
      if (isViewMode) {
        title = "View Customer"
        description = "View customer details."
      } else if (isEditMode) {
        title = "Edit Customer"
        description = "Update customer details."
      }

      openGlobalModal("customerForm", {
        title,
        description,
        className: "max-w-4xl max-h-[90vh] overflow-y-auto",
        initialData: initialData,
        isViewMode: isViewMode,
        onSuccess: (data: unknown) => {
          onSuccess?.(data as Customer)
          closeGlobalModal()
        },
      })
    },
    [openGlobalModal, closeGlobalModal]
  )

  const closeModal = useCallback(() => closeGlobalModal(), [closeGlobalModal])

  return (
    <CustomerModalContext.Provider value={{ openModal, closeModal }}>
      {children}
    </CustomerModalContext.Provider>
  )
}

export function useCustomerModal() {
  const context = useContext(CustomerModalContext)
  if (context === undefined) {
    throw new Error("useCustomerModal must be used within a CustomerModalProvider")
  }
  return context
}