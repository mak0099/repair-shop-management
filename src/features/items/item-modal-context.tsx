"use client"
import React, { createContext, useCallback, useContext, ReactNode } from "react";
import { useGlobalModal } from "@/components/shared/global-modal-context";
import { Item } from "./item.schema";

interface ItemModalOptions {
  initialData?: Item
  onSuccess?: (data: Item) => void
  isViewMode?: boolean
}

interface ItemModalContextType {
  openModal: (options?: ItemModalOptions) => void;
  closeModal: () => void;
}

const ItemModalContext = createContext<ItemModalContextType | undefined>(undefined);

export function ItemModalProvider({ children }: { children: ReactNode }) {
  const { openModal: openGlobalModal, closeModal: closeGlobalModal } = useGlobalModal();

  const openModal = useCallback(
    (options?: ItemModalOptions) => {
      const { initialData, onSuccess, isViewMode } = options || {}
      const isEditMode = !!initialData && !isViewMode

      let title = "Add New Item"
      let description = "Create a new inventory item."
      if (isViewMode) {
        title = "View Item"
        description = "View item details."
      } else if (isEditMode) {
        title = "Edit Item"
        description = "Update item details."
      }

      openGlobalModal("itemForm", {
        title,
        description,
        className: "max-w-3xl",
        initialData,
        isViewMode,
        onSuccess: (data: unknown) => {
          options?.onSuccess?.(data as Item)
          closeGlobalModal()
        },
      })
    },
    [openGlobalModal, closeGlobalModal]
  )

  const closeModal = useCallback(() => closeGlobalModal(), [closeGlobalModal]);

  return (
    <ItemModalContext.Provider value={{ openModal, closeModal }}>
      {children}
    </ItemModalContext.Provider>
  );
}

export function useItemModal() {
  const context = useContext(ItemModalContext);
  if (context === undefined) {
    throw new Error("useItemModal must be used within an ItemModalProvider");
  }
  return context;
}
