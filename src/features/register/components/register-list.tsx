"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Lock, Unlock, User } from "lucide-react"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { DateCell, TitleCell, CurrencyCell } from "@/components/shared/data-table-cells"
import { ResourceActions } from "@/components/shared/resource-actions"

import { useRegisters, useDeleteRegister } from "../register.api"
import { RegisterLog } from "../register.schema"
import { useRegisterModal } from "../register-modal-context"
import { REGISTER_STATUS } from "../register.constants"

export function RegisterList() {
  const { openModal } = useRegisterModal()
  const deleteMutation = useDeleteRegister()

  const columns: ColumnDef<RegisterLog>[] = useMemo(() => [
    {
      accessorKey: "sessionNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Session Info" />,
      cell: ({ row }) => (
        <TitleCell
          value={row.original.sessionNumber}
          isActive={row.original.status === REGISTER_STATUS.OPEN}
          onClick={() => openModal({ initialData: row.original, isViewMode: true })}
          subtitle={
            <div className="flex gap-2 items-center">
              <User className="h-3 w-3 text-slate-400" />
              <span className="font-bold text-slate-500 uppercase tracking-tighter">
                By: {row.original.openedBy}
              </span>
            </div>
          }
        />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={status === REGISTER_STATUS.OPEN 
            ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
            : "bg-slate-100 text-slate-600 border-slate-200"
          }>
            {status === REGISTER_STATUS.OPEN ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
            {status}
          </Badge>
        )
      }
    },
    {
      accessorKey: "openingBalance",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Opening" />,
      cell: ({ row }) => <CurrencyCell amount={row.original.openingBalance} />,
    },
    {
      accessorKey: "totalCashSales",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Cash Sales" />,
      cell: ({ row }) => <CurrencyCell amount={row.original.totalCashSales} />,
    },
    {
      accessorKey: "openedAt",
      header: "Opened At",
      cell: ({ row }) => <DateCell date={row.original.openedAt} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ResourceActions
          resourceTitle={row.original.sessionNumber}
          resource={row.original}
          resourceName="Register"
          onView={(data) => openModal({ initialData: data as RegisterLog, isViewMode: true })}
          onEdit={(data) => openModal({ initialData: data as RegisterLog })}
          deleteMutation={deleteMutation}
        />
      )
    }
  ], [openModal, deleteMutation])

  return (
    <ResourceListPage<RegisterLog, unknown>
      title="Register Logs"
      description="Track cash drawer sessions, sales reconciliations, and staff accountability."
      resourceName="registers"
      columns={columns}
      useResourceQuery={useRegisters}
      onAdd={() => openModal()}
      addLabel="Open New Register"
      searchPlaceholder="Search by staff or session ID..."
    />
  )
}