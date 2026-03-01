"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DateCell, StatusCell, TitleCell } from "@/components/shared/data-table-cells"

import {
  useSuppliers,
  useDeleteSupplier,
  useDeleteManySuppliers,
  usePartialUpdateSupplier,
  useUpdateManySuppliers,
} from "../supplier.api"
import { Supplier } from "../supplier.schema"
import { useSupplierModal } from "../supplier-modal-context"

export function SupplierList() {
  const deleteSupplierMutation = useDeleteSupplier()
  const updateSupplierMutation = usePartialUpdateSupplier()
  const bulkDeleteMutation = useDeleteManySuppliers()
  const bulkStatusUpdateMutation = useUpdateManySuppliers()
  const { openModal } = useSupplierModal()

  const columns: ColumnDef<Supplier>[] = useMemo(
    () => [
      {
        accessorKey: "company_name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Company Name" />,
        cell: ({ row }) => (
          <TitleCell
            value={row.getValue("company_name")}
            isActive={row.original.isActive}
            onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          />
        ),
      },
      {
        accessorKey: "contact_person",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Contact Person" />,
      },
      {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      },
      {
        accessorKey: "phone",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
      },
      {
        accessorKey: "city",
        header: ({ column }) => <DataTableColumnHeader column={column} title="City" />,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => <DateCell date={row.original.createdAt} isActive={row.original.isActive} />,
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <ResourceActions
            resource={row.original}
            resourceName="Supplier"
            resourceTitle={row.original.company_name}
            onView={(supplier) => openModal({ initialData: supplier, isViewMode: true })}
            onEdit={(supplier) => openModal({ initialData: supplier })}
            deleteMutation={deleteSupplierMutation}
            updateMutation={updateSupplierMutation}
          />
        ),
      },
    ],
    [deleteSupplierMutation, updateSupplierMutation, openModal]
  )

  return (
    <>
      <ResourceListPage<Supplier, unknown>
        title="Suppliers"
        resourceName="suppliers"
        description="Manage suppliers"
        onAdd={() => openModal()}
        addLabel="Add Supplier"
        columns={columns}
        useResourceQuery={useSuppliers}
        bulkDeleteMutation={bulkDeleteMutation}
        bulkStatusUpdateMutation={bulkStatusUpdateMutation}
        searchPlaceholder="Search by company name or contact..."
      />
    </>
  )
}
