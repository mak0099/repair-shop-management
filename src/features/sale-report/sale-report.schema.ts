import { z } from "zod";

export const saleReportFiltersSchema = z.object({
  fromDate: z.date(),
  toDate: z.date(),
});

export type SaleReportFilters = z.infer<typeof saleReportFiltersSchema>;

export const saleItemSchema = z.object({
  id: z.string(),
  date: z.string(),
  invoiceNumber: z.string(),
  customerName: z.string(),
  totalAmount: z.number(),
  profit: z.number(),
});

export type SaleItem = z.infer<typeof saleItemSchema>;

export const saleReportSchema = z.array(saleItemSchema);
export type SaleReport = z.infer<typeof saleReportSchema>;