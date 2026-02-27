import { z } from "zod";

export const invoiceSetupSchema = z.object({
  id: z.string().optional(),
  invoicePrefix: z.string().min(1, "Prefix is required").max(5),
  nextInvoiceNumber: z.number().int().min(1),
  templateSize: z.enum(["A4", "THERMAL_80MM", "THERMAL_58MM"]),
  showLogo: z.boolean().default(true),
  showSignature: z.boolean().default(true),
  termsAndConditions: z.string().optional(),
  notes: z.string().optional(),
});

export type InvoiceSetup = z.infer<typeof invoiceSetupSchema>;