import { z } from "zod";
import { BaseEntity, SettingType } from "@/types/common";

/**
 * Validates global lookup settings like Color, Warranty, etc.
 */
export const masterSettingSchema = z.object({
  type: z.enum(['COLOR', 'WARRANTY', 'DEVICE_TYPE', 'REPAIR_STATUS', 'CHECKLIST_ACCESSORY', 'EXPENSE_CAT']),
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Value is required"),
  isActive: z.boolean().default(true),
});

export type MasterSettingFormValues = z.infer<typeof masterSettingSchema>;

export interface MasterSetting extends BaseEntity, MasterSettingFormValues {}