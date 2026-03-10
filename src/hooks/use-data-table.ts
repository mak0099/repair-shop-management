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
  type OnChangeFn,
  type Updater,
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
  onSortingChange?: (sorting: SortingState) => void
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

  /**
   * FIX: Type the columns array as ColumnDef<TData, unknown>[]
   * We use 'unknown' instead of 'any' for the cell value type.
   * This is safe because Table doesn't care about the specific value type here.
   */
  const finalColumns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    return enableRowSelection 
      ? [(selectColumn as ColumnDef<TData, unknown>), ...columns] 
      : (columns as ColumnDef<TData, unknown>[]);
  }, [columns, enableRowSelection]);

  /**
   * Safe Pagination Updater Handler
   */
  const handlePaginationChange: OnChangeFn<PaginationState> = (updater: Updater<PaginationState>) => {
    if (onPaginationChange) {
      const nextState = typeof updater === "function" ? updater(pagination) : updater;
      onPaginationChange(nextState.pageIndex + 1, nextState.pageSize);
    }
  };

  /**
   * Safe Sorting Updater Handler
   */
  const handleSortingChange: OnChangeFn<SortingState> = (updater: Updater<SortingState>) => {
    if (onSortingChangeProp) {
      const nextState = typeof updater === "function" ? updater(sorting) : updater;
      onSortingChangeProp(nextState);
    }
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TData>({
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
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return table
}