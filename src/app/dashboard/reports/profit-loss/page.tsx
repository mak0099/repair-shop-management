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
import { ArrowUpDown, Calendar as CalendarIcon, ChevronDown, Download, Search } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Type definition based on requirements P-004
export type ProfitLossRecord = {
  id: string
  acceptanceNumber: string
  customer: string
  estimatedPrice: number
  repairPrice: number
  refundAmount: number
  createdDate: string
  deliveryDate: string
  branch: string
  isRefunded: boolean
}

// Mock data
const data: ProfitLossRecord[] = [
  {
    id: "1",
    acceptanceNumber: "41604-2025",
    customer: "John Doe",
    estimatedPrice: 150.00,
    repairPrice: 80.00,
    refundAmount: 0,
    createdDate: "2025-01-15",
    deliveryDate: "2025-01-20",
    branch: "Main Branch",
    isRefunded: false,
  },
  {
    id: "2",
    acceptanceNumber: "41605-2025",
    customer: "Jane Smith",
    estimatedPrice: 120.00,
    repairPrice: 130.00, // Loss example
    refundAmount: 0,
    createdDate: "2025-01-16",
    deliveryDate: "2025-01-21",
    branch: "Downtown",
    isRefunded: false,
  },
  {
    id: "3",
    acceptanceNumber: "41606-2025",
    customer: "Bob Johnson",
    estimatedPrice: 200.00,
    repairPrice: 100.00,
    refundAmount: 50.00, // Partial refund
    createdDate: "2025-01-14",
    deliveryDate: "2025-01-18",
    branch: "Main Branch",
    isRefunded: true,
  },
  {
    id: "4",
    acceptanceNumber: "41607-2025",
    customer: "Alice Brown",
    estimatedPrice: 350.00,
    repairPrice: 150.00,
    refundAmount: 0,
    createdDate: "2025-01-10",
    deliveryDate: "2025-01-12",
    branch: "Main Branch",
    isRefunded: false,
  },
  {
    id: "5",
    acceptanceNumber: "41608-2025",
    customer: "Charlie Wilson",
    estimatedPrice: 90.00,
    repairPrice: 40.00,
    refundAmount: 90.00, // Full refund
    createdDate: "2025-01-05",
    deliveryDate: "2025-01-08",
    branch: "Downtown",
    isRefunded: true,
  },
]

export const columns: ColumnDef<ProfitLossRecord>[] = [
  {
    accessorKey: "acceptanceNumber",
    header: "Number",
    cell: ({ row }) => (
      <div className="font-medium text-blue-600 hover:underline cursor-pointer">
        {row.getValue("acceptanceNumber")}
      </div>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "estimatedPrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Est. Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("estimatedPrice"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "repairPrice",
    header: "Repair Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("repairPrice"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "refundAmount",
    header: "Refund",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("refundAmount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="text-red-500">{amount > 0 ? formatted : "-"}</div>
    },
  },
  {
    id: "profitLoss",
    header: "Profit / Loss",
    cell: ({ row }) => {
      const est = row.original.estimatedPrice
      const repair = row.original.repairPrice
      const refund = row.original.refundAmount
      const profit = est - repair - refund
      
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(profit)

      return (
        <div className={cn(
          "font-bold",
          profit >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {formatted}
        </div>
      )
    },
  },
  {
    accessorKey: "createdDate",
    header: "Created Date",
  },
  {
    accessorKey: "deliveryDate",
    header: "Delivery Date",
  },
]

export default function ProfitLossPage() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  
  // Filter states
  const [dateFrom, setDateFrom] = React.useState<Date>()
  const [dateTo, setDateTo] = React.useState<Date>()

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

  // Calculate summary stats
  const totalProfit = data.reduce((acc, curr) => acc + (curr.estimatedPrice - curr.repairPrice - curr.refundAmount), 0)
  const totalRevenue = data.reduce((acc, curr) => acc + curr.estimatedPrice, 0)
  const totalCost = data.reduce((acc, curr) => acc + curr.repairPrice + curr.refundAmount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Acceptance Profit/Loss</h1>
        <p className="text-muted-foreground">Financial report for repair jobs (P-004)</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Gross estimated price</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Repair costs + Refunds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", totalProfit >= 0 ? "text-green-600" : "text-red-600")}>
              ${totalProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Revenue - Costs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Narrow down the report by specific criteria</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Customer Name</Label>
            <Input 
              placeholder="Search customer..." 
              value={(table.getColumn("customer")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("customer")?.setFilterValue(event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Acceptance Number</Label>
            <Input 
              placeholder="e.g. 41604-2025" 
              value={(table.getColumn("acceptanceNumber")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("acceptanceNumber")?.setFilterValue(event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Branch</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="main">Main Branch</SelectItem>
                <SelectItem value="downtown">Downtown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex flex-col justify-end pb-2">
             <div className="flex items-center space-x-2">
                <Checkbox id="refunded" />
                <Label htmlFor="refunded">Refunded Only</Label>
             </div>
          </div>
          <div className="space-y-2">
            <Label>Created Date From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Created Date To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2 flex items-end">
            <Button className="w-full">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
          <div className="space-y-2 flex items-end">
            <Button variant="outline" className="w-full">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <div className="p-4 flex justify-end">
           <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export CSV
           </Button>
        </div>
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