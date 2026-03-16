"use client"

import { useState, useMemo } from "react"
import { Search, Package, Loader2, Smartphone, LayoutGrid, List, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { usePOS } from "../pos-context"
import { usePOSItems } from "../sales.api"
import { useCategoryOptions } from "@/features/categories/category.api"
import { cn } from "@/lib/utils"
import { CurrencyText } from "@/components/shared/data-table-cells"
import { Item } from "@/features/items/item.schema"

export function POSProductGrid() {
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [viewType, setViewType] = useState<"grid" | "list">("grid")
  
  const { data: products, isLoading: isProductsLoading } = usePOSItems(search, categoryId)
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategoryOptions()
  const { addItem } = usePOS()

  const categories = categoriesData || []

  // Client-side filtering fallback (in case API ignores params)
  const filteredProducts = useMemo(() => {
    const productList = Array.isArray(products) ? products : (products as any)?.data || []
    if (!Array.isArray(productList)) return []
    return productList.filter((product: Item) => {
      const matchesCategory = categoryId ? product.categoryId === categoryId : true
      const matchesSearch = search 
        ? (product.name?.toLowerCase().includes(search.toLowerCase()) || 
           product.sku?.toLowerCase().includes(search.toLowerCase()) ||
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           ((product as any).imei && (product as any).imei.toLowerCase().includes(search.toLowerCase())))
        : true
      return matchesCategory && matchesSearch
    })
  }, [products, categoryId, search])

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Header & Filters */}
      <div className="flex-none p-4 bg-card border-b space-y-4 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by name, IMEI or SKU..." 
              className="pl-10 pr-8 h-11 bg-muted/50 border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="flex bg-muted p-1 rounded-xl border border-border">
            <Button 
              variant={viewType === "grid" ? "secondary" : "ghost"} 
              size="icon" 
              className={cn(
                "h-9 w-9 rounded-lg transition-all",
                viewType === "grid" && "shadow-sm text-primary ring-1 ring-black/5 bg-background"
              )}
              onClick={() => setViewType("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewType === "list" ? "secondary" : "ghost"} 
              size="icon" 
              className={cn(
                "h-9 w-9 rounded-lg transition-all",
                viewType === "list" && "shadow-sm text-primary ring-1 ring-black/5 bg-background"
              )}
              onClick={() => setViewType("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap pb-1">
          <div className="flex items-center gap-2">
            <Button 
              variant={categoryId === "" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setCategoryId("")} 
              className={cn(
                "rounded-full px-5 h-8 text-[11px] font-bold uppercase tracking-widest transition-all",
                categoryId === "" 
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" 
                  : "bg-card hover:bg-muted border-border text-card-foreground hover:text-foreground"
              )}
            >
              All Items
            </Button>
            
            {isCategoriesLoading ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-24 bg-muted rounded-full animate-pulse" />
                ))}
              </div>
            ) : (
              categories.map((cat: { id: string; name: string }) => (
                <Button 
                  key={cat.id} 
                  variant={categoryId === cat.id ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setCategoryId(cat.id)} 
                  className={cn(
                    "rounded-full px-5 h-8 text-[11px] font-bold uppercase tracking-widest transition-all",
                    categoryId === cat.id 
                      ? "bg-primary/90 hover:bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                      : "bg-card hover:bg-muted border-border text-card-foreground hover:text-foreground"
                  )}
                >
                  {cat.name}
                </Button>
              ))
            )}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
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
            {filteredProducts.map((product: Item) => (
              <button
                key={product.id}
                onClick={() => addItem(product)}
                className={cn(
                  "group relative bg-card border border-border transition-all duration-200 active:scale-[0.97] text-left overflow-hidden",
                  viewType === "grid" 
                    ? "flex flex-col p-4 rounded-2xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5" 
                    : "flex items-center justify-between p-3 rounded-xl hover:border-primary/50 hover:bg-primary/10"
                )}
              >
                <div className={cn("flex items-center gap-3", viewType === "grid" ? "mb-3" : "flex-1")}>
                  <div className={cn(
                    "flex items-center justify-center rounded-xl transition-colors shrink-0",
                    viewType === "grid" ? "h-10 w-10" : "h-10 w-10",
                    product.isSerialized 
                      ? "bg-primary/10 text-primary group-hover:bg-primary/20" 
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                  )}>
                    {product.isSerialized ? <Smartphone className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono mt-1">
                      {product.sku || 'NO SKU'}
                    </p>
                  </div>
                </div>

                <div className={cn(
                  "flex items-center",
                  viewType === "grid" ? "justify-between mt-auto pt-3 border-t border-border" : "gap-6 pl-4"
                )}>
                  <span className="text-sm font-black text-foreground">
                    <CurrencyText amount={product.salePrice} />
                  </span>
                  
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[9px] font-bold px-1.5 h-5 border-border",
                      product.initialStock > 0 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20" 
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    )}
                  >
                    {product.initialStock > 0 ? `${product.initialStock} IN` : 'OUT'}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
