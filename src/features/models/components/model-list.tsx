"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DateCell, StatusCell, TitleCell } from "@/components/shared/data-table-cells"

/**
 * FIX 1: Import the Brand type from its schema.
 */
import { Brand } from "@/features/brands/brand.schema"
import {
  useModels,
  useDeleteModel,
  useDeleteManyModels,
  usePartialUpdateModel,
  useUpdateManyModels,
} from "../model.api"
import { Model } from "../model.schema"
import { useModelModal } from "../model-modal-context"


interface ModelInList extends Model {
  brand?: Pick<Brand, 'id' | 'name'>;
}

export function ModelList() {
  const deleteModelMutation = useDeleteModel()
  const updateModelMutation = usePartialUpdateModel()
  const bulkDeleteMutation = useDeleteManyModels()
  const bulkStatusUpdateMutation = useUpdateManyModels()
  const { openModal } = useModelModal()

  const columns: ColumnDef<ModelInList>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => (
          <TitleCell
            value={row.getValue("name")}
            isActive={row.original.isActive}
            onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          />
        ),
      },
      {
        id: "brand",
        header: "Brand",
        cell: ({ row }) => {
          return row.original.brand?.name ?? <span className="text-slate-400 italic">N/A</span>
        },
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
            resourceName="Model"
            resourceTitle={row.original.name}
            onView={(model) => openModal({ initialData: model as Model, isViewMode: true })}
            onEdit={(model) => openModal({ initialData: model as Model })}
            deleteMutation={deleteModelMutation}
            updateMutation={updateModelMutation}
          />
        ),
      },
    ],
    [deleteModelMutation, updateModelMutation, openModal]
  )

  return (
    <ResourceListPage<ModelInList, unknown>
      title="Models"
      resourceName="models"
      description="Manage device models and versions"
      onAdd={() => openModal()}
      addLabel="Add Model"
      columns={columns}
      useResourceQuery={useModels}
      bulkDeleteMutation={bulkDeleteMutation}
      bulkStatusUpdateMutation={bulkStatusUpdateMutation}
      searchPlaceholder="Search by model name..."
    />
  )
}