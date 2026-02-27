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

// This definition should ideally be co-located with DataTableFilterToolbar
export interface FilterDefinition {
  key: string
  title: string
  options: FilterOption[]
  icon?: React.ElementType
}

export interface ResourceListConfig {
  /** Controls for the 'Add' resource button */
  add?: {
    /**
     * Whether to show the 'Add' button.
     * Defaults to true if `onAdd` or `addHref` is provided.
     * @default true
     */
    enabled?: boolean
  }
  /** Controls for sorting functionality */
  sorting?: {
    /** Whether sorting is enabled globally.
     * @default true
     */
    enabled?: boolean;
    /** Whether multi-column sorting is enabled.
     * @default true
     */
    multiSort?: boolean;
    /** Whether sorting can be removed (cycle through asc, desc, none).
     * @default true
     */
    enableRemoval?: boolean;
  };
  /** Controls for column visibility toggling */
  columnVisibility?: {
    /** Whether the column visibility toggle button is shown.
     * @default true
     */
    enabled?: boolean;
    /** Whether columns are hideable by default. Can be overridden by individual columnDef.enableHiding.
     * @default true
     */
    defaultHidingEnabled?: boolean;
  };
  /** Controls for row selection checkboxes */
  rowSelection?: {
    /** Whether row selection checkboxes are enabled.
     * @default true
     */
    enabled?: boolean;
    /** Whether multi-row selection is enabled.
     * @default true
     */
    multiSelect?: boolean;
  };
  /** Controls for table design/appearance */
  tableDesign?: {
    striped?: boolean;
    hoverable?: boolean;
  }
  /** Controls for the bulk action buttons (e.g., Delete, Update Status) */
  bulkActions?: {
    /**
     * Controls for the bulk delete action.
     */
    delete?: { enabled?: boolean }
    /**
     * Controls for the bulk status update action.
     */
    updateStatus?: { enabled?: boolean }
    /**
     * Controls for the export action.
     */
    export?: { enabled?: boolean }
  }
  /** Controls for pagination */
  pagination?: {
    /** Whether pagination controls are displayed.
     * @default true
     */
    enabled?: boolean;
    pageSizeOptions?: number[];
  }
}

interface ResourceFilters {
  page: number
  pageSize: number
  search: string
  [key: string]: string | number | undefined
}

