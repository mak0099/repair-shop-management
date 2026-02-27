"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  saleReportFiltersSchema,
  SaleReportFilters,
  SaleReport,
} from "./sale-report.schema";
import { useGenerateSaleReport } from "./sale-report.api";
import { SaleReportForm } from "./components/sale-report-form";
import { SaleReportView } from "./components/sale-report-view";

export function SaleReportManager() {
  const [reportData, setReportData] = useState<SaleReport | null>(null);
  const form = useForm<SaleReportFilters>({
    resolver: zodResolver(saleReportFiltersSchema),
    defaultValues: {
      fromDate: new Date(new Date().setDate(1)), // Default to start of month
      toDate: new Date(),
    },
  });

  const { mutate: generateReport, isPending } = useGenerateSaleReport();

  const onSubmit = (filters: SaleReportFilters) => {
    generateReport(filters, {
      onSuccess: (data) => setReportData(data),
    });
  };

  return (
    <FormProvider {...form}>
      <SaleReportForm onSubmit={form.handleSubmit(onSubmit)} isPending={isPending} />
      <SaleReportView data={reportData} isLoading={isPending} />
    </FormProvider>
  );
}