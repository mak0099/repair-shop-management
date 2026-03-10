"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { DateCell, TitleCell, CurrencyCell } from "@/components/shared/data-table-cells"
import { ResourceActions } from "@/components/shared/resource-actions"

import { useQuotations, useDeleteQuotation, useDeleteManyQuotations } from "../quotations.api"
import { Quotation } from "../quotations.schema"
import { useQuotationModal } from "../quotation-modal-context"
import { QUOTATION_STATUS } from "../quotations.constants"

export function QuotationList() {
  const { openModal } = useQuotationModal()
  const deleteMutation = useDeleteQuotation()
  const bulkDeleteMutation = useDeleteManyQuotations()

  const columns: ColumnDef<Quotation>[] = useMemo(() => [
    {
      accessorKey: "quotationNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Quotation details" />,
      cell: ({ row }) => (
        <TitleCell
          value={row.original.quotationNumber}
          isActive={row.original.status === QUOTATION_STATUS.ACCEPTED}
          onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          subtitle={
            <span className="font-bold text-slate-500 uppercase tracking-tighter">
              {row.original.customerName || row.original.customerId || "Unknown Customer"}
            </span>
          }
        />
      ),
    },
    {
      accessorKey: "grandTotal",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estimated Total" className="justify-end" />,
      cell: ({ row }) => <CurrencyCell amount={row.original.grandTotal} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const colorMap: Record<string, string> = {
          DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
          SENT: "bg-blue-100 text-blue-700 border-blue-200",
          ACCEPTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
          EXPIRED: "bg-amber-100 text-amber-700 border-amber-200",
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
      accessorKey: "validUntil",
      header: "Expiry Date",
      cell: ({ row }) => <DateCell date={row.original.validUntil} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ResourceActions
          resourceTitle={row.original.quotationNumber}
          resource={row.original}
          resourceName="Quotation"
          onView={(data) => openModal({ initialData: data as Quotation, isViewMode: true })}
          onEdit={(data) => openModal({ initialData: data as Quotation })}
          deleteMutation={deleteMutation}
        />
      )
    }
  ], [openModal, deleteMutation])

  return (
    <ResourceListPage<Quotation, unknown>
      title="Quotations"
      description="Manage and track repair estimates and price proposals."
      resourceName="quotations"
      columns={columns}
      useResourceQuery={useQuotations}
      onAdd={() => openModal()}
      addLabel="New Quotation"
      bulkDeleteMutation={bulkDeleteMutation}
      searchPlaceholder="Search quotation number or customer..."
      initialFilters={{ status: "all" }}
      filterDefinitions={[
        {
          key: "status",
          title: "Status",
          options: [
            { label: "All Status", value: "all" },
            ...Object.values(QUOTATION_STATUS).map(s => ({ label: s, value: s }))
          ]
        }
      ]}
    />
  )
}