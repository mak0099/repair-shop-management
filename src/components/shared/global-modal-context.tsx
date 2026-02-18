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
  const [activeModals, setActiveModals] = useState<ActiveModal[]>([]);

  const openModal = useCallback((type: ModalType, props: ModalProps = {}) => {
    setActiveModals((prev) => [...prev, { type, props }]);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModals((prev) => prev.slice(0, -1));
  }, []);

  const currentModal = activeModals.length > 0 ? activeModals[activeModals.length - 1] : null;

  const renderModalContents = () => {
    return activeModals.map((modal, index) => {
      const { type, props } = modal;
      const modalConfig = modalRegistry.find((m) => m.type === type);

      if (!modalConfig) {
        console.error(`No modal registered for type: ${type}`);
        return null;
      }

      const ContentComponent = modalConfig.contentComponent;
      const isTopModal = index === activeModals.length - 1;

      const handleClose = () => {
        if (isTopModal) {
          closeModal();
        }
      };

      return (
        <div key={`${type}-${index}`} style={{ display: isTopModal ? "block" : "none" }}>
          <ContentComponent onSuccess={props.onSuccess || handleClose} {...props} />
        </div>
      );
    });
  };

  return (
    <GlobalModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Modal title={currentModal?.props.title || "Modal"} description={currentModal?.props.description} isOpen={!!currentModal} onClose={closeModal} className={currentModal?.props.className}>
        {renderModalContents()}
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