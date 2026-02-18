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

interface ResourceActionsProps<T extends { id: string; isActive?: boolean | null }> {
  resource: T
  resourceName: string // e.g., "Customer", "Brand"
  resourceTitle: string // The display name/title of the resource, e.g., resource.name or resource.title
  baseEditHref?: string // e.g., "/dashboard/system/customers"
  onView?: (resource: T) => void
  onEdit?: (resource: T) => void
  deleteMutation: UseMutationResult<any, Error, string, unknown>
  updateMutation?: UseMutationResult<any, Error, { id: string; data: Partial<T> }, unknown>
}

export function ResourceActions<T extends { id: string; isActive?: boolean | null }>({
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
    const newStatus = !resource.isActive
    updateResource(
      { id: resource.id, data: { isActive: newStatus } as Partial<T> },
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

  const canUpdateStatus = updateResource && typeof resource.isActive === "boolean"
  const canView = !!onView
  const canEdit = !!onEdit || !!baseEditHref
  const newStatus = !resource.isActive

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(resource.id)
                toast.info("ID copied to clipboard")
              }}
            >
              <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Copy ID</span>
            </DropdownMenuItem>
            {canView && (
              <DropdownMenuItem onClick={() => onView(resource)}>
                <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> <span>View</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {canUpdateStatus && (
              <DropdownMenuItem onClick={() => setStatusChangeOpen(true)} className="group">
                {newStatus ? (
                  <CheckCircle className="mr-2 h-4 w-4 text-muted-foreground group-data-[highlighted]:text-green-600" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4 text-muted-foreground group-data-[highlighted]:text-yellow-600" />
                )}
                <span>{newStatus ? "Activate" : "Deactivate"}</span>
              </DropdownMenuItem>
            )}
            {canEdit &&
              (onEdit ? (
                <DropdownMenuItem onClick={() => onEdit(resource)}>
                  <Pencil className="mr-2 h-4 w-4 text-muted-foreground" /> <span>Edit</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href={`${baseEditHref!}/${resource.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4 text-muted-foreground" /> <span>Edit</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="group">
              <Trash className="mr-2 h-4 w-4 text-muted-foreground group-data-[highlighted]:text-red-600" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${resourceName}`}
        description={`Are you sure you want to delete "${resourceTitle}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />

      {canUpdateStatus && (
        <ConfirmDialog
          open={isStatusChangeOpen}
          onOpenChange={setStatusChangeOpen}
          title={`${newStatus ? "Activate" : "Deactivate"} ${resourceName}`}
          description={`Are you sure you want to ${newStatus ? "activate" : "deactivate"} "${resourceTitle}"?`}
          onConfirm={handleStatusChange}
          isLoading={isUpdating}
          variant={newStatus ? "default" : "destructive"}
        />
      )}
    </>
  )
}