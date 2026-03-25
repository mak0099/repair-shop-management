import { z } from "zod";

/**
 * Helper to handle boolean values that might come as strings from Radio Groups.
 * This ensures the Form input can be string/boolean, but validated output is always boolean.
 */
const booleanSchema = z.union([z.boolean(), z.string()])
  .transform((v) => v === true || v === "true");

export const itemSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, "SKU is required"), // মাস্টার ট্র্যাকিংয়ের জন্য SKU এখন মাস্ট
  name: z.string().min(1, "Product name is required"),
  subtitle: z.string().optional().nullable(),
  
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  modelId: z.string().min(1, "Model is required"),
  condition: z.string().min(1, "Condition is required").default("NEW"),
  supplierId: z.string().optional().nullable(),
  boxNumberId: z.string().optional().nullable(),
  
  // --- MASTER INVENTORY FIELDS (New) ---
  isSerialized: booleanSchema.default(false),
  minStockLevel: z.coerce.number().min(0).default(2), 
  
  itemType: z.enum(["DEVICE", "PART", "LOANED"]).default("DEVICE"),
  deviceType: z.string().optional().nullable(),
  
  color: z.string().optional().nullable(),
  ram: z.string().optional().nullable(),
  rom: z.string().optional().nullable(),
  processor: z.string().optional().nullable(),
  camera: z.string().optional().nullable(),
  size: z.string().optional().nullable(),

  purchasePrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  storageNote: z.string().optional().nullable(),
  
  
  // Boolean Flags using the safe booleanSchema
  isTouchScreen: booleanSchema.default(false),
  isSolidDevice: booleanSchema.default(true),
  isActive: booleanSchema.default(true),

  description: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// The type representing the raw form input (allows strings for booleans)
export type ItemFormValues = z.input<typeof itemSchema>;

// The type representing the validated API data (strictly booleans)
export type Item = z.infer<typeof itemSchema>;