"use client"

import { useState } from "react"
import Link from "next/link"
import { UseMutationResult } from "@tanstack/react-query"
import { CheckCircle, Copy, Eye, MoreHorizontal, Pencil, Trash, XCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

/**
 * We define a specific type for the mutation payload to avoid 'any'.
 * Record<string, unknown> is the ESLint-friendly way to say "an object with any keys".
 */
interface UpdatePayload {
  id: string;
  data: Record<string, unknown>;
}

interface ResourceActionsProps<T extends { id: string }> {
  resource: T
  resourceName: string 
  resourceTitle: string 
  baseEditHref?: string 
  onView?: (resource: T) => void
  onEdit?: (resource: T) => void
  
  // Replaced 'any' with 'unknown' for results
  deleteMutation: UseMutationResult<unknown, Error, string, unknown>
  
  // Replaced 'any' with UpdatePayload
  updateMutation?: UseMutationResult<unknown, Error, UpdatePayload, unknown>
}

export function ResourceActions<T extends { id: string }>({
  resource,
  resourceName,
  resourceTitle,
  baseEditHref,
  onView,
  onEdit,
  deleteMutation,
  updateMutation,
}: ResourceActionsProps<T>) {
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [isStatusChangeOpen, setStatusChangeOpen] = useState(false)

  const { mutate: deleteResource, isPending: isDeleting } = deleteMutation
  const { mutate: updateResource, isPending: isUpdating } = updateMutation || {}

  const resourceAsRecord = resource as Record<string, unknown>;
  const hasActiveField = typeof resourceAsRecord.isActive === "boolean";
  const currentIsActive = !!resourceAsRecord.isActive;
  const newStatus = !currentIsActive;

  const handleDelete = () => {
    deleteResource(resource.id, {
      onSuccess: () => {
        toast.success(`${resourceName} deleted successfully`)
        setDeleteOpen(false)
      },
      onError: (error) => {
        toast.error(`Failed to delete ${resourceName}: ${error.message}`)
        setDeleteOpen(false)
      },
    })
  }

  const handleStatusChange = () => {
    if (!updateResource) return
    
    // Completely type-safe call
    updateResource(
      { 
        id: resource.id, 
        data: { isActive: newStatus } 
      },
      {
        onSuccess: () => {
          toast.success(`${resourceName} status updated successfully`)
          setStatusChangeOpen(false)
        },
        onError: (error) => {
          toast.error(`Failed to update ${resourceName} status: ${error.message}`)
          setStatusChangeOpen(false)
        },
      }
    )
  }

  const canUpdateStatus = !!updateResource && hasActiveField
  const canView = !!onView
  const canEdit = !!onEdit || !!baseEditHref

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 transition-colors text-slate-500">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent align="end" className="w-48 p-1 shadow-xl border-slate-200">
            <DropdownMenuItem
              className="cursor-pointer focus:bg-slate-50"
              onClick={() => {
                navigator.clipboard.writeText(resource.id)
                toast.info("ID copied to clipboard")
              }}
            >
              <Copy className="mr-2 h-4 w-4 text-slate-400" />
              <span className="text-slate-600 font-medium">Copy ID</span>
            </DropdownMenuItem>
            
            {canView && (
              <DropdownMenuItem className="cursor-pointer focus:bg-slate-50" onClick={() => onView(resource)}>
                <Eye className="mr-2 h-4 w-4 text-slate-400" /> 
                <span className="text-slate-600 font-medium">View Details</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-slate-100" />

            {canUpdateStatus && (
              <DropdownMenuItem onClick={() => setStatusChangeOpen(true)} className="group cursor-pointer focus:bg-slate-50">
                {newStatus ? (
                  <CheckCircle className="mr-2 h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                )}
                <span className="text-slate-600 font-medium">{newStatus ? "Set Active" : "Set Inactive"}</span>
              </DropdownMenuItem>
            )}

            {canEdit &&
              (onEdit ? (
                <DropdownMenuItem className="cursor-pointer focus:bg-slate-50" onClick={() => onEdit(resource)}>
                  <Pencil className="mr-2 h-4 w-4 text-slate-400" /> 
                  <span className="text-slate-600 font-medium">Edit Record</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-50">
                  <Link href={`${baseEditHref!}/${resource.id}/edit`} className="flex w-full items-center">
                    <Pencil className="mr-2 h-4 w-4 text-slate-400" /> 
                    <span className="text-slate-600 font-medium">Edit Record</span>
                  </Link>
                </DropdownMenuItem>
              ))}

            <DropdownMenuSeparator className="bg-slate-100" />
            
            <DropdownMenuItem 
              onClick={() => setDeleteOpen(true)} 
              className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
            >
              <Trash className="mr-2 h-4 w-4 opacity-70" />
              <span className="font-semibold">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${resourceName}`}
        description={`Confirm deletion of "${resourceTitle}"? This cannot be reversed.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />

      {canUpdateStatus && (
        <ConfirmDialog
          open={isStatusChangeOpen}
          onOpenChange={setStatusChangeOpen}
          title={`${newStatus ? "Activate" : "Deactivate"} ${resourceName}`}
          description={`Change status of "${resourceTitle}" to ${newStatus ? "Active" : "Inactive"}?`}
          onConfirm={handleStatusChange}
          isLoading={isUpdating}
          variant={newStatus ? "default" : "destructive"}
        />
      )}
    </>
  )
}