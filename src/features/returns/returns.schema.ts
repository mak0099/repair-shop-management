import { z } from "zod";
import { BaseEntity } from "@/types/common";

export const returnItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string(),
  quantity: z.number().min(1),
  price: z.number(), // বিক্রয় মূল্য
  subtotal: z.number(),
  condition: z.string().default("RESALABLE"), // নষ্ট নাকি ভালো
});

export const returnSchema = z.object({
  saleId: z.string().min(1, "Original Invoice/Sale is required"),
  items: z.array(returnItemSchema).min(1, "At least one item must be returned"),
  
  // Totals
  totalRefundAmount: z.number(),
  restockingFee: z.number().default(0), // যদি কোনো চার্জ কাটা হয়
  
  // Metadata
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  status: z.string().default("PENDING"),
  processedBy: z.string().optional(),
});

export type ReturnFormValues = z.infer<typeof returnSchema>;

export interface SaleReturn extends BaseEntity, ReturnFormValues {
  returnNumber: string; // e.g., RET-1002
}