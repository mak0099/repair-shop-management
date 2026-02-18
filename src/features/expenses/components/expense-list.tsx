"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { ResourceListPage } from "@/components/shared/resource-list-page"
import { ResourceActions } from "@/components/shared/resource-actions"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"
import { ImageCell } from "@/components/shared/data-table-cells"

import {
  useExpenses,
  useDeleteExpense,
  usePartialUpdateExpense,
  useDeleteManyExpenses,
} from "../expense.api"
import { Expense } from "../expense.schema"
import { useExpenseModal } from "../expense-modal-context"
import { MasterSetting } from "@/features/master-settings"

const INITIAL_FILTERS = {
  search: "",
  page: 1,
  pageSize: 10,
}

interface ExpenseInList extends Expense {
    category?: Pick<MasterSetting, 'id' | 'label' | 'value'>;
}

export function ExpenseList() {
  const deleteExpenseMutation = useDeleteExpense()
  const updateExpenseMutation = usePartialUpdateExpense()
  const bulkDeleteMutation = useDeleteManyExpenses()
  const { openModal } = useExpenseModal()

  const columns: ColumnDef<Expense>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => (
          <div className="font-medium cursor-pointer hover:underline" onClick={() => openModal({ initialData: row.original, isViewMode: true })}>
            {row.getValue("title")}
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({ row }) => `€${row.original.amount.toFixed(2)}`,
      },
      {
        accessorKey: "date",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => format(new Date(row.original.date), "PPP"),
      },
      {
        id: "category",
        header: "Category",
        cell: ({ row }) => {
            const expense = row.original as ExpenseInList;
            return expense.category?.label ?? "N/A";
        },
      },
      {
        accessorKey: "branch_id",
        header: "Branch ID",
      },
      {
        accessorKey: "attachment_url",
        header: "Attachment",
        cell: ({ row }) => <ImageCell src={row.original.attachment_url} alt={row.original.title} />,
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <ResourceActions
            resource={row.original}
            resourceName="Expense"
            resourceTitle={row.original.title}
            onView={(expense) => openModal({ initialData: expense, isViewMode: true })}
            onEdit={(expense) => openModal({ initialData: expense })}
            deleteMutation={deleteExpenseMutation}
            updateMutation={updateExpenseMutation}
          />
        ),
      },
    ],
    [deleteExpenseMutation, openModal, updateExpenseMutation]
  )

  return (
    <>
      <ResourceListPage<Expense, unknown>
        title="Expenses"
        resourceName="expenses"
        description="Manage business expenses"
        onAdd={() => openModal()}
        addLabel="Add Expense"
        columns={columns}
        useResourceQuery={useExpenses}
        bulkDeleteMutation={bulkDeleteMutation}
        initialFilters={INITIAL_FILTERS}
        searchPlaceholder="Search by title..."
        filterDefinitions={[]}
      />
    </>
  )
}
