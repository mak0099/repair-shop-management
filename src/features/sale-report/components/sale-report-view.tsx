"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SaleReport } from "../sale-report.schema";

interface SaleReportViewProps {
  data: SaleReport | null;
  isLoading: boolean;
}

export function SaleReportView({ data, isLoading }: SaleReportViewProps) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-10">
        Please select a date range and generate a report to see the data.
      </div>
    );
  }

  const totalAmount = data.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalProfit = data.reduce((sum, sale) => sum + sale.profit, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead className="text-right">Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.date}</TableCell>
                <TableCell>{sale.invoiceNumber}</TableCell>
                <TableCell>{sale.customerName}</TableCell>
                <TableCell className="text-right">{sale.totalAmount.toFixed(2)}</TableCell>
                <TableCell className="text-right">{sale.profit.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
              <TableCell className="text-right font-bold">{totalAmount.toFixed(2)}</TableCell>
              <TableCell className="text-right font-bold">{totalProfit.toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}