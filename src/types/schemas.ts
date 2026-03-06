import { z } from "zod";
import { BaseEntity } from "@/types/common";
import { PermissionType } from "@/constants/permissions";

// ==========================================
// 0. SHARED HELPERS & UTILS
// ==========================================

/**
 * Helper for RadioGroup fields that need string input but boolean output
 */
const booleanString = z.enum(["true", "false"]).transform((value) => value === "true");

/**
 * Helper to handle boolean values that might come as strings from Radio Groups.
 */
const booleanSchema = z.union([z.boolean(), z.string()])
  .transform((v) => v === true || v === "true");


// ==========================================
// 1. PRODUCTS & INVENTORY DOMAIN
// ==========================================

// --- Items ---
export const itemSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Product name is required"),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  modelId: z.string().min(1, "Model is required"),
  supplierId: z.string().optional().nullable(),
  boxNumberId: z.string().optional().nullable(),
  minStockLevel: z.coerce.number().min(0).default(2),
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
  initialStock: z.coerce.number().min(0).default(0),
  storageNote: z.string().optional().nullable(),
  condition: z.enum(["Used", "New"]),
  isBoxIncluded: booleanSchema,
  isChargerIncluded: booleanSchema,
  addToKhata: booleanSchema,
  isTouchScreen: booleanSchema.default(false),
  isSolidDevice: booleanSchema.default(true),
  isActive: booleanSchema.default(true),
  description: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ItemFormValues = z.input<typeof itemSchema>;
export type Item = z.infer<typeof itemSchema>;

// --- Stock Management ---
export const stockSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  sku: z.string().min(1, "SKU is required"),
  imei: z.string().optional().nullable(),
  attributes: z.record(z.string(), z.string()),
  categoryName: z.string(),
  brandName: z.string(),
  modelName: z.string().optional().nullable(),
  boxNumber: z.string().optional().nullable(),
  boxLocationName: z.string().optional().nullable(),
  storageNote: z.string().optional().nullable(),
  unit: z.string().optional().default("Pcs"),
  status: z.string(),
  condition: z.enum(["New", "Used"]),
  stockQuantity: z.number().nonnegative(),
  lowStockThreshold: z.number().nonnegative(),
  purchasePrice: z.number().optional().nullable(),
  sellingPrice: z.number().positive(),
  isActive: z.boolean(),
});

export type StockFormValues = z.infer<typeof stockSchema>;
export interface Stock extends BaseEntity, StockFormValues {}

// --- Stock Adjustment ---
export const stockAdjustmentSchema = z.object({
  stockId: z.string().min(1, "Please select a specific stock item"),
  itemName: z.string().optional(),
  imei: z.string().optional(),
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().positive("Quantity must be greater than 0"),
  reason: z.enum(["Inventory Audit", "Damage", "Theft", "Return", "Restock", "Correction", "Testing Issue", "Other"]),
  note: z.string().optional(),
  adjustedBy: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>;
export interface StockAdjustment extends BaseEntity, StockAdjustmentFormValues {}

// --- Categories, Brands & Models ---
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;
export interface Category extends BaseEntity, CategoryFormValues {}

export const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  logo: z.any().optional(),
  isActive: z.boolean().default(true),
});
export type BrandFormValues = z.infer<typeof brandSchema>;
export interface Brand extends BaseEntity, BrandFormValues {}

export const modelSchema = z.object({
  name: z.string().trim().min(1, "Model name is required"),
  brand_id: z.string().min(1, "Brand selection is required"),
  isActive: z.boolean(),
});
export type ModelFormValues = z.infer<typeof modelSchema>;
export interface Model extends BaseEntity, ModelFormValues {}

// --- Attributes & Box Numbers ---
export const attributeValueSchema = z.object({
  id: z.string().optional(),
  value: z.string().min(1, "Value is required"),
  isActive: z.boolean(),
});

export const attributeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  key: z.string().min(1, "Key is required"),
  description: z.string().optional().nullable(),
  values: z.array(attributeValueSchema),
});
export type Attribute = z.infer<typeof attributeSchema>;

export const boxNumberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});
export type BoxNumber = z.infer<typeof boxNumberSchema>;


