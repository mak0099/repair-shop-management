"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { DateCell, TitleCell, CurrencyCell } from "@/components/shared/data-table-cells"
import { ResourceActions } from "@/components/shared/resource-actions"

import { useItems, useDeleteItem, useDeleteManyItems, usePartialUpdateItem } from "../item.api"
import { Item } from "../item.schema"
import { useItemModal } from "../item-modal-context"
import { STATUS_OPTIONS } from "../item.constants"

/**
 * Strict type for Item to ensure ID existence during table actions.
 */
type ItemWithId = Item & { id: string };

export function ItemList() {
  const { openModal } = useItemModal()
  const deleteMutation = useDeleteItem()
  const updateMutation = usePartialUpdateItem()
  const bulkDeleteMutation = useDeleteManyItems()

  const columns: ColumnDef<Item>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Product details" />,
      cell: ({ row }) => (
        <TitleCell
          value={row.getValue("name")}
          isActive={row.original.isActive}
          onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          subtitle={
            <div className="flex gap-2 items-center">
              <span className="font-bold uppercase tracking-widest">{row.original.brandId}</span>
              {row.original.ram && (
                <span className="text-blue-500 font-medium italic">
                  ({row.original.ram}/{row.original.rom})
                </span>
              )}
            </div>
          }
        />
      ),
    },
    {
      accessorKey: "condition",
      header: "Condition",
      cell: ({ row }) => (
        <Badge
          variant={row.original.condition === "New" ? "default" : "secondary"}
          className="text-[9px] uppercase font-bold px-1.5 py-0"
        >
          {row.original.condition}
        </Badge>
      )
    },
    {
      accessorKey: "salePrice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Pricing" className="justify-end" />,
      cell: ({ row }) => (
        <CurrencyCell
          amount={row.original.salePrice}
          subtitle={`Cost: ${new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(row.original.purchasePrice)}`}
        />
      )
    },
    {
      accessorKey: "initialStock",
      header: "Qty",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className={row.original.initialStock > 0 ? "font-black text-emerald-600" : "font-black text-destructive"}>
            {row.original.initialStock}
          </span>
          <span className="text-[8px] text-slate-300 uppercase font-bold">In Stock</span>
        </div>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Added",
      cell: ({ row }) => <DateCell date={row.original.createdAt} />,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original as ItemWithId;

        return (
          <ResourceActions
            resourceTitle={item.name}
            resource={item}
            resourceName="Product"
            onView={(data) => openModal({ initialData: data as Item, isViewMode: true })}
            onEdit={(data) => openModal({ initialData: data as Item })}
            deleteMutation={deleteMutation}
            updateMutation={updateMutation}
          />
        )
      }
    }
  ], [openModal, deleteMutation, updateMutation])

  return (
    <ResourceListPage<Item, unknown>
      title="Products & Items"
      description="Detailed catalog of devices, spare parts, and accessories."
      resourceName="products"
      columns={columns}
      useResourceQuery={useItems}
      onAdd={() => openModal()}
      addLabel="New Product"
      bulkDeleteMutation={bulkDeleteMutation}
      searchPlaceholder="Search products or SKU..."
      initialFilters={{ condition: "all" }}
      filterDefinitions={[
        {
          key: "condition",
          title: "Condition",
          options: [
            { label: "All Condition", value: "all" },
            { label: "New", value: "New" },
            { label: "Used", value: "Used" },
          ],
        }
      ]}
    />
  )
}