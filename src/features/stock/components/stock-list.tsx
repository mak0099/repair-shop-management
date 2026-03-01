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
import { useStock } from "../stock.api"
import { useStockAdjustmentModal } from "@/features/stock-adjustment/stock-adjustment-modal-context"
import { Stock } from "../stock.schema"
import { STOCK_CATEGORY_FILTER_OPTIONS, STOCK_STATUS_FILTER_OPTIONS } from "../stock.constants"
import { StockDetailsModal } from "./stock-details-modal"
import { useDeleteStockAdjustment } from "@/features/stock-adjustment"

export function StockList() {
  const { openModal } = useStockAdjustmentModal()
  const deleteStockAdjustmentMutation = useDeleteStockAdjustment()
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)

  const columns: ColumnDef<Stock>[] = useMemo(() => [
    {
      accessorKey: "itemName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Product & Specs" />,
      cell: ({ row }) => (
        <TitleCell
          value={row.original.itemName}
          onClick={() => setSelectedStock(row.original)}
          subtitle={
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(row.original.attributes).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="text-[9px] h-4 px-1.5 bg-slate-100 text-slate-600 border-none">
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
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-indigo-600">
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
                isOut ? "text-red-500" : isLow ? "text-orange-500" : "text-slate-900"
              )}>
                {/* FIX: unit property is now safe to use */}
                {row.original.stockQuantity} {row.original.unit || "Pcs"}
              </span>
              {isLow && !isOut && <AlertTriangle className="h-3.5 w-3.5 text-orange-500 animate-pulse" />}
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
            <MapPin className="h-3 w-3 text-red-500" /> {row.original.boxNumber || "N/A"}
          </div>
          {row.original.storageNote && (
            <span className="text-[10px] text-slate-400 italic max-w-[120px] leading-tight">
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
          deleteMutation={deleteStockAdjustmentMutation}
        />
      )
    }
  ], [deleteStockAdjustmentMutation])

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
        initialFilters={{ category: "all", status: "all" }}
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
  if (s.includes("ready")) return "bg-emerald-100 text-emerald-700"
  if (s.includes("sold")) return "bg-slate-100 text-slate-500"
  if (s.includes("testing") || s.includes("pending")) return "bg-amber-100 text-amber-700"
  return "bg-blue-100 text-blue-700"
}