// ==========================================
// 2. CRM & SRM DOMAIN (Contacts)
// ==========================================

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().min(1, "Mobile number is required"),
  fiscalCode: z.string().max(16).optional(),
  vat: z.string().optional(),
  sdiCode: z.string().max(7).optional(),
  pecEmail: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  location: z.string().optional(),
  province: z.string().max(2).optional(),
  postalCode: z.string().optional(),
  boxNumberTid: z.string().optional(),
  notes: z.string().optional(),
  isDealer: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export type CustomerFormValues = z.infer<typeof customerSchema>;
export type Customer = BaseEntity & CustomerFormValues;

export const supplierSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().trim().min(1, "Phone number is required"),
  vatNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  isActive: z.boolean(),
});
export type SupplierFormValues = z.infer<typeof supplierSchema>;
export interface Supplier extends BaseEntity, SupplierFormValues {}


// ==========================================
// 3. TRANSACTIONS DOMAIN (Sales, Purchases, Returns)
// ==========================================

// --- Sales ---
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
export type SaleFormValues = z.infer<typeof saleSchema>;
export interface Sale extends BaseEntity, Omit<SaleFormValues, "items"> {
  invoiceNumber: string;
  items: Item[]; // Using Item from Product Domain
  processedBy: string;
}

// --- Purchases ---
export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string(),
  quantity: z.number().min(1),
  costPrice: z.number().min(0),
  subtotal: z.number(),
});

export const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  purchaseDate: z.date().or(z.string()),
  billNumber: z.string().optional(),
  tempItemId: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1),
  subtotal: z.number(),
  totalAmount: z.number(),
  paidAmount: z.number().default(0),
  dueAmount: z.number().default(0),
  paymentStatus: z.string().default("PAID"),
  status: z.string().default("RECEIVED"),
});
export type PurchaseFormValues = z.infer<typeof purchaseSchema>;
export interface ProductPurchase extends BaseEntity, PurchaseFormValues {
  purchaseNumber: string;
}

// --- Quotation & Returns ---
export const quotationSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  items: z.array(itemSchema).min(1),
  subtotal: z.number(),
  totalTax: z.number().default(0),
  totalDiscount: z.number().default(0),
  grandTotal: z.number(),
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

export const returnItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string(),
  quantity: z.number().min(1),
  price: z.number(),
  subtotal: z.number(),
  condition: z.string().default("RESALABLE"),
});
export const returnSchema = z.object({
  saleId: z.string().min(1, "Original Invoice/Sale is required"),
  items: z.array(returnItemSchema).min(1),
  totalRefundAmount: z.number(),
  restockingFee: z.number().default(0),
  reason: z.string().min(5),
  status: z.string().default("PENDING"),
  processedBy: z.string().optional(),
});
export type ReturnFormValues = z.infer<typeof returnSchema>;
export interface SaleReturn extends BaseEntity, ReturnFormValues {
  returnNumber: string;
}


// ==========================================
// 4. SHOP MANAGEMENT & FINANCE
// ==========================================

// --- Acceptance (Job Card) ---
export const acceptanceSchema = z.object({
  customerId: z.string().trim().min(1, "Customer selection is required"),
  estimatedPrice: z.number().optional(),
  brandId: z.string().trim().min(1, "Brand is required"),
  modelId: z.string().trim().min(1, "Model is required"),
  color: z.string().optional(),
  accessories: z.string().optional(),
  deviceType: z.string().min(1, "Device type is required"),
  currentStatus: z.string().min(1, "Status is required"),
  defectDescription: z.string().optional(),
  notes: z.string().optional(),
  acceptanceDate: z.date({ message: "Acceptance date is required" }),
  imei: z.string().trim().min(1, "IMEI/Serial is required"),
  secondaryImei: z.string().trim().optional(),
  technicianId: z.string().trim().min(1, "Technician assignment is required"),
  importantInformation: booleanString,
  pinUnlock: booleanString,
  pinUnlockNumber: z.string().optional(),
  urgent: booleanString,
  urgentDate: z.date().optional(),
  quote: booleanString,
  photo1: z.any().optional(),
  photo2: z.any().optional(),
  photo3: z.any().optional(),
  photo4: z.any().optional(),
  photo5: z.any().optional(),
}).refine(d => d.pinUnlock ? !!d.pinUnlockNumber : true, { path: ["pinUnlockNumber"] })
  .refine(d => d.urgent ? !!d.urgentDate : true, { path: ["urgentDate"] });

