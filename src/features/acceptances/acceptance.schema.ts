import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * 1. Validation Schema (The source of truth)
 */
export const formSchema = z.object({
  customer_id: z.string().trim().min(1, "Customer selection is required"),
  estimated_price: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().optional()
  ),
  brand_id: z.string().trim().min(1, "Brand is required"),
  model_id: z.string().trim().min(1, "Model is required"),
  color: z.string().optional(),
  accessories: z.string().optional(),
  device_type: z.string().min(1, "Device type is required"),
  current_status: z.string().min(1, "Status is required"),
  defect_description: z.string().optional(),
  notes: z.string().optional(),
  created_date: z.date().default(() => new Date()),
  imei: z.string().trim().min(1, "IMEI/Serial is required"),
  secondary_imei: z.string().trim().optional(),
  technician_id: z.string().trim().min(1, "Technician assignment is required"),
  warranty: z.string().optional(),
  replacement_device_id: z.string().optional(),
  dealer: z.string().optional(),
  price_offered: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().optional()
  ),
  reserved_notes: z.string().optional(),
  important_information: z.enum(["Yes", "No"]),
  pin_unlock: z.enum(["Yes", "No"]),
  pin_unlock_number: z.string().optional(),
  urgent: z.enum(["Yes", "No"]),
  urgent_date: z.date().optional(),
  quote: z.enum(["Yes", "No"]),
  photo_1: z.any().optional(),
  photo_2: z.any().optional(),
  photo_3: z.any().optional(),
  photo_4: z.any().optional(),
  photo_5: z.any().optional(),
}).refine((data) => {
  if (data.pin_unlock === "Yes") {
    return !!data.pin_unlock_number && data.pin_unlock_number.trim().length > 0;
  }
  return true;
}, {
  message: "Required when PIN Unlock is Yes",
  path: ["pin_unlock_number"],
}).refine((data) => {
  if (data.urgent === "Yes") {
    return !!data.urgent_date;
  }
  return true;
}, {
  message: "Urgent date is required",
  path: ["urgent_date"],
});

/**
 * 2. Derived Form Type
 */
export type FormData = z.infer<typeof formSchema>;

/**
 * 3. Database Entity Type (The missing export)
 */
export interface Acceptance extends BaseEntity, Omit<FormData, 'photo_1' | 'photo_2' | 'photo_3' | 'photo_4' | 'photo_5'> {
  acceptance_number: string; // Server-generated
  branch_id: string;        // Added for multi-branch support
  photos: string[];         // Array of photo URLs (mapped from separate fields)
}