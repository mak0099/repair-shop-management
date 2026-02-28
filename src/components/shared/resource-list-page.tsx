"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Plus, CircleDot, Download, Trash, Loader2 } from "lucide-react"
import type { ColumnDef, SortingState, Table } from "@tanstack/react-table"
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query"
import { toast } from "sonner"
import * as xlsx from "xlsx"
import pluralize from "pluralize"

import { Button } from "@/components/ui/button"
import { DataTableFilterToolbar } from "@/components/shared/data-table-filter-toolbar"
import { PageHeader } from "@/components/shared/page-header"
import { DataTableCard } from "@/components/shared/data-table-card"
import { DataTableViewOptions } from "@/components/shared/data-table-view-options"
import { useDataTable } from "@/hooks/use-data-table"
import type { FilterOption } from "@/components/ui/filter-combobox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

export interface FilterDefinition {
  key: string
  title: string
  options: FilterOption[]
  icon?: React.ElementType
}

export interface ResourceListConfig {
  add?: { enabled?: boolean }
  sorting?: { enabled?: boolean; multiSort?: boolean; enableRemoval?: boolean }
  columnVisibility?: { enabled?: boolean; defaultHidingEnabled?: boolean }
  rowSelection?: { enabled?: boolean; multiSelect?: boolean }
  tableDesign?: { striped?: boolean; hoverable?: boolean }
  bulkActions?: {
    delete?: { enabled?: boolean }
    updateStatus?: { enabled?: boolean }
    export?: { enabled?: boolean }
  }
  pagination?: { enabled?: boolean; pageSizeOptions?: number[] }
}

interface ResourceFilters {
  page: number
  pageSize: number
  search: string
  [key: string]: string | number | undefined
}

/**
 * FIX: Loosened the constraint from 'id: string' to 'id?: string'.
 * This allows Zod-inferred types where ID might be optional to work without 'any'.
 */
interface ResourceListPageProps<TData extends { id?: string }, TValue> {
  title: string
  description: string
  addHref?: string
  onAdd?: () => void
  addLabel?: string
  columns: ColumnDef<TData, TValue>[]
  useResourceQuery: (
    filters: ResourceFilters
  ) => UseQueryResult<{ data: TData[]; meta: { total: number; page: number; pageSize: number; totalPages: number } }, Error>
  initialFilters?: ResourceFilters
  searchPlaceholder: string
  filterDefinitions?: FilterDefinition[]
  onTableReady?: (table: Table<TData>) => void
  resourceName?: string
  bulkDeleteMutation?: UseMutationResult<unknown, Error, string[], unknown>
  bulkStatusUpdateMutation?: UseMutationResult<
    unknown,
    Error, 
    { ids: string[]; data: Record<string, unknown> }, 
    unknown
  >
  config?: ResourceListConfig
}

const DEFAULT_INITIAL_FILTERS: ResourceFilters = {
  page: 1,
  pageSize: 10,
  search: "",
}

