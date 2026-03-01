import { z } from "zod";

/**
 * Helper to handle boolean values that might come as strings from Radio Groups.
 * This ensures the Form input can be string/boolean, but validated output is always boolean.
 */
const booleanSchema = z.union([z.boolean(), z.string()])
  .transform((v) => v === true || v === "true");

export const itemSchema = z.object({
  id: z.string().optional(),
  sku: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  modelId: z.string().min(1, "Model is required"),
  supplierId: z.string().optional().nullable(),
  boxNumberId: z.string().optional().nullable(),
  
  deviceType: z.string().optional().nullable(),
  imei: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  ram: z.string().optional().nullable(),
  rom: z.string().optional().nullable(),
  processor: z.string().optional().nullable(),
  camera: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  batteryHealth: z.string().optional().nullable(),
  grade: z.string().optional().nullable(),

  purchasePrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  initialStock: z.coerce.number().min(0),
  storageNote: z.string().optional().nullable(),
  
  condition: z.enum(["Used", "New"]),
  // Using the booleanSchema to handle "true"/"false" strings without 'any'
  isBoxIncluded: booleanSchema,
  isChargerIncluded: booleanSchema,
  addToKhata: booleanSchema,
  
  isTouchScreen: z.boolean(),
  isSolidDevice: z.boolean(),
  isActive: z.boolean(),

  description: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// The type representing the raw form input (allows strings for booleans)
export type ItemFormValues = z.input<typeof itemSchema>;

// The type representing the validated API data (strictly booleans)
export type Item = z.infer<typeof itemSchema>;