import { z } from "zod";
import { PermissionType } from "@/constants/permissions"

/**
 * Updated User Interface to support Multi-role and Special Overrides
 */
export interface User {
  id: string
  name: string
  email: string
  roleIds: string[]             // Supports selecting multiple roles
  extraPermissions: PermissionType[] // For the Special Extra Permissions feature
  isActive: boolean             // For the Login Access control
  phone?: string | null
}

/**
 * Login Validation Schema
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid corporate email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;