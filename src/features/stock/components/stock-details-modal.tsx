"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Stock } from "../stock.schema"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StockDetailsModalProps {
  stockItem: Stock | null
  isOpen: boolean
  onClose: () => void
}

export function StockDetailsModal({ stockItem, isOpen, onClose }: StockDetailsModalProps) {
  if (!stockItem) return null

  const isLowStock = stockItem.stockQuantity <= stockItem.lowStockThreshold

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-none p-0 bg-transparent shadow-none">
        <div className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-border">
          <DialogHeader className="p-6 bg-card border-b border-border">
            <DialogTitle className="text-xl font-bold text-foreground">
              Inventory Intelligence: {stockItem.itemName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <Card className="shadow-none border-border bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Quick Specs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  <p><strong>SKU:</strong> <span className="font-mono">{stockItem.sku}</span></p>
                  <p><strong>Brand:</strong> {stockItem.brandName}</p>
                  {/* FIX: boxLocationName is now recognized by TypeScript */}
                  <p><strong>Location:</strong> {stockItem.boxLocationName || "Not Assigned"}</p>
                </CardContent>
              </Card>

              <Card className={cn(
                "shadow-none border-border transition-colors", // Default border-border
                isLowStock ? "border-amber-500/20 bg-amber-500/5" : "border-border" // Conditional styling for low stock
              )}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className={cn("text-4xl font-black", isLowStock ? "text-amber-600 dark:text-amber-500" : "text-foreground")}>
                        {stockItem.stockQuantity}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                        Units Available
                      </p>
                    </div>
                    {/*  Removed 'success' variant, using custom emerald colors */}
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 border-none", // Common styles
                        stockItem.isActive ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground" // Themed colors
                      )}
                    >
                      {stockItem.isActive ? "IN CATALOG" : "HIDDEN"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">Recent Movement History</h4>
              </div>
              <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/30 text-muted-foreground text-xs">
                Ledger integration is being finalized...
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}