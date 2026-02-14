"use client"
import React, { createContext, useState, useCallback, useContext, ReactNode } from "react";
import { useGlobalModal } from "@/components/shared/global-modal-context";
import { Brand } from "./brand.schema";

interface AddBrandModalContextType {
  openModal: (options?: { onSuccess?: (data: Brand) => void }) => void;
  closeModal: () => void;
}

// This context is now only for providing the open/close functions, not rendering the modal itself.
const AddBrandModalContext = createContext<AddBrandModalContextType | undefined>(undefined);

export function AddBrandModalProvider({ children }: { children: ReactNode }) {
  const { openModal: openGlobalModal, closeModal: closeGlobalModal } = useGlobalModal();

  const openModal = useCallback(
    (options?: { onSuccess?: (data: Brand) => void }) => {
      openGlobalModal("brandAdd", {
        title: "Add New Brand",
        description: "Create a new device brand.",
        className: "max-w-lg",
        onSuccess: (data) => {
          options?.onSuccess?.(data as Brand)
          closeGlobalModal()
        },
      })
    },
    [openGlobalModal, closeGlobalModal]
  )

  const closeModal = useCallback(() => closeGlobalModal(), [closeGlobalModal]);

  return (
    <AddBrandModalContext.Provider value={{ openModal, closeModal }}>
      {children}
    </AddBrandModalContext.Provider>
  );
}

export function useAddBrandModal() {
  const context = useContext(AddBrandModalContext);
  if (context === undefined) {
    throw new Error("useAddBrandModal must be used within an AddBrandModalProvider");
  }
  return context;
}