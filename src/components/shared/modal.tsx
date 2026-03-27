"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface PrintConfig {
  enabled?: boolean
  elementId: string
}

interface ModalProps {
  title?: string
  description?: string
  hideHeader?: boolean
  renderHeader?: () => React.ReactNode
  isOpen: boolean
  onClose: (open: boolean) => void
  children: React.ReactNode
  className?: string
  printConfig?: PrintConfig
}

export function Modal({ title, description, hideHeader, renderHeader, isOpen, onClose, children, className, printConfig }: ModalProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {printConfig?.enabled && (
        <style jsx global>{`
          @page {
            size: A4;
            margin: 0;
          }
          @media print {
            body * {
              visibility: hidden;
            }
            #${printConfig.elementId}, #${printConfig.elementId} * {
              visibility: visible;
            }
            #${printConfig.elementId} {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 15px;
              font-size: 13px;
            }
            
            #${printConfig.elementId} h1 {
              font-size: 18px;
              margin: 6px 0;
            }
            
            #${printConfig.elementId} h2 {
              font-size: 14px;
              margin: 4px 0;
            }
            
            #${printConfig.elementId} p {
              margin: 2px 0;
            }
            
            #${printConfig.elementId} table {
              font-size: 12px;
              margin: 4px 0;
            }
          }
        `}</style>
      )}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={className}>
          {/* If hideHeader is true, wrap the title with VisuallyHidden for accessibility */}
          {hideHeader && title && !renderHeader && (
            <VisuallyHidden>
              <DialogTitle>{title}</DialogTitle>
            </VisuallyHidden>
          )}
          
          {renderHeader && renderHeader()}
          
          {!hideHeader && title && (
            <DialogHeader>
              <div className="flex justify-between items-center w-full">
                <div className="flex-1">
                  <DialogTitle>{title}</DialogTitle>
                  {description && (
                    <DialogDescription>{description}</DialogDescription>
                  )}
                </div>
                {printConfig?.enabled && (
                  <Button 
                    onClick={handlePrint} 
                    size="sm" 
                    className="gap-2 h-8 text-[11px] font-bold ml-4"
                    title="Print document"
                  >
                    <Printer className="h-3.5 w-3.5" /> PRINT
                  </Button>
                )}
              </div>
            </DialogHeader>
          )}
          
          {/* Fallback: if no title and no renderHeader, still need a title for accessibility */}
          {!title && !renderHeader && (
            <VisuallyHidden>
              <DialogTitle>Dialog</DialogTitle>
            </VisuallyHidden>
          )}
          
          {children}
        </DialogContent>
      </Dialog>
    </>
  )
}