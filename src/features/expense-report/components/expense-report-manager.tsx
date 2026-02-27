"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  expenseReportFiltersSchema,
  ExpenseReportFilters,
  ExpenseReport,
} from "../expense-report.schema";
import { useGenerateExpenseReport } from "../expense-report.api";
import { ExpenseReportForm } from "./expense-report-form";
import { ExpenseReportView } from "./expense-report-view";

export function ExpenseReportManager() {
  const [reportData, setReportData] = useState<ExpenseReport | null>(null);
  const form = useForm<ExpenseReportFilters>({
    resolver: zodResolver(expenseReportFiltersSchema),
    defaultValues: {
      fromDate: new Date(new Date().setDate(1)), // Default to start of month
      toDate: new Date(),
    },
  });

  const { mutate: generateReport, isPending } = useGenerateExpenseReport();

  const onSubmit = (filters: ExpenseReportFilters) => {
    generateReport(filters, {
      onSuccess: (data) => setReportData(data),
    });
  };

  return (
    <FormProvider {...form}>
      <ExpenseReportForm onSubmit={form.handleSubmit(onSubmit)} isPending={isPending} />
      <ExpenseReportView data={reportData} isLoading={isPending} />
    </FormProvider>
  );
}