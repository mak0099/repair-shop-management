import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * Helper for RadioGroup fields that need string input but boolean output
 */
const booleanString = z.enum(["true", "false"]).transform((value) => value === "true");

/**
 * 1. Validation Schema
 */
export const formSchema = z.object({
  customerId: z.string().trim().min(1, "Customer selection is required"),
  estimatedPrice: z.number().optional(),
  brandId: z.string().trim().min(1, "Brand is required"),
  modelId: z.string().trim().min(1, "Model is required"),
  color: z.string().optional(),
  accessories: z.string().optional(),
  deviceType: z.string().min(1, "Device type is required"),
  currentStatus: z.string().min(1, "Status is required"),
  defectDescription: z.string().optional(),
  notes: z.string().optional(),
  // Removed .default() to prevent "Date | undefined" type mismatch
  acceptanceDate: z.date({ message: "Acceptance date is required" }),
  imei: z.string().trim().min(1, "IMEI/Serial is required"),
  secondaryImei: z.string().trim().optional(),
  technicianId: z.string().trim().min(1, "Technician assignment is required"),
  warranty: z.string().optional(),
  replacementDeviceId: z.string().optional(),
  dealer: z.string().optional(),
  priceOffered: z.number().optional(),
  reservedNotes: z.string().optional(),
  importantInformation: booleanString,
  pinUnlock: booleanString,
  pinUnlockNumber: z.string().optional(),
  urgent: booleanString,
  urgentDate: z.date().optional(),
  quote: booleanString,
  photo1: z.any().optional(),
  photo2: z.any().optional(),
  photo3: z.any().optional(),
  photo4: z.any().optional(),
  photo5: z.any().optional(),
}).refine((data) => {
  if (data.pinUnlock === true) {
    return !!data.pinUnlockNumber && data.pinUnlockNumber.trim().length > 0;
  }
  return true;
}, {
  message: "Required when PIN Unlock is Yes",
  path: ["pinUnlockNumber"],
}).refine((data) => {
  if (data.urgent === true) {
    return !!data.urgentDate;
  }
  return true;
}, {
  message: "Urgent date is required",
  path: ["urgentDate"],
});

/**
 * 2. Derived Form Type
 */
export type FormData = z.input<typeof formSchema>;

/**
 * 3. Database Entity Type
 */
export interface Acceptance extends BaseEntity, Omit<z.output<typeof formSchema>, 'photo1' | 'photo2' | 'photo3' | 'photo4' | 'photo5'> {
  acceptanceNumber: string;
  branchId: string;
  photos: string[];
  isActive: boolean;
}