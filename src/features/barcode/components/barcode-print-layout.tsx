"use client"

import { Loader2 } from "lucide-react"
import { useItem } from "@/features/items/item.api"
import { BarcodeRequest } from "../barcode.schema"

interface BarcodePrintLayoutProps {
  data: BarcodeRequest
}

export function BarcodePrintLayout({ data }: BarcodePrintLayoutProps) {
  // data.itemId is used to fetch the specific item details
  const {
    data: item,
    isLoading,
    isError,
  } = useItem(data.itemId as string) // Ensured as string

  // Create an array based on requested quantity
  const labels = Array.from({ length: data.quantity })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mb-2 h-6 w-6 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Fetching item details...</p>
      </div>
    )
  }

  if (isError || !item) {
    return (
      <div className="text-center text-destructive py-20 border-2 border-dashed rounded-xl">
        Could not load item details. Please check the Item ID.
      </div>
    )
  }

  /**
   * FIX: Changed 'item.price' to 'item.salePrice' to match our standardized schema.
   * Using 'ja-JP' and 'JPY' as per your original code, but you can change it to 'en-BD'/'BDT' if needed.
   */
  const formattedPrice = new Intl.NumberFormat("ja-JP", { 
    style: "currency", 
    currency: "JPY" 
  }).format(item.salePrice || 0)

  return (
    <div id="printable-barcode-area" className="bg-background p-6 shadow-sm border-border rounded-xl overflow-hidden">
      {/* Grid Layout for Labels */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2">
        {labels.map((_, index) => (
          <div 
            key={index} 
            className="border border-border p-3 flex flex-col items-center justify-center text-center space-y-2 bg-card rounded shadow-sm hover:border-primary transition-colors"
            style={{ 
              width: data.labelSize === "38x25mm" ? "160px" : "220px",
              height: "auto",
              pageBreakInside: "avoid"
            }}
          >
            {data.includeName && (
              <span className="text-[10px] font-bold leading-tight uppercase tracking-tight text-foreground line-clamp-2 w-full">
                {item.name}
              </span>
            )}
            
            {/* Visual Barcode Component Placeholder */}
            <div className="w-full h-12 bg-muted rounded flex items-center justify-center overflow-hidden border border-border">
                <div className="flex gap-[1.5px] h-10 bg-background w-[92%] items-center px-1">
                    {[...Array(25)].map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-black flex-1 h-full" 
                          style={{ width: `${(Math.random() * 2) + 0.5}px`, opacity: Math.random() > 0.1 ? 1 : 0.4, backgroundColor: 'hsl(var(--foreground))' }} 
                        />
                    ))}
                </div>
            </div>
            
            <div className="flex flex-col items-center -space-y-1">
                <span className="text-[9px] font-mono font-bold text-slate-500">
                    {item.sku || "NO-SKU"}
                </span>
                
                {data.includePrice && (
                <span className="text-[12px] font-black text-primary">
                    {formattedPrice}
                </span>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Print Specific Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body * {
            visibility: hidden;
          }
          #printable-barcode-area, #printable-barcode-area * {
            visibility: visible;
          }
          #printable-barcode-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            border: none;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  )
}