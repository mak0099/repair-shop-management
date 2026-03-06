"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { DateCell, TitleCell, CurrencyCell } from "@/components/shared/data-table-cells"
import { ResourceActions } from "@/components/shared/resource-actions"

import {
    useKhata,
    useDeleteKhata,
    useDeleteManyKhata,
    usePartialUpdateKhata
} from "../khata.api"
import { KhataEntry } from "../khata.schema"
import { useKhataModal } from "../khata-modal-context"
import {
    TRANSACTION_TYPES,
    KHATA_FLOWS,
    FLOW_OPTIONS,
    TRANSACTION_TYPE_OPTIONS,
    PARTY_TYPES
} from "../khata.constants"

export function KhataList() {
    const { openModal } = useKhataModal()
    const deleteMutation = useDeleteKhata()
    const updateMutation = usePartialUpdateKhata()
    const bulkDeleteMutation = useDeleteManyKhata()

    const columns: ColumnDef<KhataEntry>[] = useMemo(() => [
        {
            accessorKey: "date",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
            cell: ({ row }) => <DateCell date={row.original.date} />,
        },
        {
            accessorKey: "partyName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Party / Description" />,
            cell: ({ row }) => {
                const typeKey = row.original.type as keyof typeof TRANSACTION_TYPES;
                const typeConfig = TRANSACTION_TYPES[typeKey];

                // ১. পার্টি টাইপ কনফিগারেশন বের করা
                const partyTypeKey = (row.original.partyType || "SUPPLIER") as keyof typeof PARTY_TYPES;
                const partyConfig = PARTY_TYPES[partyTypeKey];

                return (
                    <TitleCell
                        value={
                            <div className="flex items-center gap-2">
                                <span>{row.original.partyName || "General Adjustment"}</span>
                                {row.original.partyId && (
                                    <Badge className={`${partyConfig.color} text-[7px] px-1.5 h-3.5 border-none uppercase font-black tracking-tighter shadow-none`}>
                                        {partyConfig.label}
                                    </Badge>
                                )}
                            </div>
                        }
                        subtitle={
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-slate-500 uppercase text-[10px]">
                                    {typeConfig?.label || row.original.type}
                                </span>
                                {row.original.referenceId && (
                                    <span className="text-slate-300 font-medium italic">
                                        | Ref: {row.original.referenceId}
                                    </span>
                                )}
                            </div>
                        }
                        onClick={() => openModal({ initialData: row.original, isViewMode: true })}
                    />
                );
            },
        },
        {
            accessorKey: "direction",
            header: "Flow",
            cell: ({ row }) => {
                const flow = row.original.direction as keyof typeof KHATA_FLOWS;
                const config = KHATA_FLOWS[flow];

                // Safety check to prevent "cannot read color of undefined"
                if (!config) return <Badge variant="outline" className="text-slate-300 italic">Invalid</Badge>;

                return (
                    <Badge className={`${config.color} border-none text-[9px] font-black uppercase flex w-fit gap-1 items-center px-2 py-0.5`}>
                        {flow === "IN" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {config.label}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "amount",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" className="justify-end" />,
            cell: ({ row }) => {
                const isIn = row.original.direction === "IN";
                return (
                    <div className="flex flex-col items-end">
                        <span className={`font-black text-sm ${isIn ? "text-emerald-600" : "text-rose-600"}`}>
                            {isIn ? "+" : "-"} €{Number(row.original.amount).toLocaleString()}
                        </span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">
                            {row.original.paymentMethod}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: "balanceAfter",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" className="justify-end" />,
            cell: ({ row }) => (
                <div className="flex flex-col items-end">
                    <span className="font-black text-slate-900 text-sm">
                        €{Number(row.original.balanceAfter).toLocaleString()}
                    </span>
                    <span className="text-[7px] font-black text-slate-300 uppercase leading-none italic">Remaining</span>
                </div>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <ResourceActions
                    resourceTitle={row.original.partyName || "Transaction"}
                    resource={row.original}
                    resourceName="Transaction"
                    onView={(data) => openModal({ initialData: data as KhataEntry, isViewMode: true })}
                    onEdit={(data) => openModal({ initialData: data as KhataEntry })}
                    deleteMutation={deleteMutation}
                    updateMutation={updateMutation}
                />
            )
        }
    ], [openModal, deleteMutation, updateMutation])

    return (
        <ResourceListPage<KhataEntry, unknown>
            title="Khata (Ledger)"
            description="Manage all financial inflows, outflows, and adjustments in one place."
            resourceName="khata"
            columns={columns}
            useResourceQuery={useKhata}
            onAdd={() => openModal()}
            addLabel="Transaction Adjustment"
            bulkDeleteMutation={bulkDeleteMutation}
            searchPlaceholder="Search by name, ref or note..."
            initialFilters={{ direction: "all", type: "all" }}
            filterDefinitions={[
                {
                    key: "direction",
                    title: "Money Flow",
                    options: [
                        { label: "All Flow", value: "all" },
                        ...FLOW_OPTIONS
                    ],
                },
                {
                    key: "type",
                    title: "Category",
                    options: [
                        { label: "All Categories", value: "all" },
                        ...TRANSACTION_TYPE_OPTIONS
                    ],
                }
            ]}
        />
    )
}