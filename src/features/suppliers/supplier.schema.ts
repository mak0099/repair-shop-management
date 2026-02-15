import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * Detailed schema for product and spare parts suppliers.
 */
export const supplierSchema = z.object({
  company_name: z.string().trim().min(1, "Company name is required"),
  contact_person: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().trim().min(1, "Phone number is required"),
  vat_number: z.string().optional(), // Important for business invoices
  address: z.string().optional(),
  city: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

export interface Supplier extends BaseEntity, SupplierFormValues {}