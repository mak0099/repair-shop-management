import { z } from "zod";
import { BaseEntity } from "@/types/common";

/**
 * Tracks business expenses across different branches.
 */
export const expenseSchema = z.object({
  title: z.string().trim().min(1, "Expense title is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.date().default(() => new Date()),
  category_id: z.string().min(1, "Expense category is required"), // Linked to Master Settings (TYPE: EXPENSE_CAT)
  branch_id: z.string().min(1, "Branch is required"),
  notes: z.string().optional(),
  attachment_url: z.string().optional(), // For receipt photos
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export interface Expense extends BaseEntity, ExpenseFormValues {}