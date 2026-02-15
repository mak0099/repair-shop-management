"use client"
import React, { createContext, useCallback, useContext, ReactNode } from "react";
import { useGlobalModal } from "@/components/shared/global-modal-context";
import { Supplier } from "./supplier.schema";

interface SupplierModalOptions {
  initialData?: Supplier
  onSuccess?: (data: Supplier) => void
  isViewMode?: boolean
}

interface SupplierModalContextType {
  openModal: (options?: SupplierModalOptions) => void;
  closeModal: () => void;
}

const SupplierModalContext = createContext<SupplierModalContextType | undefined>(undefined);

export function SupplierModalProvider({ children }: { children: ReactNode }) {
  const { openModal: openGlobalModal, closeModal: closeGlobalModal } = useGlobalModal();

  const openModal = useCallback(
    (options?: SupplierModalOptions) => {
      const { initialData, onSuccess, isViewMode } = options || {}
      const isEditMode = !!initialData && !isViewMode

      let title = "Add New Supplier"
      let description = "Create a new supplier."
      if (isViewMode) {
        title = "View Supplier"
        description = "View supplier details."
      } else if (isEditMode) {
        title = "Edit Supplier"
        description = "Update supplier details."
      }

      openGlobalModal("supplierForm", {
        title,
        description,
        className: "max-w-3xl",
        initialData,
        isViewMode,
        onSuccess: (data: unknown) => {
          options?.onSuccess?.(data as Supplier)
          closeGlobalModal()
        },
      })
    },
    [openGlobalModal, closeGlobalModal]
  )

  const closeModal = useCallback(() => closeGlobalModal(), [closeGlobalModal]);

  return (
    <SupplierModalContext.Provider value={{ openModal, closeModal }}>
      {children}
    </SupplierModalContext.Provider>
  );
}

export function useSupplierModal() {
  const context = useContext(SupplierModalContext);
  if (context === undefined) {
    throw new Error("useSupplierModal must be used within a SupplierModalProvider");
  }
  return context;
}
