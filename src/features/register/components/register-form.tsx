"use client"

import { useForm, FormProvider, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Wallet, Banknote, CreditCard, AlertCircle } from "lucide-react"

import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { FormFooter } from "@/components/forms/form-footer"
import { Form } from "@/components/ui/form"

import { registerSchema, RegisterFormValues, RegisterLog } from "../register.schema"
import { useCreateRegister, useUpdateRegister } from "../register.api"
import { REGISTER_STATUS } from "../register.constants"

interface RegisterFormProps {
  initialData?: RegisterLog | null
  onSuccess: () => void
  isViewMode?: boolean
}

export function RegisterForm({ initialData, onSuccess, isViewMode }: RegisterFormProps) {
  const isClosing = initialData?.status === REGISTER_STATUS.OPEN && !isViewMode
  const { mutate: createRegister, isPending: isCreating } = useCreateRegister()
  const { mutate: updateRegister, isPending: isUpdating } = useUpdateRegister()

  const form = useForm<RegisterFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      openedAt: initialData?.openedAt || new Date().toISOString(),
      openedBy: initialData?.openedBy || "current-user",
      openingBalance: initialData?.openingBalance || 0,
      actualBalance: initialData?.actualBalance || 0,
      notes: initialData?.notes || "",
      status: initialData?.status || REGISTER_STATUS.OPEN,
      totalCashSales: initialData?.totalCashSales || 0,
      totalCardSales: initialData?.totalCardSales || 0,
      totalDigitalSales: initialData?.totalDigitalSales || 0,
    }
  })

  const totalCashSales = useWatch({ control: form.control, name: "totalCashSales" })
  const totalCardSales = useWatch({ control: form.control, name: "totalCardSales" })
  const totalDigitalSales = useWatch({ control: form.control, name: "totalDigitalSales" })
  const openingBalance = useWatch({ control: form.control, name: "openingBalance" })

  const onSubmit = (data: RegisterFormValues) => {
    if (isClosing) {
      // Close Register Logic
      const finalData = { ...data, status: REGISTER_STATUS.CLOSED, closedAt: new Date().toISOString() }
      updateRegister({ id: initialData.id, data: finalData }, {
        onSuccess: () => {
          toast.success("Register closed and reconciled successfully")
          onSuccess()
        }
      })
    } else {
      // Open Register Logic
      createRegister(data, {
        onSuccess: () => {
          toast.success("Register opened for the new session")
          onSuccess()
        }
      })
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="flex flex-col h-full bg-background">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Summary Cards during Close/View */}
            {(isClosing || isViewMode) && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-muted/50 p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 mb-1">
                    <Banknote className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Cash Sales</span>
                  </div>
                  <p className="text-xl font-black text-foreground">৳{totalCashSales.toLocaleString()}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Card/Digital</span>
                  </div>
                  <p className="text-xl font-black text-foreground">৳{(totalCardSales + totalDigitalSales).toLocaleString()}</p>
                </div>
                <div className="bg-foreground p-4 rounded-xl text-background">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Wallet className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Expected Total</span>
                  </div>
                  <p className="text-xl font-black">৳{(openingBalance + totalCashSales).toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <TextField 
                name="openingBalance" 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={form.control as any}
                label="Opening Cash (Drawer Start)" 
                type="number" 
                disabled={!!initialData}
              />

              {isClosing && (
                <TextField 
                  name="actualBalance" 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  control={form.control as any}
                  label="Actual Cash in Hand (Counted)" 
                  type="number" 
                  required
                />
              )}

              <TextareaField 
                name="notes" 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={form.control as any}
                label="Session Notes" 
                placeholder="Any cash shortages or observations..."
                disabled={isViewMode}
              />
            </div>

            {!initialData && (
              <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-[11px] text-primary font-medium leading-relaxed">
                  Opening the register will allow you to start processing sales in the POS Terminal. Ensure the starting cash matches the physical drawer.
                </p>
              </div>
            )}
          </div>

          {!isViewMode && (
            <FormFooter 
              isPending={isCreating || isUpdating} 
              isEditMode={!!initialData} 
              saveLabel={isClosing ? "Close Register & Reconcile" : "Open Register"}
              onCancel={onSuccess} 
            />
          )}
        </form>
      </Form>
    </FormProvider>
  )
}