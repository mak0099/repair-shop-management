"use client"

import { createModalContext } from "@/lib/modal-context-factory"
import { RegisterLog } from "./register.schema"

const { ModalProvider, useModal } = createModalContext<RegisterLog>({
  featureName: "Register Log",
  formName: "registerForm",
  modalClassName: "max-w-2xl max-h-[85vh] overflow-y-auto",
  addDescription: "Open a new register session for today's sales.",
  editDescription: "Close the register and reconcile the cash drawer.",
  viewDescription: "View detailed register session summary.",
})

export const RegisterModalProvider = ModalProvider
export const useRegisterModal = useModal