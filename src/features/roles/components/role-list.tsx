"use client"

import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ShieldAlert, ShieldCheck } from "lucide-react"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { Badge } from "@/components/ui/badge"

import { Role } from "../role.schema"
import { useRoles, useDeleteRole, useUpdateRole } from "../role.api"
import { useRoleModal } from "../role-modal-context"

export function RoleList() {
    const { openModal } = useRoleModal()
    const deleteMutation = useDeleteRole()
    const updateMutation = useUpdateRole()

    const columns: ColumnDef<Role>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Role Name" />,
            cell: ({ row }) => (
                <div
                    className="flex items-center gap-2 font-bold cursor-pointer hover:underline text-foreground"
                    onClick={() => openModal({ initialData: row.original, isViewMode: true })}
                >
                    {row.original.isSystem ? (
                        <ShieldCheck className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    ) : (
                        <ShieldAlert className="h-4 w-4 text-primary" />
                    )}
                    {row.original.name}
                </div>
            ),
        },
        {
            accessorKey: "slug",
            header: "Identifier",
            cell: ({ row }) => <code className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">{row.getValue("slug")}</code>,
        },
        {
            accessorKey: "permissions",
            header: "Capabilities",
            cell: ({ row }) => (
                <Badge variant="outline" className="font-medium text-primary border-primary/20 bg-primary/10">
                    {row.original.permissions?.length || 0} Permissions
                </Badge>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <ResourceActions
                    resource={row.original}
                    resourceName="Role"
                    resourceTitle={row.original.name}
                    // System roles should usually not be deleted
                    onView={(role) => openModal({ initialData: role, isViewMode: true })}
                    onEdit={row.original.isSystem ? undefined : (role) => openModal({ initialData: role })}
                    deleteMutation={row.original.isSystem ? undefined : deleteMutation}
                    updateMutation={row.original.isSystem ? undefined : updateMutation}
                />
            ),
        },
    ], [openModal, deleteMutation, updateMutation])

    return (
        <ResourceListPage<Role, unknown>
            title="Access Roles"
            resourceName="roles"
            description="Define what your staff can see and do in the system"
            onAdd={() => openModal()}
            addLabel="New Role"
            columns={columns}
            useResourceQuery={useRoles}
            searchPlaceholder="Search roles by name..."
        />
    )
}