import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * Standardized Customer Schema
 * Logic: All invoicing fields converted to camelCase for global consistency.
 * Boolean: isActive and isDealer are strictly boolean.
 */
export const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().min(1, "Mobile number is required"),
  
  // Standardized to camelCase
  fiscalCode: z.string().max(16, "Codice Fiscale is max 16 characters").optional(),
  vat: z.string().optional(), 
  sdiCode: z.string().max(7, "SDI Code must be 7 characters").optional(), 
  pecEmail: z.string().email("Invalid PEC email").optional().or(z.literal("")), 
  
  address: z.string().optional(),
  location: z.string().optional(), 
  province: z.string().max(2, "Use 2-letter province code").optional(),
  postalCode: z.string().optional(), 
  
  boxNumberTid: z.string().optional(),
  notes: z.string().optional(),
  
  isDealer: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

/**
 * Entity type combining BaseEntity (id, createdAt, updatedAt) 
 * with our form values.
 */
export type Customer = BaseEntity & CustomerFormValues;