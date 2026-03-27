"use client"

import { POSProvider } from "../pos-context"
import { POSProductGrid } from "./pos-product-grid"
import { POSCartPanel } from "./pos-cart-panel"

export function POSTerminal() {
  return (
    <POSProvider>
      <div className="flex flex-col h-[calc(100vh-140px)] w-full gap-4 min-h-0">
        <div className="flex flex-col lg:flex-row gap-4 h-full overflow-hidden min-w-0">
          {/* Product Selection Area */}
          <div className="flex-1 bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden min-w-0">
            <POSProductGrid />
          </div>

          {/* Cart & Order Management Area - Responsive width based on available space */}
          <div className="w-full lg:w-[clamp(320px,28%,420px)] flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <POSCartPanel />
          </div>
        </div>
      </div>
    </POSProvider>
  )
}