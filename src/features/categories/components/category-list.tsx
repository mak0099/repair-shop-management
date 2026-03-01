"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DateCell, StatusCell, TitleCell } from "@/components/shared/data-table-cells"

import {
  useCategories,
  useDeleteCategory,
  useDeleteManyCategories,
  usePartialUpdateCategory,
  useUpdateManyCategories,
} from "../category.api"
import { Category } from "../category.schema"
import { useCategoryModal } from "../category-modal-context"

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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Category Name" />,
        cell: ({ row }) => (
          <TitleCell
            value={row.getValue("name")}
            isActive={row.original.isActive}
            onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          />
        ),
      },
      {
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({ row }) => (
          <span className="text-muted-foreground line-clamp-1">
            {row.original.description || "—"}
          </span>
        ),
      },
      {
        id: "parent",
        header: "Parent Category",
        cell: ({ row }) => {
          const category = row.original as CategoryInList;
          return category.parent?.name ?? "Main Category";
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
            resourceName="Category"
            resourceTitle={row.original.name}
            onView={(category) => openModal({ initialData: category as Category, isViewMode: true })}
            onEdit={(category) => openModal({ initialData: category as Category })}
            deleteMutation={deleteCategoryMutation}
            updateMutation={updateCategoryMutation}
          />
        ),
      },
    ],
    [deleteCategoryMutation, updateCategoryMutation, openModal]
  )

  return (
    <ResourceListPage<Category, unknown>
      title="Categories"
      resourceName="categories"
      description="Organize your inventory with a hierarchical category structure."
      onAdd={() => openModal()}
      addLabel="Add Category"
      columns={columns}
      useResourceQuery={useCategories}
      bulkDeleteMutation={bulkDeleteMutation}
      bulkStatusUpdateMutation={bulkStatusUpdateMutation}
      searchPlaceholder="Search category name..."
    />
  )
}