"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DateCell, StatusCell } from "@/components/shared/data-table-cells"

import {
  useUsers,
  useDeleteUser,
  useDeleteManyUsers,
  usePartialUpdateUser,
  useUpdateManyUsers,
} from "../user.api"
import { User } from "../user.schema"
import { useUserModal } from "../user-modal-context"
import { STATUS_OPTIONS, ROLE_OPTIONS } from "../user.constants"

const INITIAL_FILTERS = {
  search: "",
  page: 1,
  pageSize: 10,
  status: "active",
  role: "all",
}

export function UserList() {
  const deleteUserMutation = useDeleteUser()
  const updateUserMutation = usePartialUpdateUser()
  const bulkDeleteMutation = useDeleteManyUsers()
  const bulkStatusUpdateMutation = useUpdateManyUsers()
  const { openModal } = useUserModal()

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => (
          <div className="font-medium cursor-pointer hover:underline" onClick={() => openModal({ initialData: row.original, isViewMode: true })}>
            {row.getValue("name")}
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      },
      {
        accessorKey: "role",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      },
      {
        accessorKey: "branch_id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Branch ID" />,
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Active?" />,
        cell: ({ row }) => <StatusCell isActive={row.original.isActive} />,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => <DateCell date={row.original.createdAt} />,
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <ResourceActions
            resource={row.original}
            resourceName="User"
            resourceTitle={row.original.name}
            onView={(user) => openModal({ initialData: user, isViewMode: true })}
            onEdit={(user) => openModal({ initialData: user })}
            deleteMutation={deleteUserMutation}
            updateMutation={updateUserMutation}
          />
        ),
      },
    ],
    [deleteUserMutation, updateUserMutation, openModal]
  )

  const filterDefinitions = [
    {
      key: "status",
      title: "Status",
      options: STATUS_OPTIONS,
    },
    {
        key: "role",
        title: "Role",
        options: ROLE_OPTIONS,
    }
  ]

  return (
    <>
      <ResourceListPage<User, unknown>
        title="Users"
        resourceName="users"
        description="Manage system users"
        onAdd={() => openModal()}
        addLabel="Add User"
        columns={columns}
        useResourceQuery={useUsers}
        bulkDeleteMutation={bulkDeleteMutation}
        bulkStatusUpdateMutation={bulkStatusUpdateMutation}
        initialFilters={INITIAL_FILTERS}
        searchPlaceholder="Search by name or email..."
        filterDefinitions={filterDefinitions}
      />
    </>
  )
}
