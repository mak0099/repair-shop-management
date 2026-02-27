"use client";

import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerField } from "@/components/forms/date-picker-field";
import { SaleReportFilters } from "../sale-report.schema";

interface SaleReportFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
}

export function SaleReportForm({ onSubmit, isPending }: SaleReportFormProps) {
  const form = useFormContext<SaleReportFilters>();

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Filter Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="flex flex-col md:flex-row items-end gap-4">
            <DatePickerField control={form.control} name="fromDate" label="From Date" required />
            <DatePickerField control={form.control} name="toDate" label="To Date" required />
            <Button type="submit" disabled={isPending} className="w-full md:w-auto">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Report
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}