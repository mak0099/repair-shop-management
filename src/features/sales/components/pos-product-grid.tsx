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

export function POSProductGrid() {
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [viewType, setViewType] = useState<"grid" | "list">("grid")
  
  const { data: rawData, isLoading: isProductsLoading } = usePOSItems(search, categoryId)
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategoryOptions()
  const { addItem } = usePOS()

  const products = Array.isArray(rawData) ? rawData : ((rawData as any)?.data || [])
  const categories = categoriesData || []

  // Client-side filtering fallback (in case API ignores params)
  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const matchesCategory = categoryId ? product.categoryId === categoryId : true
      const matchesSearch = search 
        ? (product.name?.toLowerCase().includes(search.toLowerCase()) || 
           product.sku?.toLowerCase().includes(search.toLowerCase()) ||
           (product.imei && product.imei.toLowerCase().includes(search.toLowerCase())))
        : true
      return matchesCategory && matchesSearch
    })
  }, [products, categoryId, search])

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      {/* Header & Filters */}
      <div className="flex-none p-4 bg-white border-b space-y-4 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search by name, IMEI or SKU..." 
              className="pl-10 pr-8 h-11 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Button 
              variant={viewType === "grid" ? "white" : "ghost"} 
              size="icon" 
              className={cn(
                "h-9 w-9 rounded-lg transition-all",
                viewType === "grid" && "shadow-sm text-blue-600 ring-1 ring-black/5"
              )}
              onClick={() => setViewType("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewType === "list" ? "white" : "ghost"} 
              size="icon" 
              className={cn(
                "h-9 w-9 rounded-lg transition-all",
                viewType === "list" && "shadow-sm text-blue-600 ring-1 ring-black/5"
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
                  ? "bg-slate-900 hover:bg-slate-800 text-white shadow-md" 
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
              )}
            >
              All Items
            </Button>
            
            {isCategoriesLoading ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-24 bg-slate-100 rounded-full animate-pulse" />
                ))}
              </div>
            ) : (
              categories.map((cat: any) => (
                <Button 
                  key={cat.id} 
                  variant={categoryId === cat.id ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setCategoryId(cat.id)} 
                  className={cn(
                    "rounded-full px-5 h-8 text-[11px] font-bold uppercase tracking-widest transition-all",
                    categoryId === cat.id 
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200" 
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
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
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Loading Catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <Package className="h-10 w-10 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500">No products found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or category</p>
          </div>
        ) : (
          <div className={cn(
            "pb-20", // Extra padding for bottom
            viewType === "grid" 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4" 
              : "flex flex-col gap-3"
          )}>
            {filteredProducts.map((product: any) => (
              <button
                key={product.id}
                onClick={() => addItem(product)}
                className={cn(
                  "group relative bg-white border border-slate-200 transition-all duration-200 active:scale-[0.97] text-left overflow-hidden",
                  viewType === "grid" 
                    ? "flex flex-col p-4 rounded-2xl hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5" 
                    : "flex items-center justify-between p-3 rounded-xl hover:border-blue-300 hover:bg-blue-50/30"
                )}
              >
                <div className={cn("flex items-center gap-3", viewType === "grid" ? "mb-3" : "flex-1")}>
                  <div className={cn(
                    "flex items-center justify-center rounded-xl transition-colors shrink-0",
                    viewType === "grid" ? "h-10 w-10" : "h-10 w-10",
                    product.isSerialized 
                      ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100" 
                      : "bg-slate-50 text-slate-500 group-hover:bg-slate-100"
                  )}>
                    {product.isSerialized ? <Smartphone className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-700 leading-tight truncate group-hover:text-blue-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mt-1">
                      {product.sku || 'NO SKU'}
                    </p>
                  </div>
                </div>

                <div className={cn(
                  "flex items-center",
                  viewType === "grid" ? "justify-between mt-auto pt-3 border-t border-slate-50" : "gap-6 pl-4"
                )}>
                  <span className="text-sm font-black text-slate-900">
                    €{Number(product.salePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[9px] font-bold px-1.5 h-5 border-slate-200",
                      product.initialStock > 0 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : "bg-red-50 text-red-700 border-red-100"
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
