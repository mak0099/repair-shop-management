import { z } from "zod";
import { BaseEntity } from "@/types/common";

export const registerSchema = z.object({
  openedAt: z.date().or(z.string()),
  closedAt: z.date().or(z.string()).optional(),
  openedBy: z.string(),
  closedBy: z.string().optional(),
  
  // Financials
  openingBalance: z.number().min(0, "Opening balance cannot be negative"),
  expectedBalance: z.number().default(0), // System calculated
  actualBalance: z.number().optional(),   // Hand-counted by staff
  
  // Breakdown
  totalCashSales: z.number().default(0),
  totalCardSales: z.number().default(0),
  totalDigitalSales: z.number().default(0),
  totalExpenses: z.number().default(0),
  
  notes: z.string().optional(),
  status: z.string().default("OPEN"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export interface RegisterLog extends BaseEntity, RegisterFormValues {
  sessionNumber: string; // e.g., REG-2024-001
}