"use client"

import { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { AlertTriangle, Smartphone, MapPin, Tag, ListFilter } from "lucide-react"

import { ResourceListPage, FilterDefinition } from "@/components/shared/resource-list-page"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { TitleCell, CurrencyCell } from "@/components/shared/data-table-cells"
import { ResourceActions } from "@/components/shared/resource-actions"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useDeleteStock, useStock } from "../stock.api"
import { useStockAdjustmentModal } from "@/features/stock-adjustment/stock-adjustment-modal-context"
import { Stock } from "../stock.schema"
import { STOCK_CATEGORY_FILTER_OPTIONS, STOCK_STATUS_FILTER_OPTIONS } from "../stock.constants"
import { StockDetailsModal } from "./stock-details-modal"

export function StockList() {
  const { openModal } = useStockAdjustmentModal()
  const deleteStockMutation = useDeleteStock()
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)

  const columns: ColumnDef<Stock>[] = useMemo(() => [
    {
      accessorKey: "itemName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Product & Specs" />,
      cell: ({ row }) => (
        <TitleCell
          isActive={row.original.isActive}
          value={row.original.itemName}
          onClick={() => setSelectedStock(row.original)}
          subtitle={
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(row.original.attributes || {}).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="text-[9px] h-4 px-1.5 border-none">
                  {value}
                </Badge>
              ))}
            </div>
          }
        />
      )
    },
    {
      id: "identifiers",
      header: ({ column }) => <DataTableColumnHeader column={column} title="SKU & IMEI" />,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Tag className="h-3 w-3" /> {row.original.sku}
          </div>
          {row.original.imei && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-indigo-600 dark:text-indigo-400">
              <Smartphone className="h-3 w-3" /> {row.original.imei}
            </div>
          )}
        </div>
      )
    },
    {
      accessorKey: "stockQuantity",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Available" />,
      cell: ({ row }) => {
        const isLow = row.original.stockQuantity <= row.original.lowStockThreshold
        const isOut = row.original.stockQuantity === 0

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-base font-bold",
                isOut ? "text-destructive" : isLow ? "text-orange-500" : "text-foreground"
              )}>
                {/* FIX: unit property is now safe to use */}
                {row.original.stockQuantity} {row.original.unit || "Pcs"}
              </span>
              {isLow && !isOut && <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />}
            </div>
            <Badge variant="outline" className={cn("text-[9px] w-fit uppercase px-1.5 h-4 border-none", getStatusColor(row.original.status))}>
              {row.original.status}
            </Badge>
          </div>
        )
      }
    },
    {
      id: "location",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Storage Location" />,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <MapPin className="h-3 w-3 text-destructive" /> {row.original.boxNumber || "N/A"}
          </div>
          {row.original.storageNote && (
            <span className="text-[10px] text-muted-foreground italic max-w-[120px] leading-tight">
              {row.original.storageNote}
            </span>
          )}
        </div>
      )
    },
    {
      accessorKey: "sellingPrice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" className="justify-end" />,
      cell: ({ row }) => <CurrencyCell amount={row.original.sellingPrice} />
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ResourceActions
          resource={row.original}
          resourceName="Stock Item"
          resourceTitle={row.original.itemName}
          onView={() => setSelectedStock(row.original)}
          deleteMutation={deleteStockMutation}
        />
      )
    }
  ], [deleteStockMutation])

  const filterDefinitions: FilterDefinition[] = [
    {
      key: 'category',
      title: 'Category',
      icon: ListFilter,
      options: STOCK_CATEGORY_FILTER_OPTIONS,
    },
    {
      key: 'status',
      title: 'Status',
      options: STOCK_STATUS_FILTER_OPTIONS,
    },
  ]

  return (
    <>
      <ResourceListPage<Stock, Record<string, unknown>>
        title="Current Stock"
        description="Monitor real-time stock levels, IMEIs, and storage locations."
        resourceName="stock"
        columns={columns}
        useResourceQuery={useStock}
        filterDefinitions={filterDefinitions}
        searchPlaceholder="Search SKU, IMEI or Product..."
        initialFilters={{ category: "all", status: "all", isActive: "true" }}
        onAdd={() => openModal()}
        addLabel="Adjust Stock"
      />
      <StockDetailsModal
        isOpen={!!selectedStock}
        onClose={() => setSelectedStock(null)}
        stockItem={selectedStock}
      />
    </>
  )
}

function getStatusColor(status: string) {
  const s = status.toLowerCase()
  if (s.includes("ready")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
  if (s.includes("sold")) return "bg-muted text-muted-foreground"
  if (s.includes("testing") || s.includes("pending")) return "bg-amber-500/10 text-amber-600 dark:text-amber-500"
  return "bg-primary/10 text-primary"
}