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
import { useBrandModal } from "../brand-modal-context"
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
  const { openModal } = useBrandModal()

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
        cell: ({ row }) => (
          <div
            className="font-medium cursor-pointer hover:underline"
            onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          >{row.getValue("name")}</div>
        ),
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
            onView={(brand) => openModal({ initialData: brand, isViewMode: true })}
            onEdit={(brand) => openModal({ initialData: brand })}
            deleteMutation={deleteBrandMutation}
            updateMutation={updateBrandMutation}
          />
        ),
      },
    ],
    [deleteBrandMutation, openModal, updateBrandMutation]
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
        onAdd={() => openModal()}
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