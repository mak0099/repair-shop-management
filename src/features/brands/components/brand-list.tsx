"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DateCell, ImageCell, StatusCell } from "@/components/shared/data-table-cells"

import {
  useBrands,
  useDeleteBrand,
  useDeleteManyBrands,
  usePartialUpdateBrand,
  useUpdateManyBrands,
} from "../brand.api"
import { Brand } from "../brand.schema"
import { useAddBrandModal } from "../add-brand-modal-context" // Import the new hook
import { BRANDS_BASE_HREF } from "@/config/paths"
import { STATUS_OPTIONS } from "../brand.constants"

const INITIAL_FILTERS = {
  search: "",
  page: 1,
  pageSize: 10,
  status: "active",
}

export function BrandList() {
  const deleteBrandMutation = useDeleteBrand()
  const updateBrandMutation = usePartialUpdateBrand()
  const bulkDeleteMutation = useDeleteManyBrands()
  const bulkStatusUpdateMutation = useUpdateManyBrands()
  const { openModal: openAddBrandModal } = useAddBrandModal()

  const columns: ColumnDef<Brand>[] = useMemo(
    () => [
      {
        accessorKey: "logo",
        header: "Logo",
        cell: ({ row }) => (
          <ImageCell src={row.original.logo} alt={row.original.name} fallbackText={<>No <br /> Logo</>} />
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
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
            resourceName="Brand"
            baseEditHref={BRANDS_BASE_HREF}
            deleteMutation={deleteBrandMutation}
            updateMutation={updateBrandMutation}
          />
        ),
      },
    ],
    [deleteBrandMutation, updateBrandMutation]
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
      <ResourceListPage<Brand, unknown>
        title="Brands"
        resourceName="brands"
        description="Manage brand database"
        onAdd={openAddBrandModal}
        addLabel="Add Brand"
        columns={columns}
        useResourceQuery={useBrands}
        bulkDeleteMutation={bulkDeleteMutation}
        bulkStatusUpdateMutation={bulkStatusUpdateMutation}
        initialFilters={INITIAL_FILTERS}
        searchPlaceholder="Search by name..."
        filterDefinitions={filterDefinitions}
      />
    </>
  )
}