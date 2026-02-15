"use client"
import React, { createContext, useCallback, useContext, ReactNode } from "react";
import { useGlobalModal } from "@/components/shared/global-modal-context";
import { Category } from "./category.schema";

interface CategoryModalOptions {
  initialData?: Category
  onSuccess?: (data: Category) => void
  isViewMode?: boolean
}

interface CategoryModalContextType {
  openModal: (options?: CategoryModalOptions) => void;
  closeModal: () => void;
}

const CategoryModalContext = createContext<CategoryModalContextType | undefined>(undefined);

export function CategoryModalProvider({ children }: { children: ReactNode }) {
  const { openModal: openGlobalModal, closeModal: closeGlobalModal } = useGlobalModal();

  const openModal = useCallback(
    (options?: CategoryModalOptions) => {
      const { initialData, onSuccess, isViewMode } = options || {}
      const isEditMode = !!initialData && !isViewMode

      let title = "Add New Category"
      let description = "Create a new category."
      if (isViewMode) {
        title = "View Category"
        description = "View category details."
      } else if (isEditMode) {
        title = "Edit Category"
        description = "Update category details."
      }

      openGlobalModal("categoryForm", {
        title,
        description,
        className: "max-w-lg",
        initialData,
        isViewMode,
        onSuccess: (data: unknown) => {
          options?.onSuccess?.(data as Category)
          closeGlobalModal()
        },
      })
    },
    [openGlobalModal, closeGlobalModal]
  )

  const closeModal = useCallback(() => closeGlobalModal(), [closeGlobalModal]);

  return (
    <CategoryModalContext.Provider value={{ openModal, closeModal }}>
      {children}
    </CategoryModalContext.Provider>
  );
}

export function useCategoryModal() {
  const context = useContext(CategoryModalContext);
  if (context === undefined) {
    throw new Error("useCategoryModal must be used within a CategoryModalProvider");
  }
  return context;
}
