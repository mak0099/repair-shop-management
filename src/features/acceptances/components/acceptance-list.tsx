"use client"

import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DateCell, CurrencyCell } from "@/components/shared/data-table-cells"
import { Badge } from "@/components/ui/badge"

import { useAcceptances, useDeleteAcceptance, useDeleteManyAcceptances, useUpdateManyAcceptances } from "../acceptance.api"
import { Acceptance } from "../acceptance.schema"
import { useAcceptanceModal } from "../acceptance-modal-context"
import { useTicketWorkspaceModal } from "../ticket-workspace-modal-context"
import { Customer } from "@/features/customers"
import { Brand } from "@/features/brands"
import { Model } from "@/features/models"

import { useBrandOptions } from "@/features/brands/brand.api"
import { useModelOptions } from "@/features/models/model.api"
import { REPAIR_STATUS_OPTIONS, getStatusColors, STATUS_COLORS, KANBAN_COLUMNS } from "../acceptance.constants"

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
  const { openModal: openWorkspaceModal } = useTicketWorkspaceModal()
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const { data: brands } = useBrandOptions()
  const { data: models } = useModelOptions()
  const { data: allAcceptances } = useAcceptances({ page: 1, pageSize: 1000 })

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 }
    KANBAN_COLUMNS.forEach(status => {
      counts[status] = 0
    })
    
    allAcceptances?.data?.forEach((acceptance) => {
      counts.all++
      if (counts[acceptance.currentStatus] !== undefined) {
        counts[acceptance.currentStatus]++
      }
    })
    return counts
  }, [allAcceptances])

  const columns: ColumnDef<AcceptanceInList>[] = useMemo(
    () => [
      {
        accessorKey: "acceptanceNumber",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Number" />,
        cell: ({ row }) => (
          <div
            className="font-medium cursor-pointer hover:underline"
            onClick={() => openWorkspaceModal({ initialData: row.original })}
          >
            {row.getValue("acceptanceNumber")}
          </div>
        ),
      },
      {
        accessorKey: "customerId",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
        cell: ({ row }) => row.original.customer?.name ?? "N/A",
      },
      {
        accessorKey: "acceptanceDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Acceptance Date" />,
        cell: ({ row }) => <DateCell date={row.getValue("acceptanceDate")} />,
      },
      {
        accessorKey: "brandId",
        header: "Brand",
        cell: ({ row }) => row.original.brand?.name ?? "N/A",
      },
      {
        accessorKey: "modelId",
        header: "Model",
        cell: ({ row }) => row.original.model?.name ?? "N/A",
      },
      {
        accessorKey: "currentStatus",
        header: "Repair Status",
        cell: ({ row }) => {
          const status = row.getValue("currentStatus") as string
          const colors = getStatusColors(status as keyof typeof STATUS_COLORS)
          return (
            <Badge 
              className={`${colors.bg} ${colors.text} ${colors.accent} border`}
            >
              {colors.label}
            </Badge>
          )
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
            onView={(acceptance) => openWorkspaceModal({ initialData: acceptance })}
            onEdit={(acceptance) => openModal({ initialData: acceptance })}
            deleteMutation={deleteMutation}
          />
        ),
      },
    ],
    [deleteMutation, openModal, openWorkspaceModal]
  )

  return (
    <ResourceListPage<Acceptance, unknown>
      key={selectedStatus}
      title="Acceptances"
      resourceName="acceptances"
      description="Manage all repair acceptances."
      onAdd={() => openModal()}
      addLabel="New Acceptance"
      columns={columns}
      useResourceQuery={useAcceptances}
      bulkDeleteMutation={bulkDeleteMutation}
      bulkStatusUpdateMutation={bulkStatusUpdateMutation}
      initialFilters={{
        currentStatus: selectedStatus,
        customerId: "all",
        brandId: "all",
        modelId: "all",
        acceptanceDate: undefined,
      }}
      searchPlaceholder="Search by No, Customer, Phone"
      tabs={{
        enabled: true,
        position: "card",
        selectedValue: selectedStatus,
        onChange: setSelectedStatus,
        counts: statusCounts,
        options: [
          { label: "All", value: "all" },
          ...KANBAN_COLUMNS.map((status) => ({
            label: REPAIR_STATUS_OPTIONS.find(opt => opt.value === status)?.label || status,
            value: status,
          })),
        ],
        colors: {
          all: "border-border",
          ...Object.entries(STATUS_COLORS).reduce(
            (acc, [status, colors]) => ({
              ...acc,
              [status]: colors.accent,
            }),
            {}
          ),
        },
      }}
      filterDefinitions={[
        {
          key: "brandId",
          title: "Brand",
          options: [
            { label: "All Brands", value: "all" },
            ...(brands?.map((b: { id: string; name: string }) => ({ label: b.name, value: b.id })) || []),
          ],
        },
        {
          key: "modelId",
          title: "Model",
          options: [
            { label: "All Models", value: "all" },
            ...(models?.map((m: { id: string; name: string }) => ({ label: m.name, value: m.id })) || []),
          ],
        },
        {
          key: "acceptanceDate",
          title: "Acceptance Date Range",
          type: "date-range",
        },
      ]}
    />
  )
}