import { z } from "zod";

/**
 * Helper to handle boolean values that might come as strings from Radio Groups.
 * This ensures the Form input can be string/boolean, but validated output is always boolean.
 */
const booleanSchema = z.union([z.boolean(), z.string()])
  .transform((v) => v === true || v === "true");

export const itemSchema = z.object({
  id: z.string().optional(),
  sku: z.string().optional().nullable(), // Optional for services, auto-generated for devices
  name: z.string().min(1, "Product name is required"),
  subtitle: z.string().optional().nullable(),
  
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional().nullable(), // Optional for services
  modelId: z.string().optional().nullable(), // Optional for services
  condition: z.string().optional().nullable(), // Optional for services
  supplierId: z.string().optional().nullable(),
  boxNumberId: z.string().optional().nullable(),
  
  // --- SERVICE FIELDS (New) ---
  itemType: z.enum(["DEVICE", "PART", "SERVICE", "LOANER"]).default("DEVICE"),
  serviceType: z.string().optional().nullable(), // e.g., "PHONE_FLASH", "DATA_RECOVERY"
  
  // --- MASTER INVENTORY FIELDS (New) ---
  isSerialized: booleanSchema.default(false),
  minStockLevel: z.coerce.number().min(0).optional().nullable(), // Optional for services
  
  deviceType: z.string().optional().nullable(),
  
  // --- DEVICE-SPECIFIC FIELDS ---
  color: z.string().optional().nullable(),
  ram: z.string().optional().nullable(),
  rom: z.string().optional().nullable(),
  processor: z.string().optional().nullable(),
  camera: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  
  // --- PART-SPECIFIC FIELDS (New) ---
  partType: z.string().optional().nullable(), // e.g., "BATTERY", "SCREEN", "CHARGER"
  partSpecifications: z.string().optional().nullable(), // Custom part specs textarea
  compatibility: z.string().optional().nullable(), // Compatible devices/models

  // --- LOANED ITEM FIELDS ---
  imei: z.string().optional().nullable(), // Device IMEI for loaned items

  purchasePrice: z.coerce.number().default(0), // Allow 0 for services
  salePrice: z.coerce.number().default(0), // Allow 0 for services
  storageNote: z.string().optional().nullable(),
  
  
  // Boolean Flags using the safe booleanSchema
  isTouchScreen: booleanSchema.default(false),
  isSolidDevice: booleanSchema.default(true),
  isActive: booleanSchema.default(true),

  description: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
.refine(
  (data) => {
    // DEVICE & LOANER items must have SKU
    if ((data.itemType === "DEVICE" || data.itemType === "LOANER") && !data.sku) {
      return false;
    }
    // PART items must have SKU
    if (data.itemType === "PART" && !data.sku) {
      return false;
    }
    return true;
  },
  {
    message: "SKU is required for this item type",
    path: ["sku"],
  }
)
.refine(
  (data) => {
    // DEVICE & LOANER items must have Condition
    if ((data.itemType === "DEVICE" || data.itemType === "LOANER") && !data.condition) {
      return false;
    }
    return true;
  },
  {
    message: "Condition is required for this item type",
    path: ["condition"],
  }
)
.refine(
  (data) => {
    // SERVICE items must have serviceType
    if (data.itemType === "SERVICE" && !data.serviceType) {
      return false;
    }
    return true;
  },
  {
    message: "Service Type is required for SERVICE items",
    path: ["serviceType"],
  }
)
.refine(
  (data) => {
    // PART items must have partType
    if (data.itemType === "PART" && !data.partType) {
      return false;
    }
    return true;
  },
  {
    message: "Part Type is required for PART items",
    path: ["partType"],
  }
)
.refine(
  (data) => {
    // DEVICE, PART, and LOANER items must have brandId and modelId
    if ((data.itemType === "DEVICE" || data.itemType === "PART" || data.itemType === "LOANER") && !data.brandId) {
      return false;
    }
    return true;
  },
  {
    message: "Brand is required for this item type",
    path: ["brandId"],
  }
)
.refine(
  (data) => {
    // DEVICE, PART, and LOANER items must have modelId
    if ((data.itemType === "DEVICE" || data.itemType === "PART" || data.itemType === "LOANER") && !data.modelId) {
      return false;
    }
    return true;
  },
  {
    message: "Model is required for this item type",
    path: ["modelId"],
  }
)
.refine(
  (data) => {
    // PART items must have size for title uniqueness
    if (data.itemType === "PART" && !data.size) {
      return false;
    }
    return true;
  },
  {
    message: "Part Size/Capacity is required to ensure unique titles",
    path: ["size"],
  }
);

// The type representing the raw form input (allows strings for booleans)
export type ItemFormValues = z.input<typeof itemSchema>;

// The type representing the validated API data (strictly booleans)
export type Item = z.infer<typeof itemSchema>;