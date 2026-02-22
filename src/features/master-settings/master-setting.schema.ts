import { z } from "zod";

export const masterSettingValueSchema = z.object({
  id: z.string().optional(),
  value: z.string().min(1, "Value is required"),
  isActive: z.boolean().default(true),
});

export const masterSettingSchema = z.object({
  id: z.string(),
  name: z.string(), 
  key: z.string(), // example: "PAYMENT_METHODS", "DEVICE_TYPES"
  values: z.array(masterSettingValueSchema),
  description: z.string().optional(),
});

export type MasterSetting = z.infer<typeof masterSettingSchema>;
export type MasterSettingValue = z.infer<typeof masterSettingValueSchema>;