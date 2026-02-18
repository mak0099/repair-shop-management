"use client"
import { createModalContext } from "@/lib/modal-context-factory"
import { MasterSetting } from "./master-setting.schema";

const { ModalProvider, useModal } = createModalContext<MasterSetting>({
  featureName: "Setting",
  formName: "masterSettingForm",
  modalClassName: "max-w-lg",
  addTitle: "Add New Setting",
  addDescription: "Create a new lookup value.",
  editTitle: "Edit Setting",
  editDescription: "Update setting details.",
  viewTitle: "View Setting",
  viewDescription: "View setting details.",
})

export const MasterSettingModalProvider = ModalProvider
export const useMasterSettingModal = useModal
