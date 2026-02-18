"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DateCell, StatusCell } from "@/components/shared/data-table-cells"

import {
  useModels,
  useDeleteModel,
  useDeleteManyModels,
  usePartialUpdateModel,
  useUpdateManyModels,
} from "../model.api"
import { Model } from "../model.schema"
import { useModelModal } from "../model-modal-context"
import { STATUS_OPTIONS } from "../model.constants"

const MODELS_BASE_HREF = "/dashboard/options/models"

const INITIAL_FILTERS = {
  search: "",
  page: 1,
  pageSize: 10,
  status: "active",
}

interface ModelInList extends Model {
  brand?: Pick<Brand, "id" | "name">
}

export function ModelList() {
  const deleteModelMutation = useDeleteModel()
  const updateModelMutation = usePartialUpdateModel()
  const bulkDeleteMutation = useDeleteManyModels()
  const bulkStatusUpdateMutation = useUpdateManyModels()
  const { openModal } = useModelModal()

  const columns: ColumnDef<Model>[] = useMemo(
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
        id: "brand",
        header: "Brand",
        cell: ({ row }) => {
          const model = row.original as ModelInList
          return model.brand?.name ?? "N/A"
        },
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
            resourceName="Model"
            resourceTitle={row.original.name}
            onView={(model) => openModal({ initialData: model, isViewMode: true })}
            onEdit={(model) => openModal({ initialData: model })}
            deleteMutation={deleteModelMutation}
            updateMutation={updateModelMutation}
          />
        ),
      },
    ],
    [deleteModelMutation, updateModelMutation, openModal]
  )

  const filterDefinitions = [
    {
      key: "status",
      title: "Status",
      options: STATUS_OPTIONS,
    },
  ]

  return (
    <>
      <ResourceListPage<Model, unknown>
        title="Models"
        resourceName="models"
        description="Manage device models"
        onAdd={() => openModal()}
        addLabel="Add Model"
        columns={columns}
        useResourceQuery={useModels}
        bulkDeleteMutation={bulkDeleteMutation}
        bulkStatusUpdateMutation={bulkStatusUpdateMutation}
        initialFilters={INITIAL_FILTERS}
        searchPlaceholder="Search by name..."
        filterDefinitions={filterDefinitions}
      />
    </>
  )
}
