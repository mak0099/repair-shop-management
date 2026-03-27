"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Search, X, Filter, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FilterCombobox, FilterOption } from "@/components/ui/filter-combobox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DayPicker, type DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"

export interface FilterConfig {
  key: string
  title: string
  options?: FilterOption[]
  value: string
  onChange: (value: string) => void
  icon?: React.ElementType
  type?: "select" | "date-range" | "date"
}

export interface TabConfig {
  enabled?: boolean
  selectedValue?: string
  onChange?: (value: string) => void
  options?: { label: string; value: string }[]
  colors?: Record<string, string>
  counts?: Record<string, number>
  position?: "top" | "bottom" | "left" | "right"
}

interface DataTableFilterToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: FilterConfig[]
  onReset?: () => void
  isFiltered?: boolean
  tabs?: TabConfig
  onTabChange?: (value: string) => void
  tabCounts?: Record<string, number>
  children?: React.ReactNode
}

// Moved outside to prevent re-renders and unmounting which causes the popover to close unexpectedly
const DAY_PICKER_CLASSNAMES = {
  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
  month: "space-y-4",
  caption: "flex justify-center pt-1 relative items-center h-9",
  caption_label: "text-sm font-medium",
  nav: "flex items-center",
  button_previous: cn(
    buttonVariants({ variant: "outline" }),
    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-2 z-10"
  ),
  button_next: cn(
    buttonVariants({ variant: "outline" }),
    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-2 z-10"
  ),
  month_grid: "w-full border-collapse space-y-1",
  weekdays: "flex justify-between",
  weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
  week: "flex w-full mt-2 justify-between",
  day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
  day_button: cn(
    buttonVariants({ variant: "ghost" }),
    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 transition-all hover:bg-accent"
  ),
  selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
  today: "bg-accent text-accent-foreground",
  outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
  disabled: "text-muted-foreground opacity-50",
  hidden: "invisible",
}

const DAY_PICKER_COMPONENTS = {
  Chevron: (props: { orientation?: string }) => {
    if (props.orientation === 'left') return <ChevronLeft className="h-4 w-4" />;
    return <ChevronRight className="h-4 w-4" />;
  }
}

// Simple date input filter
function DateFilter({ filter }: { filter: FilterConfig }) {
  const Icon = filter.icon || Filter
  return (
    <div className="flex items-center border border-input bg-background rounded-md h-8 px-2.5 text-xs shadow-sm transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-ring hover:border-foreground/30">
      <Icon className="mr-2 h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground font-medium mr-2 hidden sm:inline-block">{filter.title}</span>
      <input
        type="date"
        className="bg-transparent text-foreground text-xs outline-none w-[110px] dark:[color-scheme:dark]"
        value={filter.value || ""}
        onChange={(e) => filter.onChange(e.target.value)}
      />
    </div>
  )
}

// Select/Combobox filter
function SelectFilter({ filter }: { filter: FilterConfig }) {
  const Icon = filter.icon || Filter
  return (
    <FilterCombobox
      options={filter.options || []}
      value={filter.value}
      onChange={filter.onChange}
      placeholder={filter.title}
      icon={Icon === undefined ? Filter : Icon}
    />
  )
}

