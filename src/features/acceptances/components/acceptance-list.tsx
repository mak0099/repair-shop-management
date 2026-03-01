"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DateCell, CurrencyCell } from "@/components/shared/data-table-cells"
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

export function AcceptanceList() {
  const deleteMutation = useDeleteAcceptance()
  const bulkDeleteMutation = useDeleteManyAcceptances()
  const bulkStatusUpdateMutation = useUpdateManyAcceptances()
  const { openModal } = useAcceptanceModal()

  const columns: ColumnDef<AcceptanceInList>[] = useMemo(
    () => [
      {
        accessorKey: "acceptanceNumber",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Number" />,
        cell: ({ row }) => (
          <div
            className="font-medium cursor-pointer hover:underline"
            onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          >
            {row.getValue("acceptanceNumber")}
          </div>
        ),
      },
      {
        accessorKey: "customer",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
        cell: ({ row }) => row.original.customer?.name ?? "N/A",
      },
      {
        accessorKey: "acceptanceDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Acceptance Date" />,
        cell: ({ row }) => <DateCell date={row.getValue("acceptanceDate")} />,
      },
      // {
      //   accessorKey: "deviceType",
      //   header: "Device Type",
      // },
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
        accessorKey: "currentStatus",
        header: "Repair Status",
        cell: ({ row }) => {
          const status = row.getValue("currentStatus") as string
          return <Badge variant="outline">{status}</Badge>
        },
      },
      {
        accessorKey: "estimatedPrice",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Est. Price" className="justify-end" />,
        cell: ({ row }) => <CurrencyCell amount={row.getValue("estimatedPrice")} />,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <ResourceActions
            resource={row.original}
            resourceName="Acceptance"
            resourceTitle={row.original.acceptanceNumber}
            onView={(acceptance) => openModal({ initialData: acceptance, isViewMode: true })}
            onEdit={(acceptance) => openModal({ initialData: acceptance })}
            deleteMutation={deleteMutation}
          />
        ),
      },
    ],
    [deleteMutation, openModal]
  )

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
      initialFilters={{
        currentStatus: "all",
      }}
      searchPlaceholder="Filter by customer name..."
      filterDefinitions={[
        {
          key: "currentStatus",
          title: "Repair Status",
          options: REPAIR_STATUS_OPTIONS,
        },
      ]}
    />
  )
}