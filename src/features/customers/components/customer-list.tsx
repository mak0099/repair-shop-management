"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { StatusCell } from "@/components/shared/data-table-cells"
import {
  useCustomers,
  useDeleteCustomer,
  useDeleteManyCustomers,
  useUpdateCustomer,
  useUpdateManyCustomers,
} from "../customer.api"
import { INITIAL_FILTERS, ROLE_OPTIONS, STATUS_OPTIONS } from "../customer.constants"
import { Customer } from "../customer.schema"
import { ResourceActions } from "@/components/shared/resource-actions"
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
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => (
          <div
            className="font-medium cursor-pointer hover:underline"
            onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          >{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "mobile",
        header: "Mobile",
      },
      {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      },
      {
        accessorKey: "isDealer",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Dealer?" />,
        cell: ({ row }) => <StatusCell isActive={row.original.isDealer} />,
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <ResourceActions
            resource={row.original}
            resourceName="Customer"
            onView={(customer) => openModal({ initialData: customer, isViewMode: true })}
            onEdit={(customer) => openModal({ initialData: customer })}
            deleteMutation={deleteCustomerMutation}
            updateMutation={updateCustomerMutation}
          />
        ),
      },
    ],
    [deleteCustomerMutation, updateCustomerMutation, openModal]
  )

  const filterDefinitions = [
    {
      key: "status",
      title: "Status",
      options: STATUS_OPTIONS,
    },
    {
      key: "isDealer",
      title: "Role",
      options: ROLE_OPTIONS,
    },
  ]

  return (
    <ResourceListPage<Customer, unknown>
      title="Customers"
      resourceName="customers"
      description="Manage customer database"
      onAdd={() => openModal()}
      addLabel="Add Customer"
      columns={columns}
      useResourceQuery={useCustomers}
      bulkDeleteMutation={bulkDeleteMutation}
      bulkStatusUpdateMutation={bulkStatusUpdateMutation}
      initialFilters={INITIAL_FILTERS}
      searchPlaceholder="Search by name, email, or phone..."
      filterDefinitions={filterDefinitions}
    />
  )
}