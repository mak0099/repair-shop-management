import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * Validates all inventory items including dynamic specifications.
 */
export const itemSchema = z.object({
  name: z.string().trim().min(1, "Item name is required"),
  sku: z.string().trim().min(1, "SKU/Barcode is required"),
  type: z.enum(['PRODUCT', 'SPARE_PART', 'ACCESSORY']),
  brand_id: z.string().min(1, "Brand is required"),
  model_id: z.string().optional(),
  
  price: z.coerce.number().min(0, "Price cannot be negative"),
  cost_price: z.coerce.number().min(0, "Cost cannot be negative"),
  stock_qty: z.coerce.number().default(0),
  
  // JSON field for dynamic properties (RAM, ROM, etc.)
  specifications: z.record(z.any()).optional().default({}),
  isActive: z.boolean().default(true),
});

export type ItemFormValues = z.infer<typeof itemSchema>;

export interface Item extends BaseEntity, ItemFormValues {}