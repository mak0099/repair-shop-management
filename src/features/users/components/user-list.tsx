"use client"

import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { TitleCell, DateCell } from "@/components/shared/data-table-cells"
import { Badge } from "@/components/ui/badge"

import { User } from "../user.schema"
import {
  useUsers,
  useDeleteUser,
  useDeleteManyUsers,
  usePartialUpdateUser,
  useUpdateManyUsers,
} from "../user.api"
import { useUserModal } from "../user-modal-context"
import { Role } from "@/features/roles/role.schema"
import { useRoleOptions } from "@/features/roles/role.api"

export function UserList() {
  const { openModal } = useUserModal()
  const deleteMutation = useDeleteUser()
  const updateMutation = usePartialUpdateUser()
  const bulkDeleteMutation = useDeleteManyUsers()
  const bulkUpdateMutation = useUpdateManyUsers()
  const { data: roleOptions } = useRoleOptions()

  const filterDefinitions = [
    {
      key: "roleId",
      title: "Role",
      options: [
        { label: "All Roles", value: "all" },
        ...(roleOptions?.map(r => ({ label: r.name, value: r.id })) || [])
      ]
    }
  ]

  const columns: ColumnDef<User>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "Staff Member",
      cell: ({ row }) => (
        <TitleCell
          value={row.original.name}
          subtitle={row.original.email}
          fallback={row.original.name.substring(0, 2).toUpperCase()}
          onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          isActive={row.original.isActive}
        />
      ),
    },
    {
      accessorKey: "roles",
      header: "Access Roles",
      cell: ({ row }) => {
        const user = row.original as User & { roles: Role[] }
        return (
          <div className="flex flex-wrap gap-1">
            {user.roles?.length > 0 ? (
              user.roles.map((role) => (
                <Badge key={role.id} variant="outline" className="text-[10px] py-0 font-medium border-blue-200 text-blue-700 bg-blue-50">
                  {role.name}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-slate-400">No Role</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => <DateCell date={row.original.createdAt} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ResourceActions
          resource={row.original}
          resourceName="User"
          resourceTitle={row.original.name}
          onView={(user) => openModal({ initialData: user, isViewMode: true })}
          onEdit={(user) => openModal({ initialData: user })}
          deleteMutation={deleteMutation}
          updateMutation={updateMutation}
        />
      ),
    },
  ], [openModal, deleteMutation, updateMutation])

  return (
    <ResourceListPage<User, unknown>
      title="Users"
      resourceName="users"
      description="Manage staff accounts and their branch assignments"
      onAdd={() => openModal()}
      addLabel="Add Staff"
      columns={columns}
      useResourceQuery={useUsers}
      bulkDeleteMutation={bulkDeleteMutation}
      bulkStatusUpdateMutation={bulkUpdateMutation}
      searchPlaceholder="Search by name or email..."
      filterDefinitions={filterDefinitions}
    />
  )
}