"use client"

import { createModalContext } from "@/lib/modal-context-factory"
import { Acceptance } from "./acceptance.schema"

const { ModalProvider, useModal } = createModalContext<Acceptance>({
  featureName: "Acceptance",
  formName: "acceptanceForm",
  modalClassName: "max-w-7xl max-h-[95vh] overflow-y-auto",
  addDescription: "Create a new repair acceptance record.",
  editDescription: "Update acceptance details.",
  viewDescription: "View acceptance details.",
})

export const AcceptanceModalProvider = ModalProvider
export const useAcceptanceModal = useModal