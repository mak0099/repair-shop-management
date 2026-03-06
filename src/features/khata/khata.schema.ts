import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * Validates financial transactions and ledger entries.
 * Using z.coerce for number to handle potential string inputs from forms.
 */
export const khataSchema = z.object({
  partyId: z.string().optional().nullable(),
  partyType: z.enum(["SUPPLIER", "CUSTOMER"]).default("SUPPLIER"),
  partyName: z.string().optional(), // For quick UI display without join
  
  type: z.string().min(1, "Transaction type is required"), // e.g., PURCHASE, SALE, REPAIRMENT
  direction: z.enum(["IN", "OUT"]), // Money flow tracking
  
  amount: z.coerce.number().min(0.01, "Amount must be at least 0.01"),
  balanceAfter: z.number().optional(), // Running balance after this transaction
  
  date: z.date().or(z.string()),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "CHECK"]).default("CASH"),
  
  referenceId: z.string().optional().nullable(), // Link to Purchase/Sale ID
  note: z.string().optional().nullable(),
});

export type KhataFormValues = z.infer<typeof khataSchema>;

/**
 * Final KhataEntry interface extending BaseEntity for id, createdAt, and updatedAt.
 */
export interface KhataEntry extends BaseEntity, KhataFormValues {}