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

import { useCustomerOptions } from "@/features/customers/customer.api"
import { useBrandOptions } from "@/features/brands/brand.api"
import { useModelOptions } from "@/features/models/model.api"

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

  const { data: customers } = useCustomerOptions()
  const { data: brands } = useBrandOptions()
  const { data: models } = useModelOptions()

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
        accessorKey: "customerId",
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
        customerId: "all",
        brandId: "all",
        modelId: "all",
        acceptanceDate: undefined,
      }}
      searchPlaceholder="Search by No, Customer, Phone"
      filterDefinitions={[
        {
          key: "currentStatus",
          title: "Repair Status",
          options: REPAIR_STATUS_OPTIONS,
        },
        // {
        //   key: "customerId",
        //   title: "Customer",
        //   options: [
        //     { label: "All Customers", value: "all" },
        //     ...(customers?.map((c: { id: string; name: string }) => ({ label: c.name, value: c.id })) || []),
        //   ],
        // },
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