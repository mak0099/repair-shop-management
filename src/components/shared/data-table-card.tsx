"use client"

import { cn } from "@/lib/utils"
import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/shared/data-table"
import { DataTablePagination } from "@/components/shared/data-table-pagination"
import { Button } from "@/components/ui/button"

interface DataTableCardProps<TData> {
  table: Table<TData>
  isLoading?: boolean
  title: string
  total?: number
  children?: React.ReactNode
  bulkActions?: (table: Table<TData>) => React.ReactNode
}

export function DataTableCard<TData>({
  table,
  isLoading,
  title,
  total,
  children,
  bulkActions,
}: DataTableCardProps<TData>) {
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length

  return (
    <Card className="gap-2 py-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        {selectedRowCount > 0 && bulkActions ? (
          <div className="flex items-center gap-x-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => table.toggleAllPageRowsSelected(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Clear selection</span>
            </Button>
            <span className="text-sm font-medium text-muted-foreground">{selectedRowCount} selected</span>
            <div className="ml-2 flex items-center gap-2">{bulkActions(table)}</div>
          </div>
        ) : (
          <CardTitle className="text-base flex items-center gap-2">
            {title}
            {total !== undefined && <Badge variant="secondary" className="font-normal">{total} Total</Badge>}
          </CardTitle>
        )}
        {children}
      </CardHeader>
      <CardContent className={cn(isLoading && "opacity-50 pointer-events-none transition-opacity")}>
        <DataTable table={table} isLoading={isLoading} />
        <div className="mt-4">
          <DataTablePagination table={table} />
        </div>
      </CardContent>
    </Card>
  )
}