import { z } from "zod";
import { BaseEntity } from "@/types/common";
import { PermissionType } from "@/constants/permissions";
import { Role } from "../roles";

export const userSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid corporate email"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  
  // Array of Role IDs assigned to this user
  roleIds: z.array(z.string()).min(1, "Assign at least one role"),
  
  // Individual overrides for special cases
  extraPermissions: z.array(z.string() as z.ZodType<PermissionType>).default([]),
  
  phone: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type UserFormValues = z.infer<typeof userSchema>;

/**
 * For the API/Frontend display, we Omit password for security 
 * and might include the Role objects instead of just IDs.
 */
export interface User extends BaseEntity, Omit<UserFormValues, 'password'> {
  // Option: Include populated roles for easy UI display
  roles?: Role[]; 
}