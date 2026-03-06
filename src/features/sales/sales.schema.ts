import { z } from "zod";
import { BaseEntity } from "@/types/common";
import { itemSchema } from "../items";

export const saleSchema = z.object({
  customerId: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1),
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

export type SaleItem = z.infer<typeof itemSchema>;
export type SaleFormValues = z.infer<typeof saleSchema>;

export interface Sale extends BaseEntity, Omit<SaleFormValues, "items"> {
  invoiceNumber: string;
  items: SaleItem[];
  processedBy: string;
}