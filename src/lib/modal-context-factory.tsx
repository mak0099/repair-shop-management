"use client"

import React, { createContext, useCallback, useContext, ReactNode } from "react"
import { useGlobalModal } from "@/components/shared/global-modal-context"

/**
 * Generic options for opening a feature-specific modal.
 */
interface ModalOptions<T> {
  initialData?: T
  onSuccess?: (data: T) => void
  isViewMode?: boolean
}

/**
 * Generic context type for a feature-specific modal.
 */
interface ModalContextType<T> {
  openModal: (options?: ModalOptions<T>) => void
  closeModal: () => void
}

/**
 * Configuration for the modal context factory.
 */
interface ModalConfig {
  featureName: string
  formName: string
  modalClassName?: string
  addTitle?: string
  addDescription?: string
  editTitle?: string
  editDescription?: string
  viewTitle?: string
  viewDescription?: string
}

export function createModalContext<T extends { id: string }>(config: ModalConfig) {
  const {
    featureName,
    formName,
    modalClassName,
    addTitle = `Add New ${featureName}`,
    addDescription = `Create a new ${featureName.toLowerCase()}.`,
    editTitle = `Edit ${featureName}`,
    editDescription = `Update ${featureName.toLowerCase()} details.`,
    viewTitle = `View ${featureName}`,
    viewDescription = `View ${featureName.toLowerCase()} details.`,
  } = config

  const Context = createContext<ModalContextType<T> | undefined>(undefined)

  function useModalLogic(): ModalContextType<T> {
    const { openModal: openGlobalModal, closeModal: closeGlobalModal } = useGlobalModal()

    const openModal = useCallback(
      (options?: ModalOptions<T>) => {
        const { initialData, onSuccess, isViewMode } = options || {}
        const isEditMode = !!initialData && !isViewMode

        let title = addTitle
        let description = addDescription
        if (isViewMode) {
          title = viewTitle
          description = viewDescription
        } else if (isEditMode) {
          title = editTitle
          description = editDescription
        }

        openGlobalModal(formName, {
          title,
          description,
          className: modalClassName,
          initialData,
          isViewMode,
          onSuccess: (data: unknown) => {
            onSuccess?.(data as T)
            closeGlobalModal()
          },
        })
      },
      [openGlobalModal, closeGlobalModal, addTitle, addDescription, viewTitle, viewDescription, editTitle, editDescription, formName, modalClassName]
    )

    const closeModal = useCallback(() => closeGlobalModal(), [closeGlobalModal])

    return { openModal, closeModal }
  }

  function ModalProvider({ children }: { children: ReactNode }) {
    const modalLogic = useModalLogic()
    return <Context.Provider value={modalLogic}>{children}</Context.Provider>
  }

  function useModal() {
    const context = useContext(Context)
    if (context) {
      return context
    }
    // Fallback for use outside of provider, useful for nested modals.
    return useModalLogic()
  }

  return { ModalProvider, useModal }
}