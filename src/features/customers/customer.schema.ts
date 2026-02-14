import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * Detailed validation schema for Customer management.
 * Includes Italian specific fields like fiscal_code and VAT.
 */
export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  login_name: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().min(1, "Mobile number is required"),
  fax: z.string().optional(),
  fiscal_code: z.string().optional(), // For Italian Tax ID
  location: z.string().optional(),
  province: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  vat: z.string().optional(), // Value Added Tax number
  branch_id: z.string().min(1, "Branch is required"), // Standardized from branch_tid
  box_number_tid: z.string().optional(),
  isDealer: z.boolean().default(false),
  isDesktopCustomer: z.boolean().default(true),
  isCustomer: z.boolean().default(false),
  isActive: z.boolean().default(true),
  customerType: z.enum(["REGULAR", "RESELLER", "DEALER"]).default("REGULAR"),
});

/**
 * Type inferred from the Zod schema for form handling.
 */
export type CustomerFormValues = z.infer<typeof customerSchema>;

/**
 * Complete Customer entity structure for database operations.
 */
export interface Customer extends BaseEntity, CustomerFormValues {}