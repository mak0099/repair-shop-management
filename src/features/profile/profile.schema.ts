import { z } from "zod";

// ১. প্রোফাইল আপডেট স্কিমা (ব্যক্তিগত তথ্য)
export const profileSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid corporate email address"),
  phone: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(), // ভবিষ্যতে ইমেজ আপলোডের জন্য
});

// ২. পাসওয়ার্ড পরিবর্তন স্কিমা
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;