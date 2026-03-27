"use client"

import { useState, useMemo, useCallback } from "react"
import { Search, Package, Loader2, Smartphone, LayoutGrid, List, X, Wrench, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FilterCombobox } from "@/components/ui/filter-combobox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { usePOS } from "../pos-context"
import { usePOSItems, POSFilterParams } from "../sales.api"
import { useCategoryOptions } from "@/features/categories/category.api"
import { useBrandOptions } from "@/features/brands/brand.api"
import { cn } from "@/lib/utils"
import { CurrencyText } from "@/components/shared/data-table-cells"
import { Item } from "@/features/items/item.schema"

// Extended product type for POS display
type POSProductDisplay = Item & {
  quantity?: number
  imei?: string | null
}

// Item type styling configuration - matches item-list colors
const ITEM_TYPE_STYLES = {
  DEVICE: {
    borderColor: "border-blue-500/40",
    bgGradient: "from-blue-500/5 to-transparent",
    icon: Smartphone,
    label: "Device",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  PART: {
    borderColor: "border-orange-500/40",
    bgGradient: "from-orange-500/5 to-transparent",
    icon: Wrench,
    label: "Part",
    badgeColor: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  },
  SERVICE: {
    borderColor: "border-green-500/40",
    bgGradient: "from-green-500/5 to-transparent",
    icon: Zap,
    label: "Service",
    badgeColor: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
}

const getItemTypeStyle = (itemType: string) => ITEM_TYPE_STYLES[itemType as keyof typeof ITEM_TYPE_STYLES] || ITEM_TYPE_STYLES.DEVICE

// Filter configuration per itemType
const FILTER_CONFIG = {
  ALL: { label: "All Items", filters: ["category", "deviceType", "brand", "condition", "color"] },
  DEVICE: { label: "Devices", filters: ["category", "deviceType", "brand", "condition", "color"] },
  PART: { label: "Parts", filters: ["category", "brand", "partType", "compatibility"] },
  SERVICE: { label: "Services", filters: ["category", "serviceType"] },
}

export function POSProductGrid() {
  const [search, setSearch] = useState("")
  const [itemType, setItemType] = useState<"ALL" | "DEVICE" | "PART" | "SERVICE">("ALL")
  const [categoryId, setCategoryId] = useState("")
  const [brandId, setBrandId] = useState("")
  const [condition, setCondition] = useState("")
  const [deviceType, setDeviceType] = useState("")
  const [color, setColor] = useState("")
  const [partType, setPartType] = useState("")
  const [compatibility, setCompatibility] = useState("")
  const [serviceType, setServiceType] = useState("")
  const [viewType, setViewType] = useState<"grid" | "list">("grid")
  
  const { data: categoriesData } = useCategoryOptions()
  const { data: brandsData } = useBrandOptions()
  const { addItem } = usePOS()

  // Clear all filters - memoized to prevent infinite loops  
  const clearAllFilters = useCallback(() => {
    setSearch("")
    setItemType("ALL")
    setCategoryId("")
    setBrandId("")
    setCondition("")
    setDeviceType("")
    setColor("")
    setPartType("")
    setCompatibility("")
    setServiceType("")
  }, [])

  // Check if any filter is active - memoized
  const hasActiveFilters = useMemo(() => Boolean(
    search ||
    itemType !== "ALL" ||
    categoryId ||
    brandId ||
    condition ||
    deviceType ||
    color ||
    partType ||
    compatibility ||
    serviceType
  ), [search, itemType, categoryId, brandId, condition, deviceType, color, partType, compatibility, serviceType])

  // Build filter params based on selected filters - MEMOIZED to prevent infinite loops
  const filterParams: POSFilterParams = useMemo(() => ({
    search,
    categoryId: categoryId || undefined,
    brandId: brandId || undefined,
    condition: condition || undefined,
    deviceType: deviceType || undefined,
    color: color || undefined,
    partType: partType || undefined,
    compatibility: compatibility || undefined,
    serviceType: serviceType || undefined,
    itemType: itemType !== "ALL" ? itemType : undefined,
  }), [
    search,
    categoryId,
    brandId,
    condition,
    deviceType,
    color,
    partType,
    compatibility,
    serviceType,
    itemType
  ])

  const { data: products, isLoading: isProductsLoading } = usePOSItems(filterParams)
  
  // Memoize categories and brands to prevent infinite loops
  const categories = useMemo(() => categoriesData || [], [categoriesData])
  const brands = useMemo(() => brandsData || [], [brandsData])
  
  // Memoize category options
  const categoryOptions = useMemo(() => [
    { value: "", label: "All Categories" },
    ...categories.map((cat: { id: string; name: string }) => ({
      value: cat.id,
      label: cat.name,
    })),
  ], [categories])
  
  // Memoize brand options
  const brandOptions = useMemo(() => [
    { value: "", label: "All Brands" },
    ...brands.map((brand: { id: string; name: string }) => ({
      value: brand.id,
      label: brand.name,
    })),
  ], [brands])

  // Get active filters for current itemType - memoized
  const visibleFilters = useMemo(() => {
    const activeFilterConfig = FILTER_CONFIG[itemType]
    return activeFilterConfig.filters
  }, [itemType])

  // Client-side filtering fallback
  const filteredProducts = useMemo(() => {
    const productList = Array.isArray(products) ? products : (products as unknown as { data?: Item[] })?.data || []
    if (!Array.isArray(productList)) return []
    return (productList as POSProductDisplay[]).filter((product: POSProductDisplay) => {
      const matchesItemType = itemType === "ALL" || product.itemType === itemType || false
      const matchesCategory = !categoryId || product.categoryId === categoryId || false
      const matchesBrand = !brandId || product.brandId === brandId || false
      const matchesCondition = !condition || product.condition === condition || false
      const matchesDeviceType = !deviceType || product.deviceType === deviceType || false
      const matchesColor = !color || product.color === color || false
      const matchesPartType = !partType || product.partType === partType || false
      const matchesCompatibility = !compatibility || product.compatibility === compatibility || false
      const matchesServiceType = !serviceType || product.serviceType === serviceType || false
      const matchesSearch = !search 
        ? true
        : (product.name?.toLowerCase().includes(search.toLowerCase()) || 
           product.sku?.toLowerCase().includes(search.toLowerCase()) ||
           (product.imei && product.imei.toLowerCase().includes(search.toLowerCase()))) || false
      
      return !!(matchesItemType && matchesCategory && matchesBrand && matchesCondition && matchesDeviceType && 
             matchesColor && matchesPartType && matchesCompatibility && matchesServiceType && 
             matchesSearch)
    })
  }, [products, itemType, categoryId, brandId, condition, deviceType, color, partType, compatibility, serviceType, search])

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Header & Filters */}
      <div className="flex-none bg-card border-b shadow-sm z-10">
        {/* Top Row: ItemType Tabs + Search (flex) + View Toggle (right) */}
        <div className="flex items-center gap-2 p-3">
          {/* ItemType Tabs - Left Aligned, Fixed */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {Object.entries(FILTER_CONFIG).map(([key, config]) => (
              <Button
                key={key}
                variant={itemType === key ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setItemType(key as typeof itemType)
                  // Reset all filters when switching itemType
                  setSearch("")
                  setCategoryId("")
                  setBrandId("")
                  setCondition("")
                  setDeviceType("")
                  setColor("")
                  setPartType("")
                  setCompatibility("")
                  setServiceType("")
                }}
                className={cn(
                  "rounded-md px-2 h-7 text-[10px] font-bold uppercase tracking-tighter transition-all",
                  itemType === key
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                    : "bg-card hover:bg-muted border-border text-card-foreground hover:text-foreground"
                )}
              >
                {config.label.split(" ")[0]}
              </Button>
            ))}
          </div>

          {/* Search Box - Middle, Flex Fill */}
          <div className="relative flex-1 group min-w-0">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search..." 
              className="pl-7 pr-6 h-8 text-xs bg-muted/50 border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </div>

          {/* View Toggle - Right Aligned, Fixed */}
          <div className="flex bg-muted p-1 rounded-lg border border-border flex-shrink-0">
            <Button 
              variant={viewType === "grid" ? "secondary" : "ghost"} 
              size="icon" 
              className={cn(
                "h-7 w-7 rounded-md transition-all",
                viewType === "grid" && "shadow-sm text-primary ring-1 ring-black/5 bg-background"
              )}
              onClick={() => setViewType("grid")}
            >
              <LayoutGrid className="h-3 w-3" />
            </Button>
            <Button 
              variant={viewType === "list" ? "secondary" : "ghost"} 
              size="icon" 
              className={cn(
                "h-7 w-7 rounded-md transition-all",
                viewType === "list" && "shadow-sm text-primary ring-1 ring-black/5 bg-background"
              )}
              onClick={() => setViewType("list")}
            >
              <List className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Filter Row - Horizontal Scrollable with Gaps */}
        <div className="border-t border-border bg-muted/30 px-3 py-2 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {/* Category Filter */}
            {visibleFilters.includes("category") && (
              <div>
                <FilterCombobox
                  options={categoryOptions}
                  value={categoryId}
                  onChange={setCategoryId}
                  placeholder="Category"
                />
              </div>
            )}

            {/* Device Type Filter - Moved up (broad filter) */}
            {visibleFilters.includes("deviceType") && (
              <div>
                <FilterCombobox
                  options={[
                    { value: "", label: "All Types" },
                    { value: "Smartphone", label: "Smartphone" },
                    { value: "Tablet", label: "Tablet" },
                    { value: "Laptop", label: "Laptop" },
                  ]}
                  value={deviceType}
                  onChange={setDeviceType}
                  placeholder="Device Type"
                />
              </div>
            )}

            {/* Brand Filter */}
            {visibleFilters.includes("brand") && (
              <div>
                <FilterCombobox
                  options={brandOptions}
                  value={brandId}
                  onChange={setBrandId}
                  placeholder="Brand"
                />
              </div>
            )}

            {/* Condition Filter */}
            {visibleFilters.includes("condition") && (
              <div>
                <FilterCombobox
                  options={[
                    { value: "", label: "All Conditions" },
                    { value: "NEW", label: "New" },
                    { value: "USED", label: "Used" },
                    { value: "REFURBISHED", label: "Refurbished" },
                  ]}
                  value={condition}
                  onChange={setCondition}
                  placeholder="Condition"
                />
              </div>
            )}

            {/* Part Type Filter */}
            {visibleFilters.includes("partType") && (
              <div>
                <FilterCombobox
                  options={[
                    { value: "", label: "All Parts" },
                    { value: "Battery", label: "Battery" },
                    { value: "Screen", label: "Screen" },
                    { value: "Charger", label: "Charger" },
                    { value: "Camera", label: "Camera" },
                  ]}
                  value={partType}
                  onChange={setPartType}
                  placeholder="Part Type"
                />
              </div>
            )}

            {/* Compatibility Filter */}
            {visibleFilters.includes("compatibility") && (
              <div>
                <FilterCombobox
                  options={[
                    { value: "", label: "All Compatibilities" },
                    { value: "iPhone X-14", label: "iPhone X-14" },
                    { value: "Samsung A-S", label: "Samsung A-S" },
                    { value: "Universal", label: "Universal" },
                  ]}
                  value={compatibility}
                  onChange={setCompatibility}
                  placeholder="Compatibility"
                />
              </div>
            )}

            {/* Service Type Filter */}
            {visibleFilters.includes("serviceType") && (
              <div>
                <FilterCombobox
                  options={[
                    { value: "", label: "All Services" },
                    { value: "Phone Flash", label: "Phone Flash" },
                    { value: "Data Recovery", label: "Data Recovery" },
                    { value: "Screen Repair", label: "Screen Repair" },
                    { value: "Battery Replacement", label: "Battery Replacement" },
                  ]}
                  value={serviceType}
                  onChange={setServiceType}
                  placeholder="Service Type"
                />
              </div>
            )}

            {/* Clear Filters Button - Only show when filters are active */}
            {hasActiveFilters && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={clearAllFilters}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-md flex-shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset Filters</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isProductsLoading ? (
          <div className="h-full flex flex-col items-center justify-center opacity-60">
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Loading Catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50">
            <div className="bg-muted p-6 rounded-full mb-4">
              <Package className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">No products found</p>
            <p className="text-xs text-muted-foreground/80 mt-1">Try adjusting your search or category</p>
          </div>
        ) : (
          <div className={cn(
            "pb-20", // Extra padding for bottom
            viewType === "grid" 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4" 
              : "flex flex-col gap-3"
          )}>
            {filteredProducts.map((product: POSProductDisplay) => {
              const typeStyle = getItemTypeStyle(product.itemType)
              const TypeIcon = typeStyle.icon
              // SERVICE items don't have stock constraints - always enabled
              const isOutOfStock = product.itemType !== "SERVICE" && ((product as unknown as { quantity?: number }).quantity || 0) <= 0
              
              return (
              <button
                key={product.id}
                onClick={() => addItem(product)}
                disabled={isOutOfStock}
                className={cn(
                  "group relative transition-all duration-200 active:scale-[0.97] text-left overflow-hidden",
                  "bg-gradient-to-br",
                  typeStyle.bgGradient,
                  "border-2",
                  typeStyle.borderColor,
                  viewType === "grid" 
                    ? "flex flex-col p-3 rounded-xl hover:shadow-lg hover:shadow-current/10 hover:border-current/60" 
                    : "flex items-center justify-between p-3 rounded-lg hover:bg-primary/10",
                  isOutOfStock && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className={cn("flex items-center gap-2 flex-1", viewType === "grid" ? "mb-2" : "")}>
                  <div className={cn(
                    "flex items-center justify-center rounded-lg transition-colors shrink-0",
                    "p-1.5",
                    typeStyle.badgeColor
                  )}>
                    <TypeIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-tighter font-mono mt-0.5">
                      {product.sku || 'NO SKU'}
                    </p>
                  </div>
                </div>

                <div className={cn(
                  "flex items-center gap-1.5",
                  viewType === "grid" ? "justify-between border-t border-border/50 w-full pt-2 mt-auto" : "gap-4 pl-2"
                )}>
                  <span className="text-sm font-bold text-foreground">
                    <CurrencyText amount={product.salePrice} />
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {/* Type Badge - Moved to bottom */}
                    <Badge 
                      variant="outline" 
                      className={cn("text-[8px] font-bold px-1.5 h-4 border", typeStyle.badgeColor)}
                    >
                      {typeStyle.label}
                    </Badge>

                    {/* SN Badge - For serialized products */}
                    {(product.itemType === "DEVICE" || product.itemType === "LOANER") && (
                      <Badge 
                        variant="outline" 
                        className="text-[8px] px-1.5 h-4 border bg-primary/10 text-primary border-primary/20 font-bold"
                      >
                        SN
                      </Badge>
                    )}

                    {/* Quantity/Stock Badge - Only for DEVICE/PART items */}
                    {product.itemType !== "SERVICE" && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[8px] font-bold px-1.5 h-4 border",
                          (product.quantity || 0) > 0 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20" 
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        )}
                      >
                        {(product.quantity || 0) > 0 ? `${product.quantity}` : 'OUT'}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
