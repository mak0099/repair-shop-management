"use client"
import React, { createContext, useCallback, useContext, ReactNode } from "react";
import { useGlobalModal } from "@/components/shared/global-modal-context";
import { MasterSetting } from "./master-setting.schema";

interface MasterSettingModalOptions {
  initialData?: MasterSetting
  onSuccess?: (data: MasterSetting) => void
  isViewMode?: boolean
}

interface MasterSettingModalContextType {
  openModal: (options?: MasterSettingModalOptions) => void;
  closeModal: () => void;
}

const MasterSettingModalContext = createContext<MasterSettingModalContextType | undefined>(undefined);

export function MasterSettingModalProvider({ children }: { children: ReactNode }) {
  const { openModal: openGlobalModal, closeModal: closeGlobalModal } = useGlobalModal();

  const openModal = useCallback(
    (options?: MasterSettingModalOptions) => {
      const { initialData, onSuccess, isViewMode } = options || {}
      const isEditMode = !!initialData && !isViewMode

      let title = "Add New Setting"
      let description = "Create a new lookup value."
      if (isViewMode) {
        title = "View Setting"
        description = "View setting details."
      } else if (isEditMode) {
        title = "Edit Setting"
        description = "Update setting details."
      }

      openGlobalModal("masterSettingForm", {
        title,
        description,
        className: "max-w-lg",
        initialData,
        isViewMode,
        onSuccess: (data: unknown) => {
          options?.onSuccess?.(data as MasterSetting)
          closeGlobalModal()
        },
      })
    },
    [openGlobalModal, closeGlobalModal]
  )

  const closeModal = useCallback(() => closeGlobalModal(), [closeGlobalModal]);

  return (
    <MasterSettingModalContext.Provider value={{ openModal, closeModal }}>
      {children}
    </MasterSettingModalContext.Provider>
  );
}

export function useMasterSettingModal() {
  const context = useContext(MasterSettingModalContext);
  if (context === undefined) {
    throw new Error("useMasterSettingModal must be used within a MasterSettingModalProvider");
  }
  return context;
}
