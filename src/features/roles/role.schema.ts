import { z } from "zod";
import { BaseEntity } from "@/types/common";
import { PermissionType } from "@/constants/permissions";

export const roleSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional().nullable(),
  permissions: z.array(z.string()), 
  isSystem: z.boolean(),
  isActive: z.boolean(),
});

export type RoleFormValues = z.infer<typeof roleSchema>;

export interface Role extends BaseEntity, Omit<RoleFormValues, 'permissions'> {
  permissions: PermissionType[];
}