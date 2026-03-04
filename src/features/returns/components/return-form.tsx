"use client"

import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Search, RotateCcw, AlertCircle, Package } from "lucide-react"

import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { FormFooter } from "@/components/forms/form-footer"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"

import { returnSchema, ReturnFormValues, SaleReturn } from "../returns.schema"
import { useCreateReturn } from "../returns.api"

interface ReturnFormProps {
  initialData?: SaleReturn | null
  onSuccess: () => void
  isViewMode?: boolean
}

export function ReturnForm({ initialData, onSuccess, isViewMode }: ReturnFormProps) {
  const { mutate: createReturn, isPending } = useCreateReturn()

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      saleId: initialData?.saleId || "",
      items: initialData?.items || [],
      totalRefundAmount: initialData?.totalRefundAmount || 0,
      restockingFee: initialData?.restockingFee || 0,
      reason: initialData?.reason || "",
      status: initialData?.status || "PENDING"
    }
  })

  const onSubmit = (data: ReturnFormValues) => {
    createReturn(data, {
      onSuccess: () => {
        toast.success("Return processed successfully. Stock updated.")
        onSuccess()
      }
    })
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full bg-white">
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Invoice Search Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="relative">
                <TextField 
                  name="saleId" 
                  control={form.control} 
                  label="Original Invoice Number" 
                  placeholder="e.g. INV-12345" 
                  disabled={isViewMode || !!initialData}
                />
                {!initialData && (
                  <Button 
                    type="button" 
                    size="sm" 
                    className="absolute right-1 top-[30px] h-7 bg-blue-600 hover:bg-blue-700"
                  >
                    <Search className="h-3 w-3 mr-1" /> FETCH
                  </Button>
                )}
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <p className="text-[10px] text-amber-700 font-medium leading-tight italic">
                  Note: Processing a return will automatically add items back to stock if marked as Resalable.
                </p>
              </div>
            </div>

            {/* Refund Summary Card */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white flex justify-between items-center shadow-xl">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Refund to Customer</span>
                <h2 className="text-3xl font-black">৳{form.watch("totalRefundAmount").toLocaleString()}</h2>
              </div>
              <RotateCcw className="h-10 w-10 text-slate-700" />
            </div>

            {/* Placeholder for Return Items Table */}
            <div className="border rounded-xl overflow-hidden">
               <div className="bg-slate-100 p-3 border-b flex items-center gap-2">
                 <Package className="h-4 w-4 text-slate-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Items to Return</span>
               </div>
               <div className="p-12 text-center text-slate-400 text-xs italic">
                 Invoice items will appear here after fetching the invoice number.
               </div>
            </div>

            <TextareaField 
              name="reason" 
              control={form.control} 
              label="Reason for Return" 
              placeholder="e.g. Defective part, Customer change of mind..." 
              disabled={isViewMode}
            />
          </div>

          {!isViewMode && (
            <FormFooter 
              isPending={isPending} 
              isEditMode={!!initialData} 
              onCancel={onSuccess} 
              submitLabel="Complete Return"
              className="p-6 bg-slate-50 border-t"
            />
          )}
        </form>
      </Form>
    </FormProvider>
  )
}