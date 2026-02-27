import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ExpenseReport, ExpenseReportFilters } from "./expense-report.schema";

export function useGenerateExpenseReport() {
  return useMutation({
    mutationFn: async (
      filters: ExpenseReportFilters
    ): Promise<ExpenseReport> => {
      const { data } = await apiClient.post("/expense-report", filters);
      return data;
    },
  });
}