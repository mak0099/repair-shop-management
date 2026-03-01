"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { StatusCell, TitleCell } from "@/components/shared/data-table-cells"

import {
  useCustomers,
  useDeleteCustomer,
  useDeleteManyCustomers,
  useUpdateCustomer,
  useUpdateManyCustomers,
} from "../customer.api"
import { Customer } from "../customer.schema"
import { useCustomerModal } from "../customer-modal-context"

export function CustomerList() {
  const deleteCustomerMutation = useDeleteCustomer()
  const updateCustomerMutation = useUpdateCustomer()
  const bulkDeleteMutation = useDeleteManyCustomers()
  const bulkStatusUpdateMutation = useUpdateManyCustomers()
  const { openModal } = useCustomerModal()

  const columns: ColumnDef<Customer>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Customer Name" />,
        cell: ({ row }) => (
          <TitleCell
            value={row.getValue("name")}
            isActive={row.original.isActive}
            onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          />
        ),
      },
      {
        accessorKey: "mobile",
        header: "Contact Number",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.mobile}</span>,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-slate-500">{row.original.email || "—"}</span>,
      },
      {
        accessorKey: "isDealer",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Dealer?" className="justify-center" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <StatusCell isActive={row.original.isDealer} />
          </div>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <ResourceActions
            resource={row.original}
            resourceName="Customer"
            resourceTitle={row.original.name}
            onView={() => openModal({ initialData: row.original, isViewMode: true })}
            onEdit={() => openModal({ initialData: row.original })}

            deleteMutation={deleteCustomerMutation}
            updateMutation={updateCustomerMutation}
          />
        ),
      },
    ],
    [deleteCustomerMutation, updateCustomerMutation, openModal]
  )

  return (
    <ResourceListPage<Customer, unknown>
      title="Customers"
      resourceName="customers"
      description="Manage your client base, including retail customers and business dealers."
      onAdd={() => openModal()}
      addLabel="Add New Customer"
      columns={columns}
      useResourceQuery={useCustomers}
      bulkDeleteMutation={bulkDeleteMutation}
      bulkStatusUpdateMutation={bulkStatusUpdateMutation}
      initialFilters={{
        isDealer: "all",
      }}
      searchPlaceholder="Search by name, mobile, or email..."
      filterDefinitions={[
        {
          key: "isDealer", title: "Type", options: [
            { label: "All Customers", value: "all" },
            { label: "Dealer", value: "true" },
            { label: "Regular", value: "false" },
          ]
        },
      ]}
    />
  )
}