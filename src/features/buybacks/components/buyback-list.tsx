"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { DateCell, TitleCell, CurrencyCell } from "@/components/shared/data-table-cells"
import { ResourceActions } from "@/components/shared/resource-actions"

import { useBuybacks, useDeleteBuyback, useDeleteManyBuybacks } from "../buyback.api"
import { Buyback } from "../buyback.schema"
import { useBuybackModal } from "../buyback-modal-context"
import { Customer } from "@/features/customers"
import { Item } from "@/features/items"

interface BuybackInList extends Buyback {
  customer?: Pick<Customer, "id" | "name">
}

export function BuybackList() {
    const { openModal } = useBuybackModal()
    const deleteMutation = useDeleteBuyback()
    const bulkDeleteMutation = useDeleteManyBuybacks()

    const columns: ColumnDef<BuybackInList>[] = useMemo(() => [
        {
            accessorKey: "buybackNumber",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Reference" />,
            cell: ({ row }) => (
                <TitleCell
                    value={row.original.buybackNumber}
                    subtitle={`${row.original.items?.length || 0} Devices`}
                    onClick={() => openModal({ initialData: row.original, isViewMode: true })}
                />
            ),
        },
        {
            accessorKey: "customerId",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
            cell: ({ row }) => row.original.customer?.name ?? "N/A",
        },
        {
            accessorKey: "device",
            header: "Device",
            cell: ({ row }) => {
                const items = row.original.items || [];
                if (items.length === 1) return items[0].name;
                return `${items.length} Items`;
            }
        },
        {
            accessorKey: "totalAmount",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Total Price" className="justify-end" />,
            cell: ({ row }) => <CurrencyCell amount={row.original.totalAmount} />,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                const colorMap: Record<string, string> = {
                    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
                    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
                    CANCELLED: "bg-red-100 text-red-700 border-red-200",
                };
                return (
                    <Badge className={`text-[9px] uppercase font-black px-2 py-0 border ${colorMap[status] || "bg-gray-100 text-gray-700"}`}>
                        {status}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "buybackDate",
            header: "Date",
            cell: ({ row }) => <DateCell date={row.original.buybackDate} />,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <ResourceActions
                        resourceTitle={row.original.buybackNumber}
                        resource={row.original}
                        resourceName="Buyback"
                        onView={(data) => openModal({ initialData: data as Buyback, isViewMode: true })}
                        onEdit={(data) => openModal({ initialData: data as Buyback })}
                        deleteMutation={deleteMutation}
                    />
                </div>
            )
        }
    ], [openModal, deleteMutation])

    return (
        <ResourceListPage<Buyback, unknown>
            title="Customer Buybacks"
            description="Manage devices traded-in or purchased from customers."
            resourceName="buybacks"
            columns={columns as ColumnDef<Buyback, unknown>[]}
            useResourceQuery={useBuybacks}
            onAdd={() => openModal()}
            addLabel="New Buyback"
            bulkDeleteMutation={bulkDeleteMutation}
            searchPlaceholder="Search reference, IMEI, or customer..."
        />
    )
}