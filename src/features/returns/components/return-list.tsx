"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { RotateCcw, Receipt, AlertTriangle, CheckCircle2 } from "lucide-react"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { DateCell, TitleCell, CurrencyCell } from "@/components/shared/data-table-cells"
import { ResourceActions } from "@/components/shared/resource-actions"

import { useReturns, useDeleteReturn, useDeleteManyReturns } from "../returns.api"
import { SaleReturn } from "../returns.schema"
import { useReturnModal } from "../return-modal-context"
import { RETURN_STATUS } from "../returns.constants"

export function ReturnList() {
  const { openModal } = useReturnModal()
  const deleteMutation = useDeleteReturn()
  const bulkDeleteMutation = useDeleteManyReturns()

  const columns: ColumnDef<SaleReturn>[] = useMemo(() => [
    {
      accessorKey: "returnNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Return Details" />,
      cell: ({ row }) => (
        <TitleCell
          value={row.original.returnNumber}
          isActive={row.original.status === RETURN_STATUS.COMPLETED}
          onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          subtitle={
            <div className="flex gap-2 items-center">
              <Receipt className="h-3 w-3 text-slate-400" />
              <span className="font-bold text-slate-500 uppercase tracking-tighter">
                Ref: {row.original.saleId}
              </span>
            </div>
          }
        />
      ),
    },
    {
      accessorKey: "totalRefundAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Refund Total" className="justify-end" />,
      cell: ({ row }) => (
        <CurrencyCell 
          amount={row.original.totalRefundAmount} 
          subtitle={row.original.restockingFee > 0 ? `Fee: ৳${row.original.restockingFee}` : undefined}
        />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const colorMap: Record<string, string> = {
          PENDING: "bg-amber-100 text-amber-700 border-amber-200",
          COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
          REJECTED: "bg-red-100 text-red-700 border-red-200",
        };

        return (
          <Badge className={`text-[9px] uppercase font-black px-2 py-0 border ${colorMap[status]}`}>
            {status}
          </Badge>
        )
      }
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-[11px] font-medium text-slate-500">
          {row.original.reason}
        </div>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Return Date",
      cell: ({ row }) => <DateCell date={row.original.createdAt} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ResourceActions
          resourceTitle={row.original.returnNumber}
          resource={row.original}
          resourceName="Return"
          onView={(data) => openModal({ initialData: data as SaleReturn, isViewMode: true })}
          deleteMutation={deleteMutation}
        />
      )
    }
  ], [openModal, deleteMutation])

  return (
    <ResourceListPage<SaleReturn, unknown>
      title="Sales Returns"
      description="Process and track customer returns, restock items, and manage refunds."
      resourceName="returns"
      columns={columns}
      useResourceQuery={useReturns}
      onAdd={() => openModal()}
      addLabel="Process Return"
      bulkDeleteMutation={bulkDeleteMutation}
      searchPlaceholder="Search return number or sale ID..."
      filterDefinitions={[
        {
          key: "status",
          title: "Status",
          options: Object.values(RETURN_STATUS).map(s => ({ label: s, value: s }))
        }
      ]}
    />
  )
}