import { useState } from "react"
import Link from "next/link"
import { UseMutationResult } from "@tanstack/react-query"
import { CheckCircle, MoreHorizontal, Pencil, Trash, XCircle } from "lucide-react"
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

interface ResourceActionsProps<T extends { id: string; name: string; isActive?: boolean | null }> {
  resource: T
  resourceName: string // e.g., "Customer", "Brand"
  baseEditHref: string // e.g., "/dashboard/system/customers"
  deleteMutation: UseMutationResult<any, Error, string, unknown>
  updateMutation?: UseMutationResult<any, Error, { id: string; data: Partial<T> }, unknown>
}

export function ResourceActions<T extends { id: string; name: string; isActive?: boolean | null }>({
  resource,
  resourceName,
  baseEditHref,
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(resource.id)}>
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canUpdateStatus && (
              <DropdownMenuItem onClick={() => setStatusChangeOpen(true)}>
                {newStatus ? (
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                )}
                {newStatus ? "Activate" : "Deactivate"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href={`${baseEditHref}/${resource.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => setDeleteOpen(true)}>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${resourceName}`}
        description={`Are you sure you want to delete ${resource.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />

      {canUpdateStatus && (
        <ConfirmDialog
          open={isStatusChangeOpen}
          onOpenChange={setStatusChangeOpen}
          title={`${newStatus ? "Activate" : "Deactivate"} ${resourceName}`}
          description={`Are you sure you want to ${newStatus ? "activate" : "deactivate"} ${resource.name}?`}
          onConfirm={handleStatusChange}
          isLoading={isUpdating}
          variant={newStatus ? "default" : "destructive"}
        />
      )}
    </>
  )
}