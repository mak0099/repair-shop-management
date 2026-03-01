"use client"

import { Loader2, Save, RotateCcw, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FormFooterProps {
  isPending?: boolean
  isEditMode?: boolean
  isViewMode?: boolean
  onCancel?: () => void
  onEdit?: () => void
  onReset?: () => void
  saveLabel?: string
  cancelLabel?: string
  className?: string
}

export function FormFooter({
  isPending = false,
  isEditMode = false,
  isViewMode = false,
  onCancel,
  onEdit,
  onReset,
  saveLabel,
  cancelLabel,
  className,
}: FormFooterProps) {
  const defaultSaveLabel = isEditMode ? "Save Changes" : "Save"
  const defaultCancelLabel = isViewMode ? "Close" : "Cancel"

  return (
    <div className={cn("flex items-center justify-end gap-3 pt-6 border-t mt-auto", className)}>
      {isViewMode ? (
        <>
          {onCancel && (
            <Button variant="outline" type="button" onClick={onCancel}>
              {cancelLabel || "Close"}
            </Button>
          )}
          {onEdit && (
            <Button variant="default" type="button" onClick={onEdit}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
        </>
      ) : (
        <>
          {onReset && (
            <Button variant="ghost" type="button" onClick={onReset} className="text-muted-foreground hover:text-foreground mr-auto">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          )}
          
          {onCancel && (
            <Button variant="ghost" type="button" onClick={onCancel}>
              {cancelLabel || "Cancel"}
            </Button>
          )}
          
          <Button type="submit" disabled={isPending} className="min-w-[120px]">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saveLabel || defaultSaveLabel}
          </Button>
        </>
      )}
    </div>
  )
}