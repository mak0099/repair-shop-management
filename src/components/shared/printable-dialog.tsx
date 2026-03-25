"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface PrintableDialogProps {
  title?: string
  description?: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
  printableElementId: string
  icon?: React.ReactNode
  headerClassName?: string
}

/**
 * Dialog component with built-in print support.
 * 
 * Usage:
 * <PrintableDialog 
 *   isOpen={showReceipt} 
 *   onOpenChange={setShowReceipt}
 *   title="Receipt"
 *   printableElementId="printable-receipt"
 * >
 *   <div id="printable-receipt">
 *     ... content to print
 *   </div>
 * </PrintableDialog>
 */
export function PrintableDialog({
  title,
  description,
  isOpen,
  onOpenChange,
  children,
  className,
  printableElementId,
  icon,
  headerClassName,
}: PrintableDialogProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #${printableElementId}, #${printableElementId} * {
            visibility: visible;
          }
          #${printableElementId} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 15px;
            font-size: 13px;
          }
          
          #${printableElementId} h1 {
            font-size: 18px;
            margin: 6px 0;
          }
          
          #${printableElementId} h2 {
            font-size: 14px;
            margin: 4px 0;
          }
          
          #${printableElementId} p {
            margin: 2px 0;
          }
          
          #${printableElementId} table {
            font-size: 12px;
            margin: 4px 0;
          }
        }
      `}</style>

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className={className}>
          {/* DialogTitle for accessibility - hidden if custom header is shown */}
          {title ? (
            <VisuallyHidden>
              <DialogTitle>{title}</DialogTitle>
            </VisuallyHidden>
          ) : (
            <VisuallyHidden>
              <DialogTitle>Dialog</DialogTitle>
            </VisuallyHidden>
          )}

          {/* Custom header with icon and print button */}
          {title && (
            <div className={headerClassName || "flex justify-between items-center p-4 border-b print:hidden bg-muted/50 pr-12 flex-shrink-0"}>
              <div className="flex items-center gap-2">
                {icon}
                <span className="text-sm font-black uppercase tracking-widest">{title}</span>
              </div>
              <Button
                onClick={handlePrint}
                size="sm"
                className="gap-2 h-8 text-[11px] font-bold"
                title="Print document"
              >
                <Printer className="h-3.5 w-3.5" /> PRINT
              </Button>
            </div>
          )}

          {description && (
            <DialogDescription className="text-xs text-muted-foreground">{description}</DialogDescription>
          )}

          {children}
        </DialogContent>
      </Dialog>
    </>
  )
}
