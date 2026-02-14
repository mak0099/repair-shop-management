import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * Zod schema for Brand form validation.
 * Supports image upload via 'any' or string path.
 */
export const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  logo: z.any().optional(), // Can be a File object or a string URL
  isActive: z.boolean().default(true),
});

/**
 * Type inferred from the Zod schema for form state management.
 */
export type BrandFormValues = z.infer<typeof brandSchema>;

/**
 * Brand entity interface extending database base properties.
 */
export interface Brand extends BaseEntity, BrandFormValues {}