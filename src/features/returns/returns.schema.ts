import { z } from "zod"
import { BaseEntity } from "@/types/common"

export const returnItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().min(1),
  price: z.coerce.number().min(0), // Refund unit price
  subtotal: z.number(),
  condition: z.enum(["RESALABLE", "DEFECTIVE", "OPEN_BOX"]).default("RESALABLE"),
  soldQuantity: z.number().optional(), // For validation against original sale
})

export const returnSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  saleId: z.string().min(1, "Original Invoice is required"),
  items: z.array(returnItemSchema).min(1, "At least one item is required"),
  
  // Financials
  subtotal: z.number(),
  restockingFee: z.coerce.number().default(0),
  totalRefundAmount: z.number(),
  
  // Meta
  status: z.enum(["PENDING", "APPROVED", "COMPLETED", "REJECTED"]).default("PENDING"),
  returnDate: z.date().or(z.string()).default(() => new Date()),
  notes: z.string().optional(),
})

export type ReturnFormValues = z.infer<typeof returnSchema>
export type ReturnItem = z.infer<typeof returnItemSchema>

export interface SaleReturn extends BaseEntity, ReturnFormValues {
  returnNumber: string
  createdBy: string
  customerName?: string
}
