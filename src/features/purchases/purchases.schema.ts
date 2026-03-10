import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * ১. পারচেজ আইটেম স্কিমা
 * সব নাম্বার ফিল্ডে z.coerce.number() ব্যবহার করা হয়েছে
 */
export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string(),
  // এখানে coerce ব্যবহার করলে "1" কে ১ বানিয়ে নিবে
  quantity: z.coerce.number().min(1, "Qty must be at least 1"),
  costPrice: z.coerce.number().min(0, "Price cannot be negative"),
  subtotal: z.coerce.number(),
  
  isSerialized: z.boolean().default(false),
  serialList: z.array(z.string()).default([]),
});

/**
 * ২. মেইন পারচেজ স্কিমা
 */
export const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  purchaseDate: z.date().or(z.string()),
  billNumber: z.string().optional().nullable(),
  
  tempItemId: z.string().optional(), 

  items: z.array(purchaseItemSchema).min(1, "Add at least one item"),
  
  // এখানেও coerce মাস্ট, কারণ এগুলো ক্যালকুলেটেড স্ট্রিং হতে পারে
  subtotal: z.coerce.number(),
  totalAmount: z.coerce.number(),
  paidAmount: z.coerce.number().min(0, "Paid amount cannot be negative").default(0),
  dueAmount: z.coerce.number().default(0),
  
  paymentStatus: z.string().default("PAID"),
  status: z.string().default("RECEIVED"),
  
  notes: z.string().optional().nullable(),
  addToKhata: z.boolean().default(true),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export interface ProductPurchase extends BaseEntity, Omit<PurchaseFormValues, 'tempItemId'> {
  purchaseNumber: string; 
}