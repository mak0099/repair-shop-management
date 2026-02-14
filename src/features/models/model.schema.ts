import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * Validates device models linked to specific brands.
 */
export const modelSchema = z.object({
  name: z.string().trim().min(1, "Model name is required"),
  brand_id: z.string().min(1, "Brand selection is required"),
  isActive: z.boolean().default(true),
});

export type ModelFormValues = z.infer<typeof modelSchema>;

export interface Model extends BaseEntity, ModelFormValues {}