import { z } from "zod";
import { BaseEntity } from "@/types/common";

// ১. Sale Item Schema (Cart Item Structure)
// এটি কার্টের আইটেমগুলোর সাথে মিল রেখে তৈরি করা হয়েছে
export const saleItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Item name is required"),
  sku: z.string().optional(),
  price: z.number().min(0),
  quantity: z.number().min(1),
  discount: z.number().default(0),
  tax: z.number().default(0),
  subtotal: z.number(),
  type: z.enum(["PRODUCT", "SERVICE"]).default("PRODUCT"),
  isSerialized: z.boolean().optional(),
  selectedIMEI: z.string().optional().nullable(),
});

export const saleSchema = z.object({
  customerId: z.string().optional().nullable(),
  items: z.array(saleItemSchema).min(1, "Cart cannot be empty"),
  subtotal: z.number(),
  totalDiscount: z.number().default(0),
  totalTax: z.number().default(0),
  grandTotal: z.number(),
  paymentMethod: z.enum(["CASH", "CARD", "MOBILE_PAYMENT", "SPLIT"]).default("CASH"),
  amountReceived: z.number().default(0),
  changeAmount: z.number().default(0),
  status: z.enum(["COMPLETED", "PENDING", "DRAFT", "CANCELED"]).default("COMPLETED"),
  paymentStatus: z.enum(["PAID", "PARTIAL", "UNPAID"]).default("PAID"),
  notes: z.string().optional(),
});

export type SaleItem = z.infer<typeof saleItemSchema>;
export type SaleFormValues = z.infer<typeof saleSchema>;

export interface Sale extends BaseEntity, Omit<SaleFormValues, "items"> {
  invoiceNumber: string;
  items: SaleItem[];
  processedBy: string;
  customerName?: string; // Optional customer name for display
}