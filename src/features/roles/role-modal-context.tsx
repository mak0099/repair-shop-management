"use client"
import { createModalContext } from "@/lib/modal-context-factory"
import { Role } from "./role.schema";

const { ModalProvider, useModal } = createModalContext<Role>({
  featureName: "Role",
  formName: "roleForm",
  modalClassName: "max-w-7xl max-h-[95vh] overflow-y-auto",
  addDescription: "Create a new device role.",
  editDescription: "Update the details of this role.",
  viewDescription: "View role details.",
})

export const RoleModalProvider = ModalProvider
export const useRoleModal = useModal