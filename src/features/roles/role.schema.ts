import { z } from "zod";
import { BaseEntity } from "@/types/common";
import { PermissionType } from "@/constants/permissions";

export const roleSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  // Slug is for internal logic (e.g., 'admin', 'technician')
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional().nullable(),
  // Array of permission slugs from our PERMISSIONS constant
  permissions: z.array(z.string() as z.ZodType<PermissionType>),
  // To prevent accidental deletion of critical roles
  isSystem: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
export interface Role extends BaseEntity, RoleFormValues {}