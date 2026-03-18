"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { DateCell, TitleCell, CurrencyCell } from "@/components/shared/data-table-cells"
import { ResourceActions } from "@/components/shared/resource-actions"

import { useSales, useDeleteSale, useDeleteManySales } from "../sales.api"
import { Sale } from "../sales.schema"
import { useSalesModal } from "../sales-modal-context"

/**
 * Strict type for Sale to ensure ID existence during table actions.
 */
type SaleWithId = Sale & { id: string };

export function SalesList() {
  const router = useRouter()
  const deleteMutation = useDeleteSale()
  const bulkDeleteMutation = useDeleteManySales()
  const { openInvoice } = useSalesModal()

  // Define table columns following the ItemList pattern
  const columns: ColumnDef<Sale>[] = useMemo(() => [
    {
      accessorKey: "invoiceNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice details" />,
      cell: ({ row }) => (
        <TitleCell
          value={row.original.invoiceNumber}
          isActive={row.original.status === "COMPLETED"}
          onClick={() => openInvoice(row.original)}
          subtitle={
            <div className="flex gap-2 items-center">
              <span className="font-bold text-muted-foreground uppercase tracking-tighter">
                {row.original.customerId ? `Customer ID: ${row.original.customerId}` : "WALK-IN CUSTOMER"}
              </span>
            </div>
          }
        />
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment",
      cell: ({ row }) => {
        const method = row.original.paymentMethod;
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-black border-border bg-muted">
              {method}
            </Badge>
          </div>
        )
      }
    },
    {
      accessorKey: "grandTotal",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total amount" className="justify-end" />,
      cell: ({ row }) => (
        <CurrencyCell
          amount={row.original.grandTotal}
          subtitle={`Tax: ৳${row.original.totalTax.toLocaleString()}`}
        />
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const colorMap: Record<string, string> = {
          COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20",
          PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
          CANCELED: "bg-destructive/10 text-destructive border-destructive/20",
        };

        return (
          <Badge className={`text-[9px] uppercase font-black px-2 py-0 border ${colorMap[status] || "bg-muted"}`}>
            {status}
          </Badge>
        )
      }
    },
    {
      accessorKey: "createdAt",
      header: "Transaction Date",
      cell: ({ row }) => <DateCell date={row.original.createdAt} />,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const sale = row.original as SaleWithId;

        return (
          <ResourceActions
            resourceTitle={sale.invoiceNumber}
            resource={sale}
            resourceName="Invoice"
            // For sales, we might want to "Print" or "View" instead of direct edit
            onView={(data) => openInvoice(data)}
            deleteMutation={deleteMutation}
          />
        )
      }
    }
  ], [deleteMutation, openInvoice])

  return (
    <ResourceListPage<Sale, unknown>
      title="Sales"
      description="Monitor all retail sales, service invoices, and POS history."
      resourceName="sales"
      columns={columns}
      useResourceQuery={useSales}
      // "Add" takes the user to the POS Terminal
      onAdd={() => router.push("/dashboard/sales/pos")}
      addLabel="Open POS Terminal"
      bulkDeleteMutation={bulkDeleteMutation}
      searchPlaceholder="Search invoice number or customer..."
      initialFilters={{ status: "all" }}
      filterDefinitions={[
        {
          key: "status",
          title: "Order Status",
          options: [
            { label: "All Status", value: "all" },
            { label: "Completed", value: "COMPLETED" },
            { label: "Pending", value: "PENDING" },
            { label: "Canceled", value: "CANCELED" },
          ],
        },
        {
          key: "paymentMethod",
          title: "Payment Method",
          options: [
            { label: "All Methods", value: "all" },
            { label: "Cash", value: "CASH" },
            { label: "Card", value: "CARD" },
            { label: "Mobile Pay", value: "MOBILE_PAYMENT" },
          ],
        }
      ]}
    />
  )
}