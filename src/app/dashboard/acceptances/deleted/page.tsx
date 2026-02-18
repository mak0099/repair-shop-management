"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal, RotateCcw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

// Type definition based on requirements P-005
export type DeletedAcceptance = {
  id: string
  number: string
  customer: string
  createdDate: string
  deviceType: string
  brand: string
  model: string
  statusType: string
  currentStatus: string
  technician: string
  createdBy: string
  deliveryDate: string
  estimatedPrice: number
  branch: string
  deletedAt: string
}

// Mock data
const data: DeletedAcceptance[] = [
  {
    id: "1",
    number: "41600-2025",
    customer: "Michael Scott",
    createdDate: "2025-01-02",
    deviceType: "Smartphone",
    brand: "Apple",
    model: "iPhone 11",
    statusType: "Repair",
    currentStatus: "CANCELLED",
    technician: "Dwight Schrute",
    createdBy: "Pam Beesly",
    deliveryDate: "",
    estimatedPrice: 120,
    branch: "Scranton",
    deletedAt: "2025-01-05 09:30 AM",
  },
  {
    id: "2",
    number: "41601-2025",
    customer: "Jim Halpert",
    createdDate: "2025-01-03",
    deviceType: "Laptop",
    brand: "Dell",
    model: "XPS 15",
    statusType: "Repair",
    currentStatus: "WAITING PARTS",
    technician: "Andy Bernard",
    createdBy: "Erin Hannon",
    deliveryDate: "",
    estimatedPrice: 250,
    branch: "Stamford",
    deletedAt: "2025-01-06 02:15 PM",
  },
  {
    id: "3",
    number: "41602-2025",
    customer: "Stanley Hudson",
    createdDate: "2025-01-04",
    deviceType: "Tablet",
    brand: "Samsung",
    model: "Galaxy Tab S8",
    statusType: "Repair",
    currentStatus: "READY",
    technician: "Ryan Howard",
    createdBy: "Kelly Kapoor",
    deliveryDate: "2025-01-08",
    estimatedPrice: 180,
    branch: "Scranton",
    deletedAt: "2025-01-10 11:45 AM",
  },
]

export const columns: ColumnDef<DeletedAcceptance>[] = [
  {
    accessorKey: "number",
    header: "Number",
    cell: ({ row }) => <div className="font-medium">{row.getValue("number")}</div>,
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "createdDate",
    header: "Created Date",
  },
  {
    accessorKey: "deviceType",
    header: "Device Type",
  },
  {
    accessorKey: "brand",
    header: "Brand",
  },
  {
    accessorKey: "model",
    header: "Model",
  },
  {
    accessorKey: "currentStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("currentStatus") as string
      return (
        <Badge variant={status === "CANCELLED" ? "destructive" : "outline"}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "technician",
    header: "Technician",
  },
  {
    accessorKey: "branch",
    header: "Branch",
  },
  {
    accessorKey: "deletedAt",
    header: "Deleted At",
    cell: ({ row }) => <div className="text-muted-foreground text-xs">{row.getValue("deletedAt")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => alert("Restore functionality would be implemented here")}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore Acceptance
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => alert("Permanent delete functionality")}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permanently
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function DeletedAcceptancesPage() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold">Deleted Acceptances</h1>
        <p className="text-muted-foreground">Manage and restore deleted repair jobs (P-005)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search deleted records</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label>Acceptance Number</Label>
            <Input
              placeholder="Filter by number..."
              value={(table.getColumn("number")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("number")?.setFilterValue(event.target.value)
              }
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label>Branch</Label>
            <Select
              value={(table.getColumn("branch")?.getFilterValue() as string) ?? ""}
              onValueChange={(value) =>
                table.getColumn("branch")?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="Scranton">Scranton</SelectItem>
                <SelectItem value="Stamford">Stamford</SelectItem>
                <SelectItem value="Nashua">Nashua</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end space-x-2">
             <Button variant="outline" onClick={() => table.resetColumnFilters()}>
                Reset
             </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} row(s) found.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}