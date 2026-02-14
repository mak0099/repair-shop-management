"use client";

import React, { createContext, useState, useCallback, useContext, ReactNode } from "react";
import { Modal } from "@/components/shared/modal";
import { modalRegistry, ModalType } from "@/config/modal-config";

interface ModalProps {
  onSuccess?: (data?: unknown) => void;
  title?: string;
  description?: string;
  className?: string;
  [key: string]: unknown; // Allow any other props
}

interface ActiveModal {
  type: ModalType;
  props: ModalProps;
}

interface GlobalModalContextType {
  openModal: (type: ModalType, props?: ModalProps) => void;
  closeModal: () => void;
}

const GlobalModalContext = createContext<GlobalModalContextType | undefined>(undefined);

export function GlobalModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);

  const openModal = useCallback((type: ModalType, props: ModalProps = {}) => {
    setActiveModal({ type, props });
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const renderModalContent = () => {
    if (!activeModal) return null;

    const { type, props } = activeModal;

    // Find the component from the registry
    const modalConfig = modalRegistry.find((m) => m.type === type);
    if (!modalConfig) {
      console.error(`No modal registered for type: ${type}`);
      return null;
    }

    const ContentComponent = modalConfig.contentComponent;
    return <ContentComponent onSuccess={props.onSuccess || closeModal} {...props} />;
  };

  return (
    <GlobalModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Modal title={activeModal?.props.title || "Modal"} description={activeModal?.props.description} isOpen={!!activeModal} onClose={closeModal} className={activeModal?.props.className}>
        {renderModalContent()}
      </Modal>
    </GlobalModalContext.Provider>
  );
}

export function useGlobalModal() {
  const context = useContext(GlobalModalContext);
  if (context === undefined) {
    throw new Error("useGlobalModal must be used within a GlobalModalProvider");
  }
  return context;
}