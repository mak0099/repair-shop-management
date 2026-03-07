"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ShoppingCart, Truck, CreditCard, Calendar } from "lucide-react"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { DateCell, TitleCell, CurrencyCell } from "@/components/shared/data-table-cells"
import { ResourceActions } from "@/components/shared/resource-actions"

import { usePurchases, useDeletePurchase, useDeleteManyPurchases } from "../purchases.api"
import { ProductPurchase } from "../purchases.schema"
import { usePurchaseModal } from "../purchase-modal-context"
import { PURCHASE_PAYMENT_STATUS } from "../purchases.constants"
import { PurchaseInvoiceView } from "./purchase-invoice-view"

export function PurchaseList() {
    const { openModal } = usePurchaseModal()
    const deleteMutation = useDeletePurchase()
    const bulkDeleteMutation = useDeleteManyPurchases()

    const columns: ColumnDef<ProductPurchase>[] = useMemo(() => [
        {
            accessorKey: "purchaseNumber",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Voucher Details" />,
            cell: ({ row }) => (
                <TitleCell
                    value={row.original.purchaseNumber}
                    subtitle={
                        <div className="flex gap-2 items-center">
                            <Truck className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-bold text-slate-500 uppercase tracking-tighter">
                                Supplier: {row.original.supplierId}
                            </span>
                        </div>
                    }
                    onClick={() => openModal({ initialData: row.original, isViewMode: true })}
                />
            ),
        },
        {
            accessorKey: "totalAmount",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Total Cost" className="justify-end" />,
            cell: ({ row }) => (
                <CurrencyCell
                    amount={row.original.totalAmount}
                    subtitle={row.original.dueAmount > 0 ? `Due: ৳${row.original.dueAmount}` : "Fully Paid"}
                />
            ),
        },
        {
            accessorKey: "paymentStatus",
            header: "Payment",
            cell: ({ row }) => {
                const status = row.original.paymentStatus;
                const colorMap: Record<string, string> = {
                    PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
                    PARTIAL: "bg-amber-100 text-amber-700 border-amber-200",
                    DUE: "bg-red-100 text-red-700 border-red-200",
                };
                return (
                    <Badge className={`text-[9px] uppercase font-black px-2 py-0 border ${colorMap[status]}`}>
                        {status}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "purchaseDate",
            header: "Date",
            cell: ({ row }) => <DateCell date={row.original.purchaseDate} />,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <ResourceActions
                        resourceTitle={row.original.purchaseNumber}
                        resource={row.original}
                        resourceName="Purchase"
                        onView={(data) => openModal({ initialData: data as ProductPurchase, isViewMode: true })}
                        deleteMutation={deleteMutation}
                    />
                </div>
            )
        }
    ], [openModal, deleteMutation])

    return (
        <ResourceListPage<ProductPurchase, unknown>
            title="Product Purchases"
            description="Track inventory stock-ins, supplier payments, and purchase history."
            resourceName="purchases"
            columns={columns}
            useResourceQuery={usePurchases}
            onAdd={() => openModal()}
            addLabel="New Purchase"
            bulkDeleteMutation={bulkDeleteMutation}
            searchPlaceholder="Search voucher or supplier..."
        />
    )
}