import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * Validates system users and staff members.
 */
export const userSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  email: z.string().email("Invalid corporate email"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(), // Optional for updates
  role: z.enum(['ADMIN', 'MANAGER', 'TECHNICIAN', 'FRONTDESK']),
  branch_id: z.string().min(1, "Assign a branch to this user"),
  isActive: z.boolean().default(true),
});

export type UserFormValues = z.infer<typeof userSchema>;

export interface User extends BaseEntity, Omit<UserFormValues, 'password'> {}