export type AcceptanceFormData = z.input<typeof acceptanceSchema>;
export interface Acceptance extends BaseEntity, Omit<z.output<typeof acceptanceSchema>, 'photo1'|'photo2'|'photo3'|'photo4'|'photo5'> {
  acceptanceNumber: string;
  branchId: string;
  photos: string[];
  isActive: boolean;
}

// --- Expenses & Register ---
export const expenseSchema = z.object({
  title: z.string().trim().min(1, "Expense title is required"),
  amount: z.coerce.number().min(0.01),
  date: z.date().default(() => new Date()),
  categoryId: z.string().min(1, "Expense category is required"),
  branchId: z.string().min(1, "Branch is required"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CARD", "MOBILE_BANKING"]).default("CASH"),
  notes: z.string().optional().nullable(),
});
export type ExpenseFormValues = z.infer<typeof expenseSchema>;
export type Expense = BaseEntity & ExpenseFormValues;

export const registerSchema = z.object({
  openedAt: z.date().or(z.string()),
  closedAt: z.date().or(z.string()).optional(),
  openedBy: z.string(),
  openingBalance: z.number().min(0),
  expectedBalance: z.number().default(0),
  actualBalance: z.number().optional(),
  notes: z.string().optional(),
  status: z.string().default("OPEN"),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;
export interface RegisterLog extends BaseEntity, RegisterFormValues {
  sessionNumber: string;
}

// --- Shop Profile & Invoice Setup ---
export const shopProfileSchema = z.object({
  name: z.string().min(2),
  ownerName: z.string().min(2),
  phone: z.string().min(11),
  email: z.string().email(),
  address: z.string().min(5),
  currency: z.string().min(1),
  website: z.string().url().optional().or(z.literal("")),
});
export type ShopProfile = z.infer<typeof shopProfileSchema>;

export const invoiceSetupSchema = z.object({
  invoicePrefix: z.string().min(1).max(5).toUpperCase(),
  nextInvoiceNumber: z.number().int().min(1),
  dateFormat: z.string().default("dd/MM/yyyy"),
  templateSize: z.enum(["A4", "A5", "Thermal 80mm"]),
  showLogo: z.boolean().catch(true),
  shopName: z.string().optional(),
  termsAndConditions: z.string().optional().nullable(),
});
export type InvoiceSetup = z.infer<typeof invoiceSetupSchema>;


// ==========================================
// 5. IAM - IDENTITY & ACCESS MANAGEMENT
// ==========================================

export const loginSchema = z.object({
  email: z.string().email("Invalid corporate email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const roleSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  permissions: z.array(z.string()),
  isActive: z.boolean(),
});
export type RoleFormValues = z.infer<typeof roleSchema>;
export interface Role extends BaseEntity, Omit<RoleFormValues, 'permissions'> {
  permissions: PermissionType[];
}

export const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  roleIds: z.array(z.string()).min(1),
  extraPermissions: z.array(z.string()),
  isActive: z.boolean(),
});
export type UserFormValues = z.infer<typeof userSchema>;
export interface User extends BaseEntity, Omit<UserFormValues, 'password' | 'extraPermissions'> {
  extraPermissions: PermissionType[];
  roles?: Role[];
}


// ==========================================
// 6. UTILITIES (Barcodes, Master Settings)
// ==========================================

export const barcodeSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  labelSize: z.enum(["38x25mm", "50x30mm", "A4_40_Labels", "Custom"]).default("38x25mm"),
});
export type BarcodeRequest = z.infer<typeof barcodeSchema>;

export const masterSettingSchema = z.object({
  name: z.string().min(1),
  key: z.string().min(1),
  values: z.array(z.object({
    id: z.string().optional(),
    value: z.string().min(1),
    isActive: z.boolean(),
  })),
});
export type MasterSetting = BaseEntity & z.infer<typeof masterSettingSchema>;