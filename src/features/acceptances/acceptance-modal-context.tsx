"use client"

import { createModalContext } from "@/lib/modal-context-factory"
import { Acceptance } from "./acceptance.schema"

const { ModalProvider, useModal } = createModalContext<Acceptance>({
  featureName: "Acceptance",
  formName: "acceptanceForm",
  hideHeader: true,
  modalClassName: "max-w-5xl max-h-[95vh] min-h-[85vh] overflow-hidden flex flex-col",
  addDescription: "Create a new repair acceptance record.",
  editDescription: "Update acceptance details.",
  viewDescription: "View acceptance details.",
})

export const AcceptanceModalProvider = ModalProvider
export const useAcceptanceModal = useModal