"use client";
import { createModalContext } from "@/lib/modal-context-factory";
import { MasterSetting } from "./master-setting.schema";

const { ModalProvider, useModal } = createModalContext<MasterSetting>({
  featureName: "Master Setting",
  formName: "masterSettingForm",
  modalClassName: "max-w-lg",
  addTitle: "Add New Master Setting",
  addDescription: "Create a new product master setting (e.g. Color, Size).",
  editTitle: "Edit Master Setting",
  editDescription: "Update the details of this master setting.",
  viewTitle: "View Master Setting",
  viewDescription: "View master setting details.",
});

export const MasterSettingModalProvider = ModalProvider;
export const useMasterSettingModal = useModal;