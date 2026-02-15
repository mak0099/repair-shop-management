"use client"
import React, { createContext, useCallback, useContext, ReactNode } from "react";
import { useGlobalModal } from "@/components/shared/global-modal-context";
import { User } from "./user.schema";

interface UserModalOptions {
  initialData?: User
  onSuccess?: (data: User) => void
  isViewMode?: boolean
}

interface UserModalContextType {
  openModal: (options?: UserModalOptions) => void;
  closeModal: () => void;
}

const UserModalContext = createContext<UserModalContextType | undefined>(undefined);

export function UserModalProvider({ children }: { children: ReactNode }) {
  const { openModal: openGlobalModal, closeModal: closeGlobalModal } = useGlobalModal();

  const openModal = useCallback(
    (options?: UserModalOptions) => {
      const { initialData, onSuccess, isViewMode } = options || {}
      const isEditMode = !!initialData && !isViewMode

      let title = "Add New User"
      let description = "Create a new system user."
      if (isViewMode) {
        title = "View User"
        description = "View user details."
      } else if (isEditMode) {
        title = "Edit User"
        description = "Update user details."
      }

      openGlobalModal("userForm", {
        title,
        description,
        className: "max-w-lg",
        initialData,
        isViewMode,
        onSuccess: (data: unknown) => {
          options?.onSuccess?.(data as User)
          closeGlobalModal()
        },
      })
    },
    [openGlobalModal, closeGlobalModal]
  )

  const closeModal = useCallback(() => closeGlobalModal(), [closeGlobalModal]);

  return (
    <UserModalContext.Provider value={{ openModal, closeModal }}>
      {children}
    </UserModalContext.Provider>
  );
}

export function useUserModal() {
  const context = useContext(UserModalContext);
  if (context === undefined) {
    throw new Error("useUserModal must be used within a UserModalProvider");
  }
  return context;
}
