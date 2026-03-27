"use client"

import { useState, useCallback, useMemo } from "react"
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

export interface TabConfig {
  enabled?: boolean
  counts?: Record<string, number>
  selectedValue?: string
  onChange?: (value: string) => void
  options?: { label: string; value: string }[]
  colors?: Record<string, string>
  filterKey?: string // Auto-calculate counts by grouping data on this field
  position?: "top" | "bottom" | "left" | "right"
}

export interface FilterDefinition {
  key: string
  title: string
  options?: FilterOption[]
  icon?: React.ElementType
  type?: "select" | "date-range" | "date"
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
  filters?: { enabled?: boolean; enableStatusFilter?: boolean }
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
  initialFilters?: Partial<ResourceFilters>
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
  tabs?: TabConfig
}

const DEFAULT_INITIAL_FILTERS: ResourceFilters = {
  page: 1,
  pageSize: 10,
  search: "",
  isActive: "true",
}

export function ResourceListPage<TData extends { id?: string }, TValue>({
  title,
  description,
  addHref,
  onAdd,
  addLabel,
  columns,
  useResourceQuery,
  initialFilters,
  searchPlaceholder,
  filterDefinitions = [],
  onTableReady,
  resourceName,
  bulkDeleteMutation,
  bulkStatusUpdateMutation,
  config = {},
  tabs,
}: ResourceListPageProps<TData, TValue>) {
  const mergedFilters = { ...DEFAULT_INITIAL_FILTERS, ...initialFilters }
  const [filters, setFilters] = useState<ResourceFilters>(mergedFilters as ResourceFilters)
  const [sorting, setSorting] = useState<SortingState>([])
  const [itemIdsToDelete, setItemIdsToDelete] = useState<string[]>([])

  const apiFilters: ResourceFilters = useMemo(() => ({
    ...filters,
    _sort: sorting.length > 0 ? sorting[0].id : undefined,
    _order: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined,
  }), [filters, sorting])

  // For tab counts, fetch without the tab filter to show accurate counts for all tabs
  const countFilters: ResourceFilters = useMemo(() => {
    const unfiltered = { ...apiFilters }
    if (tabs?.filterKey) {
      delete unfiltered[tabs.filterKey]
    }
    // Remove pagination and sorting for count query, just get raw counts
    return { ...unfiltered, page: 1, pageSize: 1000 }
  }, [apiFilters, tabs?.filterKey])

  const { data, isFetching, isError, error } = useResourceQuery(apiFilters)
  const { data: countData } = useResourceQuery(countFilters)
  
  const resources = useMemo(() => data?.data || [], [data?.data])
  const countResources = useMemo(() => countData?.data || [], [countData?.data])
  const meta = useMemo(
    () => data?.meta || { total: resources.length, page: 1, pageSize: filters.pageSize, totalPages: 1 },
    [data?.meta, resources.length, filters.pageSize]
  )

  const isFiltered =
    Object.keys(filters).some(
      (key) => key !== "page" && key !== "pageSize" && filters[key] !== mergedFilters[key]
    ) || sorting.length > 0

  const handleReset = () => {
    setFilters(mergedFilters)
    setSorting([])
  }

  const {
    add: addConfig = {},
    bulkActions: bulkActionsConfig = {},
    sorting: sortingConfig = {},
    columnVisibility: columnVisibilityConfig = {},
    rowSelection: rowSelectionConfig = {},
    pagination: paginationConfig = {},
    filters: filtersConfig = {},
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

  // Auto-calculate tab counts if filterKey is provided
  const computedTabCounts = useMemo(() => {
    if (!tabs?.filterKey || tabs?.counts) return tabs?.counts // Use provided counts if available
    
    const counts: Record<string, number> = { all: countResources.length }
    const filterKey = tabs.filterKey
    
    // Group resources by filter key and count (using unfiltered data)
    countResources.forEach((resource) => {
      const value = (resource as Record<string, unknown>)[filterKey] || "unknown"
      const key = String(value)
      counts[key] = (counts[key] || 0) + 1
    })
    
    return counts
  }, [countResources, tabs?.filterKey, tabs?.counts])

  // Handle tab change - update filter directly
  const handleTabChange = (value: string) => {
    // Call the onChange callback if provided
    tabs?.onChange?.(value)
    
    // If filterKey is provided, update the filter automatically
    if (tabs?.filterKey) {
      setFilters({ ...filters, [tabs.filterKey]: value, page: 1 })
    }
  }

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

  // Logic to inject default status filter
  const hasIsActiveFilter = "isActive" in mergedFilters
  const isStatusFilterOverridden = filterDefinitions.some((def) => def.key === "isActive")

  // Check if data exists and has isActive property
  const hasData = resources.length > 0
  const firstItem = resources[0] as Record<string, unknown> | undefined
  const dataHasIsActive = hasData && firstItem && "isActive" in firstItem

  const showDefaultStatusFilter =
    filtersConfig.enableStatusFilter !== false && // Not explicitly disabled
    !isStatusFilterOverridden && // Not overridden
    (
      dataHasIsActive || // Auto-detect: Data has it
      (!hasData && hasIsActiveFilter) || // Fallback: Data empty, but filter initialized
      filtersConfig.enableStatusFilter === true // Forced via config
    )

  const effectiveFilterDefinitions = showDefaultStatusFilter
    ? [
        {
          key: "isActive",
          title: "Status",
          options: [
            { label: "All Status", value: "all" },
            { label: "Active", value: "true" },
            { label: "Inactive", value: "false" },
          ],
        },
        ...filterDefinitions,
      ]
    : filterDefinitions

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

      {/* Filters + Tabs Section */}
      <DataTableFilterToolbar
        searchQuery={filters.search}
        onSearchChange={(value) => setFilters({ ...filters, search: value, page: 1 })}
        searchPlaceholder={searchPlaceholder}
        onReset={handleReset}
        isFiltered={isFiltered}
        filters={effectiveFilterDefinitions.map((def) => ({
          ...def,
          value: String(filters[def.key] ?? ""),
          onChange: (val: string) => setFilters({ ...filters, [def.key]: val, page: 1 }),
        }))}
        tabs={tabs?.enabled ? {
          enabled: true,
          selectedValue: tabs.selectedValue,
          onChange: tabs.onChange,
          options: tabs.options,
          colors: tabs.colors,
          counts: tabs.counts,
          position: tabs.position,
        } : undefined}
        onTabChange={handleTabChange}
        tabCounts={computedTabCounts}
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
        showPagination={paginationConfig.enabled !== false}
        pageSizeOptions={paginationConfig.pageSizeOptions}
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