"use client"

import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { LayoutList, KanbanSquare, Plus } from "lucide-react"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { DateCell, CurrencyCell } from "@/components/shared/data-table-cells"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { useAcceptances, useDeleteAcceptance, useDeleteManyAcceptances, useUpdateManyAcceptances } from "../acceptance.api"
import { Acceptance } from "../acceptance.schema"
import { useAcceptanceModal } from "../acceptance-modal-context"
import { useTicketWorkspaceModal } from "../ticket-workspace-modal-context"
import { Customer } from "@/features/customers"
import { Brand } from "@/features/brands"
import { Model } from "@/features/models"

import { useBrandOptions } from "@/features/brands/brand.api"
import { useModelOptions } from "@/features/models/model.api"
import { AcceptanceKanbanBoard } from "./kanban/acceptance-kanban-board"
import { REPAIR_STATUS_OPTIONS } from "../acceptance.constants"

interface AcceptanceInList extends Acceptance {
  customer?: Pick<Customer, "id" | "name">
  brand?: Pick<Brand, "id" | "name">
  model?: Pick<Model, "id" | "name">
}

export function AcceptanceList() {
  const deleteMutation = useDeleteAcceptance()
  const bulkDeleteMutation = useDeleteManyAcceptances()
  const bulkStatusUpdateMutation = useUpdateManyAcceptances()
  const { openModal } = useAcceptanceModal()
  const { openModal: openWorkspaceModal } = useTicketWorkspaceModal()
  const [view, setView] = useState<"list" | "board">("list")

  const { data: brands } = useBrandOptions()
  const { data: models } = useModelOptions()

  const columns: ColumnDef<AcceptanceInList>[] = useMemo(
    () => [
      {
        accessorKey: "acceptanceNumber",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Number" />,
        cell: ({ row }) => (
          <div
            className="font-medium cursor-pointer hover:underline"
            onClick={() => openWorkspaceModal({ initialData: row.original })}
          >
            {row.getValue("acceptanceNumber")}
          </div>
        ),
      },
      {
        accessorKey: "customerId",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
        cell: ({ row }) => row.original.customer?.name ?? "N/A",
      },
      {
        accessorKey: "acceptanceDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Acceptance Date" />,
        cell: ({ row }) => <DateCell date={row.getValue("acceptanceDate")} />,
      },
      {
        accessorKey: "brandId",
        header: "Brand",
        cell: ({ row }) => row.original.brand?.name ?? "N/A",
      },
      {
        accessorKey: "modelId",
        header: "Model",
        cell: ({ row }) => row.original.model?.name ?? "N/A",
      },
      {
        accessorKey: "currentStatus",
        header: "Repair Status",
        cell: ({ row }) => {
          const status = row.getValue("currentStatus") as string
          return <Badge variant="outline">{status}</Badge>
        },
      },
      {
        accessorKey: "estimatedPrice",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Est. Price" className="justify-end" />,
        cell: ({ row }) => <CurrencyCell amount={row.getValue("estimatedPrice")} />,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <ResourceActions
            resource={row.original}
            resourceName="Acceptance"
            resourceTitle={row.original.acceptanceNumber}
            onView={(acceptance) => openWorkspaceModal({ initialData: acceptance })}
            onEdit={(acceptance) => openModal({ initialData: acceptance })}
            deleteMutation={deleteMutation}
          />
        ),
      },
    ],
    [deleteMutation, openModal, openWorkspaceModal]
  )

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* View Toggle Bar */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border shadow-sm">
          <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setView("list")} className="h-8 px-4 text-xs font-bold"><LayoutList className="h-3.5 w-3.5 mr-2" /> List View</Button>
          <Button variant={view === "board" ? "secondary" : "ghost"} size="sm" onClick={() => setView("board")} className="h-8 px-4 text-xs font-bold"><KanbanSquare className="h-3.5 w-3.5 mr-2" /> Kanban Board</Button>
        </div>
        {view === "board" && (
          <Button onClick={() => openModal()} size="sm" className="h-8 text-xs font-bold bg-primary hover:bg-primary/90 shadow-sm"><Plus className="h-3.5 w-3.5 mr-2" /> Quick Intake</Button>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {view === "list" ? (
          <ResourceListPage<Acceptance, unknown>
            title="Acceptances"
            resourceName="acceptances"
            description="Manage all repair acceptances."
            onAdd={() => openModal()}
            addLabel="New Acceptance"
            columns={columns}
            useResourceQuery={useAcceptances}
            bulkDeleteMutation={bulkDeleteMutation}
            bulkStatusUpdateMutation={bulkStatusUpdateMutation}
            initialFilters={{
              currentStatus: "all",
              customerId: "all",
              brandId: "all",
              modelId: "all",
              acceptanceDate: undefined,
            }}
            searchPlaceholder="Search by No, Customer, Phone"
            filterDefinitions={[
              {
                key: "currentStatus",
                title: "Repair Status",
                options: REPAIR_STATUS_OPTIONS,
              },
              {
                key: "brandId",
                title: "Brand",
                options: [
                  { label: "All Brands", value: "all" },
                  ...(brands?.map((b: { id: string; name: string }) => ({ label: b.name, value: b.id })) || []),
                ],
              },
              {
                key: "modelId",
                title: "Model",
                options: [
                  { label: "All Models", value: "all" },
                  ...(models?.map((m: { id: string; name: string }) => ({ label: m.name, value: m.id })) || []),
                ],
              },
              {
                key: "acceptanceDate",
                title: "Acceptance Date Range",
                type: "date-range",
              },
            ]}
          />
        ) : (
          <AcceptanceKanbanBoard />
        )}
      </div>
    </div>
  )
}