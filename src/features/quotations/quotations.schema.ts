import { z } from "zod";
import { BaseEntity } from "@/types/common";
import { saleItemSchema } from "../sales/sales.schema";

export const quotationSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
  
  // Financials
  subtotal: z.number(),
  totalTax: z.number().default(0),
  totalDiscount: z.number().default(0),
  grandTotal: z.number(),
  
  // Quotation Specifics
  status: z.string().default("DRAFT"),
  validUntil: z.date().or(z.string()),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;

export interface Quotation extends BaseEntity, QuotationFormValues {
  quotationNumber: string;
  createdBy: string;
}