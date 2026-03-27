"use client"

import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { DateCell, TitleCell, CurrencyCell, CurrencyText } from "@/components/shared/data-table-cells"
import { ResourceActions } from "@/components/shared/resource-actions"

import { useItems, useDeleteItem, useDeleteManyItems, usePartialUpdateItem } from "../item.api"
import { Item } from "../item.schema"
import { ITEM_TYPE_OPTIONS, ITEM_TYPE_COLORS } from "../item.constants"
import { useItemModal } from "../item-modal-context"

/**
 * Strict type for Item to ensure ID existence during table actions.
 */
type ItemWithId = Item & { id: string };

export function ItemList() {
  const { openModal } = useItemModal()
  const deleteMutation = useDeleteItem()
  const updateMutation = usePartialUpdateItem()
  const bulkDeleteMutation = useDeleteManyItems()

  // Local state for itemType filter (driven by tabs)
  const [itemTypeFilter, setItemTypeFilter] = useState<string>("all")

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
            <div className="flex flex-col gap-0.5 mt-1">
              <div className="flex gap-2 items-center">
              {row.original.subtitle && (
                <span className="text-[10px] text-muted-foreground">{row.original.subtitle}</span>
              )}
                {row.original.ram && (
                  <span className="text-blue-500 font-medium italic">
                    ({row.original.ram}/{row.original.rom})
                  </span>
                )}
              </div>
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
          variant={row.original.condition === "NEW" ? "default" : "secondary"}
          className="text-[9px] uppercase font-bold px-1.5 py-0"
        >
          {row.original.condition}
        </Badge>
      )
    },
    {
      accessorKey: "itemType",
      header: "Type",
      cell: ({ row }) => {
        const itemType = (row.original.itemType || "DEVICE") as keyof typeof ITEM_TYPE_COLORS
        return (
          <Badge
            variant="outline"
            className={`text-[9px] uppercase font-bold px-1.5 py-0 ${ITEM_TYPE_COLORS[itemType].badge}`}
          >
            {row.original.itemType || "DEVICE"}
          </Badge>
        )
      }
    },
    {
      accessorKey: "salePrice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Pricing" className="justify-end" />,
      cell: ({ row }) => (
        <CurrencyCell
          amount={row.original.salePrice}
          subtitle={<>Cost: <CurrencyText amount={row.original.purchasePrice} /></>}
        />
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
      initialFilters={{ condition: "all", itemType: itemTypeFilter }}
      filterDefinitions={[
        {
          key: "condition",
          title: "Condition",
          options: [
            { label: "All Condition", value: "all" },
            { label: "New", value: "NEW" },
            { label: "Used", value: "USED" },
            { label: "Refurbished", value: "REFURBISHED" },
          ],
        },
      ]}
      tabs={{
        enabled: true,
        position: "bottom",
        selectedValue: itemTypeFilter,
        onChange: setItemTypeFilter,
        filterKey: "itemType", // Auto-calculate counts by grouping on itemType
        options: [
          { label: "All Types", value: "all" },
          ...ITEM_TYPE_OPTIONS,
        ],
        colors: {
          all: "border-border",
          ...Object.fromEntries(
            Object.entries(ITEM_TYPE_COLORS).map(([key, val]) => [key, val.tab])
          ),
        },
      }}
    />
  )
}