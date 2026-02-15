"use client"
import React, { createContext, useCallback, useContext, ReactNode } from "react";
import { useGlobalModal } from "@/components/shared/global-modal-context";
import { Model } from "./model.schema";

interface ModelModalOptions {
  initialData?: Model
  onSuccess?: (data: Model) => void
  isViewMode?: boolean
}

interface ModelModalContextType {
  openModal: (options?: ModelModalOptions) => void;
  closeModal: () => void;
}

const ModelModalContext = createContext<ModelModalContextType | undefined>(undefined);

export function ModelModalProvider({ children }: { children: ReactNode }) {
  const { openModal: openGlobalModal, closeModal: closeGlobalModal } = useGlobalModal();

  const openModal = useCallback(
    (options?: ModelModalOptions) => {
      const { initialData, onSuccess, isViewMode } = options || {}
      const isEditMode = !!initialData && !isViewMode

      let title = "Add New Model"
      let description = "Create a new device model."
      if (isViewMode) {
        title = "View Model"
        description = "View model details."
      } else if (isEditMode) {
        title = "Edit Model"
        description = "Update model details."
      }

      openGlobalModal("modelForm", {
        title,
        description,
        className: "max-w-lg",
        initialData,
        isViewMode,
        onSuccess: (data: unknown) => {
          options?.onSuccess?.(data as Model)
          closeGlobalModal()
        },
      })
    },
    [openGlobalModal, closeGlobalModal]
  )

  const closeModal = useCallback(() => closeGlobalModal(), [closeGlobalModal]);

  return (
    <ModelModalContext.Provider value={{ openModal, closeModal }}>
      {children}
    </ModelModalContext.Provider>
  );
}

export function useModelModal() {
  const context = useContext(ModelModalContext);
  if (context === undefined) {
    throw new Error("useModelModal must be used within a ModelModalProvider");
  }
  return context;
}
