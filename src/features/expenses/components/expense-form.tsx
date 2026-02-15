"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FieldErrors } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { z } from "zod"

import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { ImageUploadField } from "@/components/forms/image-upload-field"
import { MasterSettingComboboxField } from "@/features/master-settings"
// import { BranchComboboxField } from "@/features/branches"

import { expenseSchema, ExpenseFormValues, Expense } from "../expense.schema"
import { useCreateExpense, useUpdateExpense } from "../expense.api"

const EXPENSES_BASE_HREF = "/dashboard/expenses"

const expenseFormSchema = expenseSchema.extend({
  attachment_url: z.any().optional(),
})

type ExpenseFormSchemaValues = z.infer<typeof expenseFormSchema>

interface ExpenseFormProps {
  initialData?: Expense | null
  onSuccess?: (data: Expense) => void
  isViewMode?: boolean
}

export function ExpenseForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: ExpenseFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { mutate: createExpense, isPending: isCreating } = useCreateExpense()
  const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense()

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isViewMode = mode === "view"

  const isPending = isCreating || isUpdating
  const isEditMode = !!initialData && mode !== "create"

  const form = useForm<ExpenseFormSchemaValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initialData ? {
        ...initialData,
        date: new Date(initialData.date),
        attachment_url: undefined, // Handle file upload separately
    } : {
      title: "",
      amount: 0,
      date: new Date(),
      category_id: "",
      branch_id: "",
      notes: "",
      attachment_url: null,
    },
  })

  const onFormError = (errors: FieldErrors<ExpenseFormSchemaValues>) => {
    console.error("Expense form validation errors:", errors)
    toast.error("Please fill all required fields correctly.")
  }

  const handleCancel = () => {
    if (onSuccess) {
      // In view mode, onSuccess is used to close the modal.
      // We pass initialData to ensure any parent state is not cleared.
      onSuccess(initialData as Expense)
    } else {
      router.push(EXPENSES_BASE_HREF)
    }
  }

  function onSubmit(data: ExpenseFormSchemaValues) {
    if (isEditMode && initialData) {
      updateExpense(
        { id: initialData.id, data },
        {
          onSuccess: (updatedExpense: Expense) => {
            toast.success("Expense updated successfully")
            queryClient.invalidateQueries({ queryKey: ["expenses"] })
            if (onSuccess) {
              onSuccess(updatedExpense)
            } else {
              router.push(EXPENSES_BASE_HREF)
            }
          },
          onError: (error) => {
            toast.error("Failed to update expense: " + error.message)
          },
        }
      )
    } else {
      createExpense(data, {
        onSuccess: (newExpense) => {
          toast.success("Expense created successfully")
          queryClient.invalidateQueries({ queryKey: ["expenses"] })
          if (onSuccess) {
            onSuccess(newExpense)
          } else {
            router.push(EXPENSES_BASE_HREF)
          }
        },
        onError: (error) => {
          toast.error("Failed to create expense: " + error.message)
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="relative p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {isViewMode && (
          <div className="absolute top-4 right-4 z-10">
            <Button size="sm" type="button" onClick={(e) => { e.preventDefault(); setMode("edit"); }}>
              Edit
            </Button>
          </div>
        )}
        <div className={isViewMode ? "pt-10 grid grid-cols-1 md:grid-cols-2 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
          <TextField control={form.control} name="title" label="Title" required readOnly={isViewMode} placeholder="e.g., Office Supplies" />
          <TextField control={form.control} name="amount" label="Amount" type="number" required readOnly={isViewMode} placeholder="e.g., 120.50" />
          <DatePickerField
            control={form.control}
            name="date"
            label="Expense Date"
            required
            disabled={isViewMode}
          />
          <MasterSettingComboboxField
            control={form.control}
            name="category_id"
            type="EXPENSE_CAT"
            label="Category"
            placeholder="Select a category"
            required
            disabled={isViewMode}
          />
          {/* <BranchComboboxField
          control={form.control}
          name="branch_id"
          required
        /> */}
          <div className="md:col-span-2">
            <TextareaField control={form.control} name="notes" label="Notes" readOnly={isViewMode} placeholder="Add any relevant notes here..." />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField control={form.control} name="attachment_url" label="Attachment (Receipt)" initialImage={initialData?.attachment_url} />
          </div>
        </div>
        <div className="md:col-span-2 flex justify-end gap-2 pt-4">
          {isViewMode ? (
            <Button variant="outline" type="button" onClick={handleCancel}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Save Expense"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  )
}
