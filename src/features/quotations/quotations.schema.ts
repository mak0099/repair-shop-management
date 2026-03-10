import { z } from "zod";
import { BaseEntity } from "@/types/common";

// Specific item schema for quotations (less strict than inventory items)
export const quotationItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
  subtotal: z.number(),
  tax: z.number().optional(),
  discount: z.number().optional(),
});

export const quotationSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  items: z.array(quotationItemSchema).min(1, "At least one item is required"),
  
  // Financials
  subtotal: z.number(),
  totalTax: z.number().default(0),
  totalDiscount: z.coerce.number().default(0),
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
  customerName?: string;
}