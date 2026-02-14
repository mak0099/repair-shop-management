"use client"

import { Search, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FilterCombobox, FilterOption } from "@/components/ui/filter-combobox"

export interface FilterConfig {
  key: string
  title: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  icon?: React.ElementType
}

interface DataTableFilterToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: FilterConfig[]
  onReset?: () => void
  isFiltered?: boolean
  children?: React.ReactNode
}

export function DataTableFilterToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onReset,
  isFiltered,
  children,
}: DataTableFilterToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-background p-3 rounded-lg border shadow-sm">
      <div className="flex flex-1 flex-col sm:flex-row items-center gap-2 w-full">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          {filters.map((filter) => (
            <FilterCombobox
              key={filter.key}
              options={filter.options}
              value={filter.value}
              onChange={filter.onChange}
              placeholder={filter.title}
              icon={filter.icon === undefined ? Filter : filter.icon}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isFiltered && onReset && (
            <Button variant="ghost" onClick={onReset} className="h-8 px-2 lg:px-3">
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}