function DateRangeFilter({ filter }: { filter: FilterConfig }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const [from, to] = filter.value ? filter.value.split(",") : ["", ""]
  
  // Maintain local state so the calendar stays open during selection
  const [prevValue, setPrevValue] = useState(filter.value)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const fromDate = from ? new Date(`${from}T00:00:00`) : undefined
    const toDate = to ? new Date(`${to}T00:00:00`) : undefined
    return fromDate ? { from: fromDate, to: toDate } : undefined
  })
  
  const [month, setMonth] = useState<Date>(() => dateRange?.from || new Date())
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  if (filter.value !== prevValue) {
    setPrevValue(filter.value)
    const fromDate = from ? new Date(`${from}T00:00:00`) : undefined
    const toDate = to ? new Date(`${to}T00:00:00`) : undefined
    setDateRange(fromDate ? { from: fromDate, to: toDate } : undefined)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Apply filter to parent when popover is closed manually
      if (!dateRange?.from && !dateRange?.to) {
        if (filter.value !== "") filter.onChange("")
      } else {
        const fromDateStr = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""
        const toDateStr = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""
        const newVal = `${fromDateStr},${toDateStr}`
        if (newVal !== filter.value) {
          filter.onChange(newVal)
        }
      }
      setHoveredDate(null)
    } else {
      // Set calendar view to the selected start date when opened
      if (dateRange?.from) {
        setMonth(dateRange.from)
      }
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 border-dashed bg-background px-2.5 text-xs shadow-sm justify-between w-full sm:w-[250px]",
            !dateRange?.from && "text-muted-foreground"
          )}
        >
          <div className="flex items-center truncate">
            <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium">
              {dateRange?.from ? (
                dateRange.to ? (
                  `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
                ) : (
                  format(dateRange.from, "MMM d, yyyy")
                )
              ) : (
                filter.title
              )}
            </span>
          </div>
          {dateRange?.from && (
            <div
              role="button"
              className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full hover:bg-muted-foreground/20 text-muted-foreground transition-colors z-10"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDateRange(undefined)
                filter.onChange("")
                setIsOpen(false)
              }}
            >
              <X className="h-3.5 w-3.5" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          initialFocus
          mode="range"
          month={month}
          onMonthChange={setMonth}
          selected={dateRange}
          onSelect={(_range, selectedDay) => {
            // Custom logic for rigid 2-click range selection
            if (!dateRange?.from || (dateRange.from && dateRange.to)) {
              setDateRange({ from: selectedDay, to: undefined })
            } else {
              const newFrom = selectedDay < dateRange.from ? selectedDay : dateRange.from
              const newTo = selectedDay < dateRange.from ? dateRange.from : selectedDay
              
              setDateRange({ from: newFrom, to: newTo })
              
              const fromDateStr = format(newFrom, "yyyy-MM-dd")
              const toDateStr = format(newTo, "yyyy-MM-dd")
              filter.onChange(`${fromDateStr},${toDateStr}`)
              setIsOpen(false)
            }
          }}
          onDayMouseEnter={(date) => setHoveredDate(date)}
          onDayMouseLeave={() => setHoveredDate(null)}
          modifiers={{
            hover_range_middle: (date) => {
              if (!dateRange?.from || dateRange?.to || !hoveredDate) return false;
              const start = dateRange.from < hoveredDate ? dateRange.from : hoveredDate;
              const end = dateRange.from < hoveredDate ? hoveredDate : dateRange.from;
              return date > start && date < end;
            },
            hover_range_end: (date) => {
              if (!dateRange?.from || dateRange?.to || !hoveredDate) return false;
              return date.getTime() === hoveredDate.getTime() && dateRange.from < hoveredDate;
            },
            hover_range_start: (date) => {
              if (!dateRange?.from || dateRange?.to || !hoveredDate) return false;
              return date.getTime() === hoveredDate.getTime() && dateRange.from > hoveredDate;
            },
            hover_range_start_selected: (date) => {
              if (!dateRange?.from || dateRange?.to || !hoveredDate) return false;
              return date.getTime() === dateRange.from.getTime() && dateRange.from < hoveredDate;
            },
            hover_range_end_selected: (date) => {
              if (!dateRange?.from || dateRange?.to || !hoveredDate) return false;
              return date.getTime() === dateRange.from.getTime() && dateRange.from > hoveredDate;
            }
          }}
          modifiersClassNames={{
            hover_range_middle: "bg-accent/50 text-accent-foreground rounded-none",
            hover_range_end: "day-range-end rounded-l-none bg-accent/50 text-accent-foreground",
            hover_range_start: "day-range-start rounded-r-none bg-accent/50 text-accent-foreground",
            hover_range_start_selected: "day-range-start rounded-r-none",
            hover_range_end_selected: "day-range-end rounded-l-none",
          }}
          numberOfMonths={1}
          className="p-3"
          classNames={DAY_PICKER_CLASSNAMES}
          components={DAY_PICKER_COMPONENTS}
        />
      </PopoverContent>
    </Popover>
  )
}

export function DataTableFilterToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onReset,
  isFiltered,
  tabs,
  onTabChange,
  tabCounts,
  children,
}: DataTableFilterToolbarProps) {
  // Handle tab change with callback
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value)
    } else if (tabs?.onChange) {
      tabs.onChange(value)
    }
  }

  // Render filter items
  const renderFilters = () => (
    <>
      {filters.map((filter) => {
        if (filter.type === "date") {
          return <DateFilter key={filter.key} filter={filter} />
        }

        if (filter.type === "date-range") {
          return <DateRangeFilter key={filter.key} filter={filter} />
        }

        return <SelectFilter key={filter.key} filter={filter} />
      })}

      {isFiltered && onReset && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" onClick={onReset} className="h-8 px-2 lg:px-3 text-xs text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset Filters</TooltipContent>
        </Tooltip>
      )}
    </>
  )

  // If tabs are enabled, render with position-based layout
  if (tabs?.enabled && tabs?.options) {
    const tabPosition = tabs.position || "top"
    
    // Render tabs section
    const tabsSection = (
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.options.map((tab) => {
          const count = (tabCounts?.[tab.value] || tabs.counts?.[tab.value]) || 0
          const isActive = tabs.selectedValue === tab.value
          const tabBorderColor = tabs.colors?.[tab.value] || "border-border"
          return (
            <Button
              key={tab.value}
              variant="ghost"
              size="sm"
              onClick={() => handleTabChange(tab.value)}
              className={`h-8 px-3 text-xs font-bold whitespace-nowrap gap-1.5 transition-all duration-200 rounded-md border ${
                isActive
                  ? `${tabBorderColor} bg-secondary text-secondary-foreground shadow-sm`
                  : `border-border hover:border-foreground/30 hover:bg-accent`
              }`}
            >
              {tab.label} <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full transition-colors duration-200 ${
                isActive
                  ? "bg-secondary-foreground/20 text-secondary-foreground"
                  : "bg-primary/10 text-primary"
              }`}>{count}</span>
            </Button>
          )
        })}
      </div>
    )

    // Render filters section
    const filtersSection = (
      <div className="flex flex-col lg:flex-row lg:flex-nowrap items-start gap-2.5 w-full">
        <div className="relative w-full lg:w-[240px] lg:shrink-0">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex lg:flex-nowrap flex-wrap items-start gap-2 flex-1 overflow-x-auto pb-1">
          {renderFilters()}
        </div>
        {children && (
          <div className="flex items-start gap-2 lg:ml-auto shrink-0 w-full lg:w-auto justify-end">
            {children}
          </div>
        )}
      </div>
    )

    // Render based on position
    if (tabPosition === "top") {
      return (
        <div className="rounded-lg border border-border bg-background shadow-sm p-3">
          {tabsSection}
          <div className="border-t border-border mt-2 pt-2">
            {filtersSection}
          </div>
        </div>
      )
    } else if (tabPosition === "bottom") {
      return (
        <div className="rounded-lg border border-border bg-background shadow-sm p-3">
          {filtersSection}
          <div className="border-t border-border mt-2 pt-2">
            {tabsSection}
          </div>
        </div>
      )
    } else if (tabPosition === "left") {
      return (
        <div className="rounded-lg border border-border bg-background shadow-sm p-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-shrink-0 flex flex-wrap lg:flex-col items-center lg:items-start gap-2">
              {tabsSection}
            </div>
            <div className="flex-1 lg:border-l lg:border-border lg:pl-3">
              {filtersSection}
            </div>
          </div>
        </div>
      )
    } else if (tabPosition === "right") {
      return (
        <div className="rounded-lg border border-border bg-background shadow-sm p-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 lg:border-r lg:border-border lg:pr-3">
              {filtersSection}
            </div>
            <div className="flex-shrink-0 flex flex-wrap lg:flex-col items-center lg:items-end gap-2">
              {tabsSection}
            </div>
          </div>
        </div>
      )
    }
  }

  // Default single-row layout (no tabs)
  return (
    <div className="bg-background p-2.5 rounded-lg border shadow-sm w-full pb-1">
      <div className="flex flex-col lg:flex-row lg:flex-nowrap items-start gap-2.5 w-full">
        <div className="relative w-full lg:w-[240px] lg:shrink-0">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex lg:flex-nowrap flex-wrap items-start gap-2 flex-1 overflow-x-auto pb-1">
          {renderFilters()}
        </div>
        {children && (
          <div className="flex items-start gap-2 lg:ml-auto shrink-0 w-full lg:w-auto justify-end mt-2 lg:mt-0">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}