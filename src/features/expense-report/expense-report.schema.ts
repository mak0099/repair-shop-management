import { z } from "zod";

export const expenseReportFiltersSchema = z.object({
  fromDate: z.date(),
  toDate: z.date(),
});

export type ExpenseReportFilters = z.infer<typeof expenseReportFiltersSchema>;

export const expenseSchema = z.object({
  id: z.string(),
  date: z.string(),
  category: z.string(),
  description: z.string(),
  amount: z.number(),
});

export type Expense = z.infer<typeof expenseSchema>;

export const expenseReportSchema = z.array(expenseSchema);
export type ExpenseReport = z.infer<typeof expenseReportSchema>;