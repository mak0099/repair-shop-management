"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Item } from "../item.schema"

interface VariantListProps {
  /**
   * We now use Partial<Item> because generated items might not 
   * have all properties (like IDs) before being saved to the database.
   */
  variants: Partial<Item>[]
}

export function VariantList({ variants }: VariantListProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[120px] font-bold text-muted-foreground">SKU</TableHead>
            <TableHead className="font-bold text-muted-foreground">Specifications</TableHead>
            <TableHead className="text-right font-bold text-muted-foreground">Sale Price</TableHead>
            <TableHead className="text-right font-bold text-muted-foreground">Initial Stock</TableHead>
            <TableHead className="text-center font-bold text-muted-foreground">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((item, index) => (
            <TableRow key={item.id || index} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-mono text-[11px] text-muted-foreground uppercase">
                {item.sku || "AUTO-GEN"}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1.5">
                  {item.ram && (
                    <Badge variant="outline" className="text-[10px] font-medium bg-primary/10 text-primary border-primary/20">
                      RAM: {item.ram}
                    </Badge>
                  )}
                  {item.rom && (
                    <Badge variant="outline" className="text-[10px] font-medium bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
                      ROM: {item.rom}
                    </Badge>
                  )}
                  {item.color && (
                    <Badge variant="secondary" className="text-[10px] font-medium">
                      Color: {item.color}
                    </Badge>
                  )}
                  {!item.ram && !item.rom && !item.color && (
                    <span className="text-xs text-muted-foreground italic">No specific attributes</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold text-foreground">
                ৳{(item.salePrice || 0).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <span className="px-2 py-1 rounded-md bg-muted font-bold text-foreground text-xs">
                  {item.initialStock || 0}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Badge 
                  variant={item.isActive ? "default" : "secondary"}
                  className={cn("text-[10px] uppercase font-bold", item.isActive && "bg-emerald-500 hover:bg-emerald-600")}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}

          {variants.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm italic">
                No variants generated yet. Use the generator above to start.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}