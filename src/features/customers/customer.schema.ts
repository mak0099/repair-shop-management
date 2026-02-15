import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * Detailed validation schema for Customer management in Italy.
 * Includes mandatory fields for Fattura Elettronica (Electronic Invoicing).
 */
export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().min(1, "Mobile number is required"),
  
  // Italian Specific Invoicing Fields
  fiscal_code: z.string().max(16, "Codice Fiscale is max 16 characters").optional(),
  vat: z.string().optional(), // Partita IVA
  sdi_code: z.string().max(7, "SDI Code must be 7 characters").optional(), // Codice Destinatario
  pec_email: z.string().email("Invalid PEC email").optional().or(z.literal("")), // Certified Email
  
  // Location Details
  address: z.string().optional(),
  location: z.string().optional(), // Comune
  province: z.string().max(2, "Use 2-letter province code (e.g., RM)").optional(),
  postal_code: z.string().optional(), // CAP
  
  // Internal Tracking
  box_number_tid: z.string().optional(),
  notes: z.string().optional(),
  
  // Status & Types
  isDealer: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

/**
 * Type inferred from the Zod schema for form handling.
 */
export type CustomerFormValues = z.infer<typeof customerSchema>;

/**
 * Complete Customer entity structure for database operations.
 */
export interface Customer extends BaseEntity, CustomerFormValues {}