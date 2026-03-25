"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

interface ModalProps {
  title?: string
  description?: string
  hideHeader?: boolean
  renderHeader?: () => React.ReactNode
  isOpen: boolean
  onClose: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export function Modal({ title, description, hideHeader, renderHeader, isOpen, onClose, children, className }: ModalProps) {
  return (
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
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
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
  )
}