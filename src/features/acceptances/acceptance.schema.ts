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
  estimatedPrice: z.coerce.number().optional(),
  advancePayment: z.coerce.number().optional(),
  finalPayment: z.coerce.number().optional(),
  totalCost: z.coerce.number().optional(),
  balanceDue: z.coerce.number().optional(),
  brandId: z.string().trim().min(1, "Brand is required"),
  modelId: z.string().trim().min(1, "Model is required"),
  color: z.string().optional(),
  accessories: z.string().optional(),
  deviceType: z.string().min(1, "Device type is required"),
  currentStatus: z.string().min(1, "Status is required"),
  defectDescription: z.string().trim().min(1, "Defect description is required"),
  notes: z.string().optional(),
  // Removed .default() to prevent "Date | undefined" type mismatch
  acceptanceDate: z.date({ message: "Acceptance date is required" }),
  imei: z.string().trim().min(1, "IMEI/Serial is required"),
  secondaryImei: z.string().trim().optional(),
  loanerDeviceId: z.string().optional(), // For tracking temporary phones given to customers
  technicianId: z.string().trim().optional(),
  warranty: z.string().optional(),
  replacementDeviceId: z.string().optional(),
  dealer: z.string().optional(),
  priceOffered: z.coerce.number().optional(),
  reservedNotes: z.string().optional(),
  importantInformation: booleanString,
  pinUnlock: booleanString,
  pinUnlockNumber: z.string().optional(),
  urgent: booleanString,
  urgentDateTime: z.date().optional(),
  quote: booleanString,
  photo1: z.any().optional(),
  photo2: z.any().optional(),
  photo3: z.any().optional(),
  photo4: z.any().optional(),
  photo5: z.any().optional(),

  // Advanced Tracking
  partsUsed: z.array(z.object({
    itemId: z.string(),
    name: z.string(),
    quantity: z.coerce.number(),
    price: z.coerce.number(),
  })).optional().default([]),

  // Operational Logs - Complete audit trail of all events
  operationalLogs: z.array(z.object({
    id: z.string(),
    action: z.enum([
      "TICKET_CREATED",
      "STATUS_CHANGED",
      "TECHNICIAN_ASSIGNED",
      "PART_ADDED",
      "PART_REMOVED",
      "PAYMENT_RECEIVED",
      "NOTE_ADDED",
      "PHOTO_ADDED",
      "DELIVERY_COMPLETED",
    ]),
    description: z.string(),
    timestamp: z.date().or(z.string()),
    userId: z.string().optional(),
    metadata: z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      amount: z.coerce.number().optional(),
      itemName: z.string().optional(),
      partPrice: z.coerce.number().optional(),
    }).optional(),
  })).optional().default([]),

  // Timeline Logs - Important workflow events for visual timeline
  timelineLogs: z.array(z.object({
    id: z.string(),
    action: z.enum([
      "TICKET_CREATED",
      "TECHNICIAN_ASSIGNED",
      "STATUS_CHANGED",
      "DELIVERY_COMPLETED",
      "PART_ADDED",
      "PART_REMOVED",
      "NOTE_ADDED",
    ]),
    description: z.string(),
    icon: z.string().optional(),
    color: z.enum(["blue", "indigo", "emerald", "amber", "red"]).optional(),
    timestamp: z.date().or(z.string()),
    userId: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })).optional().default([]),
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
    return !!data.urgentDateTime;
  }
  return true;
}, {
  message: "Urgent date is required",
  path: ["urgentDateTime"],
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
  photos: string[];
  // Populated by API for list display
  customer?: { id: string; name?: string; mobile?: string; phone?: string };
  brand?: { id: string; name: string };
  model?: { id: string; name: string };
  technician?: { id: string; name: string };
}