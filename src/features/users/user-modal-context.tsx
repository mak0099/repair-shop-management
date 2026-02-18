"use client"
import { createModalContext } from "@/lib/modal-context-factory"
import { User } from "./user.schema";

const { ModalProvider, useModal } = createModalContext<User>({
  featureName: "User",
  formName: "userForm",
  modalClassName: "max-w-lg",
  addDescription: "Create a new system user.",
  editDescription: "Update user details.",
  viewDescription: "View user details.",
})

export const UserModalProvider = ModalProvider
export const useUserModal = useModal