interface ResourceListPageProps<TData extends { id: string }, TValue> {
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

export function ResourceListPage<TData extends { id: string }, TValue>({
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

  // Extract config values with defaults
  const {
    add: addConfig = {},
    bulkActions: bulkActionsConfig = {},
    sorting: sortingConfig = {},
    columnVisibility: columnVisibilityConfig = {},
    rowSelection: rowSelectionConfig = {},
    tableDesign: tableDesignConfig = {},
    pagination: paginationConfig = {},
  } = config;

  const enableSorting = sortingConfig.enabled !== false;
  const enableMultiSort = sortingConfig.multiSort !== false;
  const enableSortingRemoval = sortingConfig.enableRemoval !== false;
  const enableRowSelection = rowSelectionConfig.enabled !== false;
  const showColumnVisibilityToggle = columnVisibilityConfig.enabled !== false;
  const showPagination = paginationConfig.enabled !== false;

  // The actual columns are passed directly, and useDataTable will conditionally add the selectColumn.
  const tableColumns = columns;

  const table = useDataTable({
    data: resources, // Data for the table
    columns: tableColumns, // Columns definition
    pageCount: meta.totalPages, // Total number of pages
    page: filters.page, // Current page number
    pageSize: filters.pageSize, // Number of items per page
    onPaginationChange: (page, pageSize) => { // Callback for pagination changes
      setFilters({ ...filters, page, pageSize });
    },
    sorting, // Current sorting state
    onSortingChange: setSorting, // Callback for sorting changes
    // New sorting configuration
    enableSorting: enableSorting,
    enableMultiSort: enableMultiSort,
    enableSortingRemoval: enableSortingRemoval,
    // New row selection configuration
    enableRowSelection: enableRowSelection,
  })

  // This is a bit of a hack to pass the table instance up to the parent component if needed.
  // It's not ideal, but it works for now.
  useState(() => {
    onTableReady?.(table)
  })

  const singularResourceName = resourceName ? pluralize.singular(resourceName) : "item"
  const pluralResourceName = resourceName || "items"

  const handleBulkDelete = () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id)
    if (selectedIds.length === 0) {
      toast.warning(`Please select at least one ${singularResourceName} to delete.`)
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
      onError: () => {
        setItemIdsToDelete([])
      },
    })
  }, [bulkDeleteMutation, itemIdsToDelete, table])

  const handleBulkStatusChange = (isActive: boolean) => {
    if (!bulkStatusUpdateMutation) return
    const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id)
    if (selectedIds.length === 0) {
      toast.warning(`Please select at least one ${singularResourceName} to update.`)
      return
    }
    bulkStatusUpdateMutation.mutate({ ids: selectedIds, data: { isActive } }, { onSuccess: () => table.toggleAllPageRowsSelected(false) })
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

  if (isError) {
    return <div className="text-red-500">Error: {(error as Error).message}</div>
  }

  const showAddButton = addConfig.enabled !== false && (onAdd || addHref);
  const showBulkStatusUpdate = bulkStatusUpdateMutation && bulkActionsConfig.updateStatus?.enabled !== false;
  const showBulkDelete = bulkDeleteMutation && bulkActionsConfig.delete?.enabled !== false;
  const showExport = bulkActionsConfig.export?.enabled !== false;
  const showAnyBulkAction = resourceName && (showBulkStatusUpdate || showBulkDelete || showExport);

  const dynamicFilters = filterDefinitions.map((def) => ({
    ...def,
    value: String(filters[def.key] ?? ""),
    onChange: (value: string) => setFilters({ ...filters, [def.key]: value, page: 1 }),
  }))

  return (
    <div className="space-y-2">
      <PageHeader title={title} description={description}>
        {showAddButton && onAdd ? (
          <Button onClick={onAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" /> {addLabel}
          </Button>
        ) : showAddButton && addHref ? (
          <Button asChild size="sm">
            <Link href={addHref}>
              <Plus className="mr-2 h-4 w-4" /> {addLabel}
            </Link>
          </Button>
        ) : null}
      </PageHeader>

      <DataTableFilterToolbar
        searchQuery={filters.search}
        onSearchChange={(value) => setFilters({ ...filters, search: value, page: 1 })}
        searchPlaceholder={searchPlaceholder}
        onReset={handleReset}
        isFiltered={isFiltered}
        filters={dynamicFilters}
      />

      <DataTableCard
        table={table}
        isLoading={isFetching}
        title={`${title} List`}
        total={meta.total}
        bulkActions={
          showAnyBulkAction
            ? (table) => (
              <>
                {showBulkStatusUpdate && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8" disabled={bulkStatusUpdateMutation?.isPending}>
                        {bulkStatusUpdateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CircleDot className="mr-2 h-4 w-4" />}
                        Status ({table.getFilteredSelectedRowModel().rows.length})
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
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                )}
                {showBulkDelete && (
                  <Button variant="destructive" size="sm" className="h-8" onClick={handleBulkDelete} disabled={bulkDeleteMutation?.isPending}>
                    {bulkDeleteMutation?.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
                    Delete ({table.getFilteredSelectedRowModel().rows.length})
                  </Button>
                )}
              </>
            )
            : undefined
        }
      >
        {showColumnVisibilityToggle && <DataTableViewOptions table={table} />}
      </DataTableCard>
      {showBulkDelete && (
        <ConfirmDialog
          open={itemIdsToDelete.length > 0}
          onOpenChange={(open) => !open && setItemIdsToDelete([])}
          title={`Delete ${pluralize(singularResourceName, itemIdsToDelete.length)}`}
          description={`Are you sure you want to delete ${itemIdsToDelete.length} ${pluralize(singularResourceName, itemIdsToDelete.length)}? This action cannot be undone.`}
          onConfirm={confirmBulkDelete}
          isLoading={bulkDeleteMutation?.isPending}
          variant="destructive"
        />
      )}
    </div>
  )
}