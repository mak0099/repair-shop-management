import { z } from "zod";
import { BaseEntity } from "@/types/common";

// পেমেন্ট এবং স্ট্যাটাস টাইপগুলো সরাসরি এখানেও ডিফাইন করা যায়
export const saleItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string(),
  sku: z.string().optional(),
  price: z.number().min(0),
  quantity: z.number().min(1),
  discount: z.number().default(0),
  tax: z.number().default(0),
  subtotal: z.number(),
  type: z.enum(["PRODUCT", "SERVICE"]),
});

export const saleSchema = z.object({
  customerId: z.string().optional().nullable(),
  items: z.array(saleItemSchema).min(1),
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
}