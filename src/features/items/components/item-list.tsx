"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DateCell, StatusCell } from "@/components/shared/data-table-cells"

import {
  useItems,
  useDeleteItem,
  useDeleteManyItems,
  usePartialUpdateItem,
  useUpdateManyItems,
} from "../item.api"
import { Item } from "../item.schema"
import { useItemModal } from "../item-modal-context"
import { STATUS_OPTIONS, TYPE_OPTIONS } from "../item.constants"

const INITIAL_FILTERS = {
  search: "",
  page: 1,
  pageSize: 10,
  status: "active",
  type: "all",
}

export function ItemList() {
  const deleteItemMutation = useDeleteItem()
  const updateItemMutation = usePartialUpdateItem()
  const bulkDeleteMutation = useDeleteManyItems()
  const bulkStatusUpdateMutation = useUpdateManyItems()
  const { openModal } = useItemModal()

  const columns: ColumnDef<Item>[] = useMemo(
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
        accessorKey: "sku",
        header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
      },
      {
        accessorKey: "type",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      },
      {
        accessorKey: "price",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
        cell: ({ row }) => `€${row.original.price.toFixed(2)}`,
      },
       {
        accessorKey: "stock_qty",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
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
            resourceName="Item"
            onView={(item) => openModal({ initialData: item, isViewMode: true })}
            onEdit={(item) => openModal({ initialData: item })}
            deleteMutation={deleteItemMutation}
            updateMutation={updateItemMutation}
          />
        ),
      },
    ],
    [deleteItemMutation, updateItemMutation, openModal]
  )

  const filterDefinitions = [
    {
      key: "status",
      title: "Status",
      options: STATUS_OPTIONS,
    },
    {
      key: "type",
      title: "Type",
      options: TYPE_OPTIONS,
    },
  ]

  return (
    <>
      <ResourceListPage<Item, unknown>
        title="Items"
        resourceName="items"
        description="Manage inventory items"
        onAdd={() => openModal()}
        addLabel="Add Item"
        columns={columns}
        useResourceQuery={useItems}
        bulkDeleteMutation={bulkDeleteMutation}
        bulkStatusUpdateMutation={bulkStatusUpdateMutation}
        initialFilters={INITIAL_FILTERS}
        searchPlaceholder="Search by name or SKU..."
        filterDefinitions={filterDefinitions}
      />
    </>
  )
}
