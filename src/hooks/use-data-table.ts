"use client"

import { useMemo } from "react"
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Table,
  type PaginationState,
  type SortingState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { selectColumn } from "@/components/shared/data-table-helpers"

interface UseDataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  pageCount: number
  page?: number
  pageSize?: number
  onPaginationChange?: (page: number, pageSize: number) => void
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void // Renamed to onSortingChangeProp to avoid conflict with internal state
  enableSorting?: boolean
  enableMultiSort?: boolean
  enableSortingRemoval?: boolean
  enableRowSelection?: boolean
}

export function useDataTable<TData, TValue>({
  data,
  columns,
  pageCount,
  page = 1,
  pageSize = 10,
  onPaginationChange,
  sorting = [],
  onSortingChange: onSortingChangeProp,
  enableSorting = true,
  enableMultiSort = true,
  enableSortingRemoval = true,
  enableRowSelection = true,
}: UseDataTableProps<TData, TValue>): Table<TData> {
  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize,
  }

  const finalColumns = useMemo(() => {
    return enableRowSelection ? [selectColumn, ...columns] : columns;
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: finalColumns,
    pageCount,
    state: {
      pagination,
      sorting,
    },
    enableRowSelection,
    enableSorting,
    enableMultiSort,
    enableSortingRemoval,
    onPaginationChange: (updater) => {
      if (typeof updater === "function" && onPaginationChange) {
        const newState = updater(pagination)
        onPaginationChange(newState.pageIndex + 1, newState.pageSize)
      }
    },
    onSortingChange: onSortingChangeProp,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return table
}