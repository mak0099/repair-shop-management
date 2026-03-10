import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * Detailed schema for product and spare parts suppliers.
 * Removed .default(true) to maintain strict boolean mapping with RHF.
 */
export const supplierSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().trim().min(1, "Phone number is required"),
  vatNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  isActive: z.boolean(), // Strict boolean
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

export interface Supplier extends BaseEntity, SupplierFormValues {}