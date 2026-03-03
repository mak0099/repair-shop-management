import { z } from "zod";
import { BaseEntity } from "@/types/common";
import { PermissionType } from "@/constants/permissions";
import { Role } from "../roles/role.schema";

export const userSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid corporate email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  roleIds: z.array(z.string()).min(1, "Assign at least one role"),
  extraPermissions: z.array(z.string()), 
  phone: z.string().optional().nullable(),
  isActive: z.boolean(),
});

export type UserFormValues = z.infer<typeof userSchema>;

// The User interface used across the app
export interface User extends BaseEntity, Omit<UserFormValues, 'password' | 'extraPermissions'> {
  extraPermissions: PermissionType[];
  roles?: Role[]; 
}