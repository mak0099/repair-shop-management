"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { TitleCell } from "@/components/shared/data-table-cells"
import {
  useBoxNumbers,
  useDeleteBoxNumber,
  useDeleteManyBoxNumbers,
  usePartialUpdateBoxNumber,
  useUpdateManyBoxNumbers,
} from "../box-number.api"
import { BoxNumber } from "../box-number.schema"
import { useBoxNumberModal } from "../box-number-modal-context"

export function BoxNumberList() {
  const deleteBoxNumberMutation = useDeleteBoxNumber()
  const updateBoxNumberMutation = usePartialUpdateBoxNumber()
  const bulkDeleteMutation = useDeleteManyBoxNumbers()
  const bulkStatusUpdateMutation = useUpdateManyBoxNumbers()
  const { openModal } = useBoxNumberModal()

  const columns: ColumnDef<BoxNumber>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Box Name/Number" />,
        cell: ({ row }) => (
          <TitleCell
            value={row.getValue("name")}
            isActive={row.original.isActive}
            onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          />
        ),
      },
      {
        accessorKey: "location",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <ResourceActions
            resource={row.original as BoxNumber & { id: string }}
            resourceName="Box Number"
            resourceTitle={row.original.name}
            onView={(data) => openModal({ initialData: data, isViewMode: true })}
            onEdit={(data) => openModal({ initialData: data })}
            deleteMutation={deleteBoxNumberMutation}
            updateMutation={updateBoxNumberMutation as never}
          />
        ),
      },
    ],
    [openModal, deleteBoxNumberMutation, updateBoxNumberMutation]
  )

  return (
    <ResourceListPage<BoxNumber, unknown>
      title="Box Numbers"
      resourceName="box-numbers"
      description="Manage and track physical storage boxes."
      onAdd={() => openModal()}
      addLabel="Add Box"
      columns={columns}
      useResourceQuery={useBoxNumbers}
      bulkDeleteMutation={bulkDeleteMutation}
      bulkStatusUpdateMutation={bulkStatusUpdateMutation}
      searchPlaceholder="Search name or location..."
    />
  )
}