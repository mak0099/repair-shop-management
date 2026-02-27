import { z } from "zod";

export const shopProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Shop name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  phone: z.string().min(11, "Valid phone number is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Full address is required"),
  logoUrl: z.string().optional(),
  binNumber: z.string().optional(), // Business Identification Number
  currency: z.string().default("BDT"),
  invoiceFooterMessage: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export type ShopProfile = z.infer<typeof shopProfileSchema>;