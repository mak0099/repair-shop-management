"use client"
import React, { createContext, useCallback, useContext, ReactNode } from "react"

import { useGlobalModal } from "@/components/shared/global-modal-context";
import { Brand } from "./brand.schema";

interface BrandModalOptions {
  initialData?: Brand
  onSuccess?: (data: Brand) => void
  isViewMode?: boolean
}

interface BrandModalContextType {
  openModal: (options?: BrandModalOptions) => void
  closeModal: () => void;
}

/**
 * Private hook for the modal logic. This is not exported and is used
 * by the Provider and the public hook.
 */
function useBrandModalLogic(): BrandModalContextType {
  const { openModal: openGlobalModal, closeModal: closeGlobalModal } = useGlobalModal();

  const openModal = useCallback(
    (options?: BrandModalOptions) => {
      const { initialData, onSuccess, isViewMode } = options || {};
      const isEditMode = !!initialData && !isViewMode;

      let title = "Add New Brand";
      let description = "Create a new device brand.";
      if (isViewMode) {
        title = "View Brand";
        description = "View brand details.";
      } else if (isEditMode) {
        title = "Edit Brand";
        description = "Update the details of this brand.";
      }

      openGlobalModal("brandForm", {
        title,
        description,
        className: "max-w-lg",
        initialData,
        isViewMode,
        onSuccess: (data: unknown) => {
          onSuccess?.(data as Brand);
          closeGlobalModal();
        },
      });
    },
    [openGlobalModal, closeGlobalModal]
  );

  const closeModal = useCallback(() => closeGlobalModal(), [closeGlobalModal]);

  return { openModal, closeModal };
}

const BrandModalContext = createContext<BrandModalContextType | undefined>(undefined);

export function BrandModalProvider({ children }: { children: ReactNode }) {
  const modalLogic = useBrandModalLogic();
  return <BrandModalContext.Provider value={modalLogic}>{children}</BrandModalContext.Provider>;
}

export function useBrandModal() {
  const context = useContext(BrandModalContext);
  if (context) {
    return context;
  }

  // Fallback for use outside of provider, needed for nested modals.
  return useBrandModalLogic();
}