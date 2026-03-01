"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { UseMutationResult } from "@tanstack/react-query"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DateCell, ImageCell, StatusCell, TitleCell } from "@/components/shared/data-table-cells"

import {
  useBrands,
  useDeleteBrand,
  useDeleteManyBrands,
  usePartialUpdateBrand,
  useUpdateManyBrands,
} from "../brand.api"
import { Brand } from "../brand.schema"
import { useBrandModal } from "../brand-modal-context"

/**
 * Strict type for Brand to ensure ID existence during actions.
 */
type BrandWithId = Brand & { id: string };

export function BrandList() {
  const deleteBrandMutation = useDeleteBrand()
  const updateBrandMutation = usePartialUpdateBrand()
  const bulkDeleteMutation = useDeleteManyBrands()
  const bulkStatusUpdateMutation = useUpdateManyBrands()
  const { openModal } = useBrandModal()

  const columns: ColumnDef<Brand>[] = useMemo(
    () => [
      {
        accessorKey: "logo",
        header: "Logo",
        cell: ({ row }) => (
          <ImageCell
            src={row.original.logo}
            alt={row.original.name}
            size={40}
            shape="rounded"
          // fallbackText was removed from here to fix the type error
          />
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Brand Name" />,
        cell: ({ row }) => (
          <TitleCell
            value={row.getValue("name")}
            isActive={row.original.isActive}
            onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          />
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
        cell: ({ row }) => <DateCell date={row.original.createdAt} />,
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const brand = row.original as BrandWithId;

          return (
            <ResourceActions
              resource={brand}
              resourceName="Brand"
              resourceTitle={brand.name}
              onView={(data) => openModal({ initialData: data as Brand, isViewMode: true })}
              onEdit={(data) => openModal({ initialData: data as Brand })}
              deleteMutation={deleteBrandMutation}
              updateMutation={updateBrandMutation}
            />
          )
        },
      },
    ],
    [deleteBrandMutation, openModal, updateBrandMutation]
  )

  return (
    <ResourceListPage<Brand, unknown>
      title="Brands"
      resourceName="brands"
      description="Manage the list of supported mobile and gadget brands."
      onAdd={() => openModal()}
      addLabel="New Brand"
      columns={columns}
      useResourceQuery={useBrands}
      bulkDeleteMutation={bulkDeleteMutation}
      bulkStatusUpdateMutation={bulkStatusUpdateMutation}
      searchPlaceholder="Search brands..."
    />
  )
}