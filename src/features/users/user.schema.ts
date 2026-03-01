import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * Validates system users and staff members.
 * Removed .default(true) to ensure strict boolean mapping for RHF.
 */
export const userSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  email: z.string().email("Invalid corporate email"),
  /**
   * password is optional on update but required on creation.
   * We handle this conditional logic in the form's defaultValues or validation.
   */
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'TECHNICIAN', 'FRONTDESK']),
  isActive: z.boolean(),
});

export type UserFormValues = z.infer<typeof userSchema>;

export interface User extends BaseEntity, Omit<UserFormValues, 'password'> {}