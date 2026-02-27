import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { SaleReport, SaleReportFilters } from "./sale-report.schema";

export function useGenerateSaleReport() {
  return useMutation({
    mutationFn: async (filters: SaleReportFilters): Promise<SaleReport> => {
      const { data } = await apiClient.post("/sale-report", filters);
      return data;
    },
  });
}