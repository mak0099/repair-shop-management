"use client"

import React, { createContext, useCallback, useContext, ReactNode } from "react"
import { useGlobalModal } from "@/components/shared/global-modal-context"

/**
 * Generic options for opening a feature-specific modal.
 */
interface BaseModalOptions<T> {
  initialData?: T
  onSuccess?: (data: T) => void
  isViewMode?: boolean
}

/**
 * Generic context type for a feature-specific modal.
 */
interface ModalContextType<T, O extends object> {
  openModal: (options?: BaseModalOptions<T> & O) => void
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

/**
 * Factory to create a specialized modal context for any feature.
 * FIX: Changed T constraint from { id: string } to { id?: string } 
 * to support resources where the ID might be optional (e.g., during creation).
 */
export function createModalContext<
  T extends { id?: string }, 
  O extends object = object,
>(config: ModalConfig) {
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

  const Context = createContext<ModalContextType<T, O> | undefined>(undefined)

  function useModalLogic(): ModalContextType<T, O> {
    const { openModal: openGlobalModal, closeModal: closeGlobalModal } = useGlobalModal()

    const openModal = useCallback(
      (options?: BaseModalOptions<T> & O) => {
        const { initialData, onSuccess, isViewMode, ...rest } = options || {}
        
        /**
         * Determines if we are in Edit mode based on the presence of initialData.
         */
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
          ...rest,
        })
      },
      [openGlobalModal, closeGlobalModal]
    )

    const closeModal = useCallback(() => closeGlobalModal(), [closeGlobalModal])

    return { openModal, closeModal }
  }

  function ModalProvider({ children }: { children: ReactNode }) {
    const modalLogic = useModalLogic()
    return <Context.Provider value={modalLogic}>{children}</Context.Provider>
  }

  function useModal() {
    const modalLogic = useModalLogic()
    const context = useContext(Context)
    if (context) {
      return context
    }
    return modalLogic
  }

  return { ModalProvider, useModal }
}