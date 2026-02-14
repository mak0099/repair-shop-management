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
import { BRANCH_OPTIONS, INITIAL_FILTERS, ROLE_OPTIONS, STATUS_OPTIONS } from "../customer.constants"
import { Customer } from "../customer.schema"
import { CUSTOMERS_ADD_HREF, CUSTOMERS_BASE_HREF } from "@/config/paths"
import { ResourceActions } from "@/components/shared/resource-actions"

export function CustomerList() {
  const deleteCustomerMutation = useDeleteCustomer()
  const updateCustomerMutation = useUpdateCustomer()
  const bulkDeleteMutation = useDeleteManyCustomers()
  const bulkStatusUpdateMutation = useUpdateManyCustomers()

  const columns: ColumnDef<Customer>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      },
      {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      },
      {
        accessorKey: "customerTypes",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      },
      {
        accessorKey: "mobile",
        header: "Mobile",
      },
      {
        accessorKey: "branch.name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Branch" />,
        cell: ({ row }) => <div>{row.original.branch?.name || "-"}</div>,
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Active?" />,
        cell: ({ row }) => <StatusCell isActive={row.original.isActive} />,
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <ResourceActions
            resource={row.original}
            resourceName="Customer"
            baseEditHref={CUSTOMERS_BASE_HREF}
            deleteMutation={deleteCustomerMutation}
            updateMutation={updateCustomerMutation}
          />
        ),
      },
    ],
    [deleteCustomerMutation, updateCustomerMutation]
  )

  const filterDefinitions = [
    {
      key: "role",
      title: "Role",
      options: ROLE_OPTIONS,
    },
    {
      key: "branch",
      title: "Branch",
      options: BRANCH_OPTIONS,
    },
    {
      key: "status",
      title: "Status",
      options: STATUS_OPTIONS,
    },
  ]

  return (
    <ResourceListPage<Customer, unknown>
      title="Customers"
      resourceName="customers"
      description="Manage customer database"
      addHref={CUSTOMERS_ADD_HREF}
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