import { z } from "zod";
import { BaseEntity } from "@/types/common";

export const buybackItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.coerce.number().min(1, "Qty must be at least 1"),
  agreedPrice: z.coerce.number().min(0),
  subtotal: z.number(),
  isSerialized: z.boolean().default(false),
  serialList: z
    .array(
      z.object({
        imei: z.string().trim().min(1, "IMEI/SN is required"),
        batteryHealth: z.string().optional(),
        condition: z.string().optional(),
        isBoxIncluded: z.boolean().default(false),
        isChargerIncluded: z.boolean().default(false),
      }),
    )
    .optional(),
});

export const buybackSchema = z.object({
  customerId: z.string().trim().min(1, "Customer is required"),
  buybackDate: z.date({ required_error: "Buyback date is required" }),
  items: z
    .array(buybackItemSchema)
    .min(1, "Please add at least one device/item"),
  subtotal: z.coerce.number(),
  totalAmount: z.coerce.number(),
  paidAmount: z.coerce.number().default(0),
  dueAmount: z.coerce.number().default(0),
  paymentMethod: z.string({
    required_error: "Payment method is required",
    invalid_type_error: "Payment method is required"
  }).min(1, "Payment method is required"),
  notes: z.string().optional(),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).default("COMPLETED"),
  idProofImage: z.any().optional(), // Added for customer ID proof
  tempItemId: z.string().optional(), // For form use only
});

export type BuybackFormValues = z.input<typeof buybackSchema>;

export interface Buyback
  extends BaseEntity, Omit<z.output<typeof buybackSchema>, "buybackDate"> {
  buybackNumber: string;
  buybackDate: string | Date; // To handle both API string dates and JS Date objects
}
