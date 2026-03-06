"use client"

import { useState } from "react"
import { Search, Package, Zap, Loader2, FilterX } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePOS } from "../pos-context"
import { usePOSItems } from "../sales.api"
import { cn } from "@/lib/utils"

export function POSProductGrid() {
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")
  
  const { data: rawData, isLoading } = usePOSItems(search, categoryId)
  const { addItem } = usePOS()

  // Handle both array (direct) and paginated ({ data: [...] }) responses
  const products = Array.isArray(rawData) ? rawData : ((rawData as any)?.data || [])

  return (
    <div className="flex flex-col h-full bg-slate-50/20">
      {/* Header: Search and Filter */}
      <div className="p-4 bg-white border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search products or services..." 
            className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Button
            variant={categoryId === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryId("")}
            className="rounded-full px-4 h-7 text-[10px] font-bold uppercase tracking-wider"
          >
            All Items
          </Button>
          {["PRODUCT", "SERVICE"].map((cat) => (
            <Button
              key={cat}
              variant={categoryId === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryId(cat)}
              className="rounded-full px-4 h-7 text-[10px] font-bold uppercase tracking-wider"
            >
              {cat}s
            </Button>
          ))}
        </div>
      </div>

      {/* Grid Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mb-2 opacity-20" />
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-40">Loading Catalog...</p>
          </div>
        ) : !Array.isArray(products) || products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <FilterX className="h-10 w-10 mb-2 opacity-10" />
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-40">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {Array.isArray(products) && products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addItem(product)}
                className="group flex flex-col p-3 bg-white border border-slate-200 rounded-xl text-left hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/5 transition-all active:scale-[0.97]"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    product.type === "PRODUCT" 
                      ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" 
                      : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                  )}>
                    {product.type === "PRODUCT" ? <Package className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                  </div>
                  {product.stock !== undefined && (
                    <Badge variant="secondary" className="text-[9px] font-black px-1.5 h-4 bg-slate-100 text-slate-500 border-none">
                      STK: {product.stock}
                    </Badge>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[11px] font-bold text-slate-700 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  {product.sku && (
                    <p className="text-[9px] font-medium text-slate-400 mt-0.5 truncate uppercase">
                      {product.sku}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">
                    ৳{product.salePrice.toLocaleString()}
                  </span>
                  <div className="h-5 w-5 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <span className="text-xs font-bold">+</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}