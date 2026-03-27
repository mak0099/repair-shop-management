"use client"

import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { FileText } from "lucide-react"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DateCell, TitleCell, CurrencyCell } from "@/components/shared/data-table-cells"
import { ResourceActions } from "@/components/shared/resource-actions"
import { PrintableDialog } from "@/components/shared/printable-dialog"

import { useBuybacks, useDeleteBuyback, useDeleteManyBuybacks } from "../buyback.api"
import { Buyback } from "../buyback.schema"
import { BuybackInvoiceView } from "./buyback-invoice-view"
import { useBuybackModal } from "../buyback-modal-context"
import { Customer } from "@/features/customers"

interface BuybackInList extends Buyback {
  customer?: Pick<Customer, "id" | "name">
}

export function BuybackList() {
    const { openModal } = useBuybackModal()
    const [selectedInvoice, setSelectedInvoice] = useState<Buyback | null>(null)
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
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 text-[10px] font-bold border-slate-200 hover:bg-slate-50"
                        onClick={() => setSelectedInvoice(row.original)}
                    >
                        <FileText className="h-3.5 w-3.5 text-blue-600" /> INVOICE
                    </Button>
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
        <>
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
            {selectedInvoice && (
                <PrintableDialog
                    title="Buyback Agreement"
                    icon={<FileText />}
                    printableElementId="printable-buyback-agreement"
                    className="max-w-4xl p-0 overflow-hidden h-[95vh]"
                    isOpen={!!selectedInvoice}
                    onOpenChange={(open) => !open && setSelectedInvoice(null)}
                >
                    <BuybackInvoiceView buyback={selectedInvoice} />
                </PrintableDialog>
            )}
        </>
    )
}