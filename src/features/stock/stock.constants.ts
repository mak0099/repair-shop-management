import { FilterOption } from "@/components/ui/filter-combobox"


export const STOCK_STATUS_FILTER_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Status" },
  { value: "Ready for Sale", label: "Ready for Sale" },
  { value: "In Testing", label: "In Testing" },
  { value: "Pending", label: "Pending" },
  { value: "Sold", label: "Sold" },
  { value: "LOW_STOCK", label: "Low Stock" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
]

// This should ideally come from an API
export const STOCK_CATEGORY_FILTER_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Categories" },
  { value: "Smartphone", label: "Smartphone" },
  { value: "Accessory", label: "Accessory" },
  { value: "Spare Part", label: "Spare Part" },
]