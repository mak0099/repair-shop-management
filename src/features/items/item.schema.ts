import { z } from "zod";

/**
 * Standardized Schema for Unified Item Management
 */
export const itemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  
  // Relational IDs (Standardized naming)
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  modelId: z.string().optional(),
  supplierId: z.string().optional(),
  boxNumberId: z.string().optional(), // Linked to Storage Box master
  
  // Technical Specifications
  deviceType: z.string().optional(),
  imei: z.string().optional(),
  color: z.string().optional(),
  ram: z.string().optional(),
  rom: z.string().optional(),
  processor: z.string().optional(),
  camera: z.string().optional(),
  size: z.string().optional(),
  batteryHealth: z.string().optional(),
  grade: z.string().optional(),

  // Pricing & Inventory
  purchasePrice: z.coerce.number().min(0).default(0),
  salePrice: z.coerce.number().min(0).default(0),
  initialStock: z.coerce.number().default(0),
  storageNote: z.string().optional(),
  sku: z.string().optional(),

  // Logistics & Status Flags
  condition: z.enum(["Used", "New"]).default("Used"),
  isBoxIncluded: z.enum(["Yes", "No"]).default("No"),
  isChargerIncluded: z.enum(["Yes", "No"]).default("No"),
  addToKhata: z.enum(["Yes", "No"]).default("No"),
  isTouchScreen: z.boolean().default(false),
  isSolidDevice: z.boolean().default(false),
  
  note: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type ItemFormData = z.infer<typeof itemSchema>;