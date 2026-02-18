"use client"
import { createModalContext } from "@/lib/modal-context-factory"
import { Model } from "./model.schema";

const { ModalProvider, useModal } = createModalContext<Model>({
  featureName: "Model",
  formName: "modelForm",
  modalClassName: "max-w-lg",
  addDescription: "Create a new device model.",
  editDescription: "Update model details.",
  viewDescription: "View model details.",
})

export const ModelModalProvider = ModalProvider
export const useModelModal = useModal
