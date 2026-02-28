"use client"

import { flexRender, Table as TanstackTable } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData> {
  table: TanstackTable<TData>
  isLoading?: boolean
}

export function DataTable<TData>({ table, isLoading }: DataTableProps<TData>) {
  const columnsLength = table.getVisibleFlatColumns().length

  return (
    <div className="rounded-md border overflow-x-auto w-full max-w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                // Apply left padding only to the first visible column
                const isFirstVisibleColumn = index === 0;
                return (
                  <TableHead key={header.id} className={isFirstVisibleColumn ? "pl-4" : ""}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(
                  (row.original as Record<string, unknown>).isActive === false && "text-muted-foreground/60"
                )}
              >
                {row.getVisibleCells().map((cell, index) => (
                  // Apply left padding only to the first visible cell
                  <TableCell key={cell.id} className={index === 0 ? "pl-4" : ""}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isLoading ? (
            <TableRow>
              <TableCell colSpan={columnsLength} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <TableRow>
              <TableCell colSpan={columnsLength} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}