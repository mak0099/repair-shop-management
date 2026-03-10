import { z } from "zod";

/**
 * Standard schema for Invoice Configuration.
 * Defaults are set to ensure the Form initialized with correct boolean states.
 */
export const invoiceSetupSchema = z.object({
  id: z.string().optional(),
  invoicePrefix: z.string()
    .min(1, "Prefix is required")
    .max(5, "Prefix cannot exceed 5 characters")
    .toUpperCase(),
  nextInvoiceNumber: z.number().int().min(1, "Must be at least 1"),
  dateFormat: z.string().default("dd/MM/yyyy"),
  templateSize: z.enum(["A4", "A5", "Thermal 80mm"]),
  showLogo: z.boolean().catch(true), // Robust boolean handling
  showSignature: z.boolean().catch(true),
  
  // Shop Identity
  shopName: z.string().optional(),
  shopAddress: z.string().optional(),
  shopContact: z.string().optional(),

  // Labels
  invoiceTitle: z.string().optional(),
  invoiceNumberLabel: z.string().optional(),
  dateLabel: z.string().optional(),
  customerInfoLabel: z.string().optional(),
  paymentMethodLabel: z.string().optional(),
  
  itemColumnLabel: z.string().optional(),
  quantityColumnLabel: z.string().optional(),
  priceColumnLabel: z.string().optional(),
  totalColumnLabel: z.string().optional(),
  
  subtotalLabel: z.string().optional(),
  taxLabel: z.string().optional(),
  discountLabel: z.string().optional(),
  grandTotalLabel: z.string().optional(),
  amountPaidLabel: z.string().optional(),

  // Footer
  thankYouMessage: z.string().optional(),
  termsAndConditions: z.string().optional().nullable(),
  signatureLabel: z.string().optional(),
  notes: z.string().optional().nullable(),
});

/**
 * Inferring type directly from schema.
 * Note: If you encounter 'undefined' errors in useForm, 
 * use 'as unknown as Resolver<InvoiceSetup>' in your component.
 */
export type InvoiceSetup = z.infer<typeof invoiceSetupSchema>;