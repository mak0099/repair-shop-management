"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DateCell } from "@/components/shared/data-table-cells"
import { Badge } from "@/components/ui/badge"

import {
  useAcceptances,
  useDeleteAcceptance,
  useDeleteManyAcceptances,
  useUpdateManyAcceptances,
} from "../acceptance.api"
import { Acceptance } from "../acceptance.schema"
import { useAcceptanceModal } from "../acceptance-modal-context"
import { REPAIR_STATUS_OPTIONS } from "../acceptance.constants"
import { Customer } from "@/features/customers"
import { Brand } from "@/features/brands"
import { Model } from "@/features/models"

interface AcceptanceInList extends Acceptance {
  customer?: Pick<Customer, "id" | "name">
  brand?: Pick<Brand, "id" | "name">
  model?: Pick<Model, "id" | "name">
}

const INITIAL_FILTERS = {
  search: "",
  page: 1,
  pageSize: 10,
  isActive: "true",
  current_status: "all",
}

export function AcceptanceList() {
  const deleteMutation = useDeleteAcceptance()
  const bulkDeleteMutation = useDeleteManyAcceptances()
  const bulkStatusUpdateMutation = useUpdateManyAcceptances()
  const { openModal } = useAcceptanceModal()

  const columns: ColumnDef<AcceptanceInList>[] = useMemo(
    () => [
      {
        accessorKey: "acceptance_number",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Number" />,
        cell: ({ row }) => (
          <div
            className="font-medium cursor-pointer hover:underline"
            onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          >
            {row.getValue("acceptance_number")}
          </div>
        ),
      },
      {
        accessorKey: "customer",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
        cell: ({ row }) => row.original.customer?.name ?? "N/A",
      },
      {
        accessorKey: "acceptance_date",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Acceptance Date" />,
        cell: ({ row }) => <DateCell date={row.getValue("acceptance_date")} />,
      },
      {
        accessorKey: "device_type",
        header: "Device Type",
      },
      {
        accessorKey: "brand",
        header: "Brand",
        cell: ({ row }) => row.original.brand?.name ?? "N/A",
      },
      {
        accessorKey: "model",
        header: "Model",
        cell: ({ row }) => row.original.model?.name ?? "N/A",
      },
      {
        accessorKey: "current_status",
        header: "Repair Status",
        cell: ({ row }) => {
          const status = row.getValue("current_status") as string
          return <Badge variant="outline">{status}</Badge>
        },
      },
      {
        accessorKey: "estimated_price",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Est. Price" />,
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("estimated_price"))
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD", // Or any other currency
          }).format(amount)
          return <div className="text-right font-medium">{formatted}</div>
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <ResourceActions
            resource={row.original}
            resourceName="Acceptance"
            resourceTitle={row.original.acceptance_number}
            onView={(acceptance) => openModal({ initialData: acceptance, isViewMode: true })}
            onEdit={(acceptance) => openModal({ initialData: acceptance })}
            deleteMutation={deleteMutation}
          />
        ),
      },
    ],
    [deleteMutation, openModal]
  )

  const filterDefinitions = [
    {
      key: "isActive",
      title: "Status",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
    {
      key: "current_status",
      title: "Repair Status",
      options: REPAIR_STATUS_OPTIONS,
    },
  ]

  return (
    <ResourceListPage<Acceptance, unknown>
      title="Acceptances"
      resourceName="acceptances"
      description="Manage all repair acceptances."
      onAdd={() => openModal()}
      addLabel="Add New Acceptance"
      columns={columns}
      useResourceQuery={useAcceptances}
      bulkDeleteMutation={bulkDeleteMutation}
      bulkStatusUpdateMutation={bulkStatusUpdateMutation}
      initialFilters={INITIAL_FILTERS}
      searchPlaceholder="Filter by customer name..."
      filterDefinitions={filterDefinitions}
    />
  )
}