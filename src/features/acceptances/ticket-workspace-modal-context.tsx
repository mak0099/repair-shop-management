"use client"

import { createModalContext } from "@/lib/modal-context-factory"
import { Acceptance } from "./acceptance.schema"

const { ModalProvider, useModal } = createModalContext<Acceptance>({
  featureName: "TicketWorkspace",
  formName: "ticketWorkspaceForm",
  hideHeader: true,
  modalClassName: "max-w-7xl p-0 max-h-[90vh] flex flex-col gap-0 overflow-hidden",
})

export const TicketWorkspaceModalProvider = ModalProvider
export const useTicketWorkspaceModal = useModal
