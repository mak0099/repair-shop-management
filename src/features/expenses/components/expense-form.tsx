"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FieldErrors, Resolver } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, Save, X, ReceiptText, Banknote, ShieldCheck } from "lucide-react"

import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { ImageUploadField } from "@/components/forms/image-upload-field"
import { MasterSettingSelectField } from "@/features/master-settings"
import { SelectField } from "@/components/forms/select-field"

import { expenseSchema, type ExpenseFormValues, type Expense } from "../expense.schema"
import { useCreateExpense, useUpdateExpense } from "../expense.api"
import { EXPENSES_BASE_HREF } from "@/config/paths"

const PAYMENT_METHODS = [
  { label: "Cash", value: "CASH" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Credit/Debit Card", value: "CARD" },
  { label: "Mobile Banking (Bkash/Nagad)", value: "MOBILE_BANKING" },
]

interface ExpenseFormProps {
  initialData?: Expense | null
  onSuccess?: (data: Expense) => void
  isViewMode?: boolean
}

export function ExpenseForm({ 
  initialData, 
  onSuccess, 
  isViewMode: initialIsViewMode = false 
}: ExpenseFormProps) {
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

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as unknown as Resolver<ExpenseFormValues>,
    defaultValues: initialData ? {
        ...initialData,
        date: new Date(initialData.date),
        attachmentUrl: initialData.attachmentUrl || null,
    } : {
      title: "",
      amount: 0,
      date: new Date(),
      categoryId: "",
      branchId: "main-branch",
      paymentMethod: "CASH",
      referenceNo: "",
      vendorName: "",
      notes: "",
      attachmentUrl: null,
    },
  })

  const onFormError = (errors: FieldErrors<ExpenseFormValues>) => {
    console.error("Form Validation Errors:", errors)
    toast.error("Please fill in all required fields correctly.")
  }

  function onSubmit(data: ExpenseFormValues) {
    const callbacks = {
      onSuccess: (res: Expense) => {
        toast.success(`Expense ${isEditMode ? "updated" : "created"} successfully`)
        queryClient.invalidateQueries({ queryKey: ["expenses"] })
        onSuccess ? onSuccess(res) : router.push(EXPENSES_BASE_HREF)
      },
      onError: (error: Error) => toast.error("Action failed: " + error.message),
    }

    if (isEditMode && initialData?.id) {
      updateExpense({ id: initialData.id, data }, callbacks)
    } else {
      createExpense(data, callbacks)
    }
  }

  const handleClose = () => {
    onSuccess ? onSuccess(initialData as Expense) : router.push(EXPENSES_BASE_HREF)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="relative p-6 space-y-8 max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border">
        
        {/* Context Header for View/Edit Modes */}
        {isViewMode && (
          <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 text-blue-700">
               <ShieldCheck className="w-5 h-5" />
               <span className="font-bold text-xs tracking-widest uppercase">ReadOnly Record</span>
            </div>
            <Button size="sm" type="button" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-100" onClick={() => setMode("edit")}>
              Switch to Edit
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-slate-400 mb-1">
                 <ReceiptText className="w-4 h-4" />
                 <span className="text-[10px] font-bold uppercase tracking-tighter">Basic Information</span>
               </div>
               <TextField control={form.control} name="title" label="Title / Description" required readOnly={isViewMode} placeholder="e.g., Office Electricity Bill" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField control={form.control} name="amount" label="Transaction Amount" type="number" required readOnly={isViewMode} />
              <DatePickerField control={form.control} name="date" label="Billing Date" required readOnly={isViewMode} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MasterSettingSelectField
                control={form.control}
                name="categoryId"
                type="EXPENSE_CATEGORY"
                label="Expense Category"
                required
                disabled={isViewMode}
              />
              <SelectField 
                control={form.control} 
                name="paymentMethod" 
                label="Payment Method" 
                placeholder="Select method"
                options={PAYMENT_METHODS} 
                readOnly={isViewMode} 
              />
            </div>

            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField control={form.control} name="vendorName" label="Paid To (Vendor)" readOnly={isViewMode} placeholder="Supplier or Shop Name" />
                <TextField control={form.control} name="referenceNo" label="Ref / Invoice No." readOnly={isViewMode} placeholder="#INV-12345" />
            </div>
          </div>

          {/* Sidebar Area: Notes & Attachments */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                 <Banknote className="w-4 h-4" />
                 <span className="text-[10px] font-bold uppercase tracking-tighter">Documentation</span>
               </div>
              <TextareaField 
                control={form.control} 
                name="notes" 
                label="Additional Internal Notes" 
                readOnly={isViewMode} 
                className="min-h-[120px] bg-slate-50/20"
              />
            </div>
            
            <div className="p-5 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                <ImageUploadField 
                  control={form.control} 
                  name="attachmentUrl" 
                  label="Expense Receipt Attachment" 
                  initialImage={initialData?.attachmentUrl} 
                  isViewMode={isViewMode} 
                />
                <p className="text-[9px] text-slate-400 mt-3 text-center font-medium">ACCEPTED: JPG, PNG, WEBP (MAX 5MB)</p>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-end items-center gap-4 pt-8 border-t">
          <Button 
            variant="ghost" 
            type="button" 
            className="text-slate-500 hover:bg-slate-50"
            onClick={handleClose}
          >
            <X className="mr-2 h-4 w-4" />
            {isViewMode ? "Close Panel" : "Discard Changes"}
          </Button>

          {!isViewMode && (
            <Button 
              type="submit" 
              disabled={isPending} 
              className="px-8 bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200 transition-all active:scale-95"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? "Update Record" : "Save Expense"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}