export function ResourceListPage<TData extends { id?: string }, TValue>({
  title,
  description,
  addHref,
  onAdd,
  addLabel,
  columns,
  useResourceQuery,
  initialFilters = DEFAULT_INITIAL_FILTERS,
  searchPlaceholder,
  filterDefinitions = [],
  onTableReady,
  resourceName,
  bulkDeleteMutation,
  bulkStatusUpdateMutation,
  config = {},
}: ResourceListPageProps<TData, TValue>) {
  const [filters, setFilters] = useState<ResourceFilters>(initialFilters)
  const [sorting, setSorting] = useState<SortingState>([])
  const [itemIdsToDelete, setItemIdsToDelete] = useState<string[]>([])

  const apiFilters: ResourceFilters = {
    ...filters,
    _sort: sorting.length > 0 ? sorting[0].id : undefined,
    _order: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined,
  }

  const { data, isLoading, isFetching, isError, error } = useResourceQuery(apiFilters)
  const resources = data?.data || []
  const meta = data?.meta || { total: resources.length, page: 1, pageSize: filters.pageSize, totalPages: 1 }

  const isFiltered =
    Object.keys(filters).some(
      (key) => key !== "page" && key !== "pageSize" && filters[key] !== initialFilters[key]
    ) || sorting.length > 0

  const handleReset = () => {
    setFilters(initialFilters)
    setSorting([])
  }

  const {
    add: addConfig = {},
    bulkActions: bulkActionsConfig = {},
    sorting: sortingConfig = {},
    columnVisibility: columnVisibilityConfig = {},
    rowSelection: rowSelectionConfig = {},
    pagination: paginationConfig = {},
  } = config;

  const table = useDataTable({
    data: resources,
    columns,
    pageCount: meta.totalPages,
    page: filters.page,
    pageSize: filters.pageSize,
    onPaginationChange: (page, pageSize) => setFilters({ ...filters, page, pageSize }),
    sorting,
    onSortingChange: setSorting,
    enableSorting: sortingConfig.enabled !== false,
    enableMultiSort: sortingConfig.multiSort !== false,
    enableSortingRemoval: sortingConfig.enableRemoval !== false,
    enableRowSelection: rowSelectionConfig.enabled !== false,
  })

  // Hook for passing table instance
  useState(() => { onTableReady?.(table) })

  const singularResourceName = resourceName ? pluralize.singular(resourceName) : "item"
  const pluralResourceName = resourceName || "items"

  /**
   * Helper to safely extract string IDs.
   * Filters out any potential undefined IDs to satisfy mutation types.
   */
  const getSelectedIds = () => 
    table.getFilteredSelectedRowModel().rows
      .map((row) => row.original.id)
      .filter((id): id is string => typeof id === "string")

  const handleBulkDelete = () => {
    const selectedIds = getSelectedIds()
    if (selectedIds.length === 0) {
      toast.warning(`Please select at least one ${singularResourceName}.`)
      return
    }
    setItemIdsToDelete(selectedIds)
  }

  const confirmBulkDelete = useCallback(() => {
    if (!bulkDeleteMutation) return
    bulkDeleteMutation.mutate(itemIdsToDelete, {
      onSuccess: () => {
        table.toggleAllPageRowsSelected(false)
        setItemIdsToDelete([])
      },
      onError: () => setItemIdsToDelete([]),
    })
  }, [bulkDeleteMutation, itemIdsToDelete, table])

  const handleBulkStatusChange = (isActive: boolean) => {
    if (!bulkStatusUpdateMutation) return
    const selectedIds = getSelectedIds()
    if (selectedIds.length === 0) {
      toast.warning(`Please select at least one ${singularResourceName}.`)
      return
    }
    // CONSISTENCY: Using isActive as the standardized boolean key
    bulkStatusUpdateMutation.mutate(
      { ids: selectedIds, data: { isActive } }, 
      { onSuccess: () => table.toggleAllPageRowsSelected(false) }
    )
  }

  const handleExport = () => {
    const selectedData = table.getFilteredSelectedRowModel().rows.map((row) => row.original)
    if (selectedData.length === 0) {
      toast.warning(`Please select at least one ${singularResourceName} to export.`)
      return
    }
    const worksheet = xlsx.utils.json_to_sheet(selectedData)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, pluralResourceName)
    xlsx.writeFile(workbook, `${pluralResourceName}-export.xlsx`)
  }

  if (isError) return <div className="text-red-500 p-4 font-medium">Error: {(error as Error).message}</div>

  const showAddButton = addConfig.enabled !== false && (onAdd || addHref);
  const showBulkStatusUpdate = bulkStatusUpdateMutation && bulkActionsConfig.updateStatus?.enabled !== false;
  const showBulkDelete = bulkDeleteMutation && bulkActionsConfig.delete?.enabled !== false;
  const showExport = bulkActionsConfig.export?.enabled !== false;
  const showAnyBulkAction = resourceName && (showBulkStatusUpdate || showBulkDelete || showExport);

  return (
    <div className="grid grid-cols-1 gap-4 w-full max-w-full">
      <PageHeader title={title} description={description}>
        {showAddButton && (
          onAdd ? (
            <Button onClick={onAdd} size="sm" className="bg-primary shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> {addLabel || `Add ${singularResourceName}`}
            </Button>
          ) : (
            <Button asChild size="sm" className="bg-primary shadow-sm">
              <Link href={addHref!}>
                <Plus className="mr-2 h-4 w-4" /> {addLabel || `Add ${singularResourceName}`}
              </Link>
            </Button>
          )
        )}
      </PageHeader>

      <DataTableFilterToolbar
        searchQuery={filters.search}
        onSearchChange={(value) => setFilters({ ...filters, search: value, page: 1 })}
        searchPlaceholder={searchPlaceholder}
        onReset={handleReset}
        isFiltered={isFiltered}
        filters={filterDefinitions.map((def) => ({
          ...def,
          value: String(filters[def.key] ?? ""),
          onChange: (val: string) => setFilters({ ...filters, [def.key]: val, page: 1 }),
        }))}
      />

      <DataTableCard
        table={table}
        isLoading={isFetching}
        title={`${title} List`}
        total={meta.total}
        bulkActions={
          showAnyBulkAction
            ? (tableInstance) => (
              <div className="flex items-center gap-2">
                {showBulkStatusUpdate && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 border-dashed" disabled={bulkStatusUpdateMutation?.isPending}>
                        {bulkStatusUpdateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CircleDot className="mr-2 h-4 w-4" />}
                        Status ({tableInstance.getFilteredSelectedRowModel().rows.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleBulkStatusChange(true)}>Set Active</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkStatusChange(false)}>Set Inactive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {showExport && (
                  <Button variant="outline" size="sm" className="h-8" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                )}
                {showBulkDelete && (
                  <Button variant="destructive" size="sm" className="h-8" onClick={handleBulkDelete} disabled={bulkDeleteMutation?.isPending}>
                    {bulkDeleteMutation?.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
                    Delete ({tableInstance.getFilteredSelectedRowModel().rows.length})
                  </Button>
                )}
              </div>
            )
            : undefined
        }
      >
        {columnVisibilityConfig.enabled !== false && <DataTableViewOptions table={table} />}
      </DataTableCard>

      {showBulkDelete && (
        <ConfirmDialog
          open={itemIdsToDelete.length > 0}
          onOpenChange={(open) => !open && setItemIdsToDelete([])}
          title={`Delete ${pluralize(singularResourceName, itemIdsToDelete.length)}`}
          description={`Are you sure you want to delete ${itemIdsToDelete.length} selected ${pluralize(singularResourceName, itemIdsToDelete.length)}? This action is permanent.`}
          onConfirm={confirmBulkDelete}
          isLoading={bulkDeleteMutation?.isPending}
          variant="destructive"
        />
      )}
    </div>
  )
}