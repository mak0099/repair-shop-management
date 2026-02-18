"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DateCell, StatusCell } from "@/components/shared/data-table-cells"

import {
  useCategories,
  useDeleteCategory,
  useDeleteManyCategories,
  usePartialUpdateCategory,
  useUpdateManyCategories,
} from "../category.api"
import { Category } from "../category.schema"
import { useCategoryModal } from "../category-modal-context"
import { STATUS_OPTIONS } from "../category.constants"

const CATEGORIES_BASE_HREF = "/dashboard/options/categories"

const INITIAL_FILTERS = {
  search: "",
  page: 1,
  pageSize: 10,
  status: "active",
}

interface CategoryInList extends Category {
    parent?: Pick<Category, 'id' | 'name'>;
}

export function CategoryList() {
  const deleteCategoryMutation = useDeleteCategory()
  const updateCategoryMutation = usePartialUpdateCategory()
  const bulkDeleteMutation = useDeleteManyCategories()
  const bulkStatusUpdateMutation = useUpdateManyCategories()
  const { openModal } = useCategoryModal()

  const columns: ColumnDef<Category>[] = useMemo(
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
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      },
      {
        id: "parent",
        header: "Parent Category",
        cell: ({ row }) => {
            const category = row.original as CategoryInList;
            return category.parent?.name ?? "N/A";
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
            resourceName="Category"
            resourceTitle={row.original.name}
            onView={(category) => openModal({ initialData: category, isViewMode: true })}
            onEdit={(category) => openModal({ initialData: category })}
            deleteMutation={deleteCategoryMutation}
            updateMutation={updateCategoryMutation}
          />
        ),
      },
    ],
    [deleteCategoryMutation, updateCategoryMutation, openModal]
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
      <ResourceListPage<Category, unknown>
        title="Categories"
        resourceName="categories"
        description="Manage categories"
        onAdd={() => openModal()}
        addLabel="Add Category"
        columns={columns}
        useResourceQuery={useCategories}
        bulkDeleteMutation={bulkDeleteMutation}
        bulkStatusUpdateMutation={bulkStatusUpdateMutation}
        initialFilters={INITIAL_FILTERS}
        searchPlaceholder="Search by name..."
        filterDefinitions={filterDefinitions}
      />
    </>
  )
}
