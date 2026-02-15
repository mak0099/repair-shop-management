import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * Schema for product or service categories.
 * Supports hierarchical structure if needed via parent_id.
 */
export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  description: z.string().optional(),
  parent_id: z.string().optional(), // For sub-categories
  isActive: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export interface Category extends BaseEntity, CategoryFormValues {}