"use client"

import { useEffect, useMemo } from "react"
import { useForm, useFieldArray, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Trash2, Calculator, Package, Receipt } from "lucide-react"

import { CustomerSelectField } from "@/features/customers"
import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { FormFooter } from "@/components/forms/form-footer"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Button } from "@/components/ui/button"

import { quotationSchema, QuotationFormValues, Quotation } from "../quotations.schema"
import { useCreateQuotation, useUpdateQuotation } from "../quotations.api"
import { DEFAULT_TAX_RATE } from "../../sales/sales.constants"
import { ItemSelectField } from "@/features/items"

interface QuotationFormProps {
    initialData?: Quotation | null
    onSuccess: () => void
}

export function QuotationForm({ initialData, onSuccess }: QuotationFormProps) {
    const { mutate: createQuote, isPending: isCreating } = useCreateQuotation()
    const { mutate: updateQuote, isPending: isUpdating } = useUpdateQuotation()

    const form = useForm<QuotationFormValues>({
        resolver: zodResolver(quotationSchema),
        defaultValues: {
            customerId: initialData?.customerId || "",
            items: initialData?.items || [],
            subtotal: initialData?.subtotal || 0,
            totalTax: initialData?.totalTax || 0,
            totalDiscount: initialData?.totalDiscount || 0,
            grandTotal: initialData?.grandTotal || 0,
            validUntil: initialData?.validUntil ? new Date(initialData.validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            notes: initialData?.notes || "",
            status: initialData?.status || "DRAFT"
        }
    })

    const { control, watch, setValue, handleSubmit } = form

    // Field Array for Dynamic Items
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    })

    // Watch items to calculate totals in real-time
    const watchedItems = watch("items")
    const totalDiscount = watch("totalDiscount")

    useEffect(() => {
        const subtotal = watchedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        const tax = subtotal * DEFAULT_TAX_RATE
        const grandTotal = subtotal + tax - totalDiscount

        setValue("subtotal", subtotal)
        setValue("totalTax", tax)
        setValue("grandTotal", grandTotal)
    }, [watchedItems, totalDiscount, setValue])

    const onSubmit = (data: QuotationFormValues) => {
        const action = initialData ? updateQuote : createQuote
        // @ts-ignore
        action(initialData ? { id: initialData.id, data } : data, {
            onSuccess: () => {
                toast.success(`Quotation ${initialData ? "updated" : "created"} successfully`)
                onSuccess()
            }
        })
    }

    return (
        <FormProvider {...form}>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full bg-white">
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">

                        {/* 1. Basic Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-4">
                                <CustomerSelectField name="customerId" control={control} required label="Select Customer" />
                                <div className="grid grid-cols-2 gap-4">
                                    <DatePickerField name="validUntil" control={control} label="Valid Until" required />
                                    <TextField name="totalDiscount" control={control} label="Global Discount" type="number" />
                                </div>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col justify-center items-center shadow-inner">
                                <Calculator className="h-5 w-5 text-blue-400 mb-2" />
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Grand Total Estimate</span>
                                <h2 className="text-4xl font-black text-blue-600">৳{watch("grandTotal").toLocaleString()}</h2>
                            </div>
                        </div>

                        {/* 2. Items Management Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Package className="h-4 w-4" /> Line Items & Services
                                </h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="bg-slate-900 h-8 text-[10px] font-bold"
                                    onClick={() => append({ productId: "", name: "", price: 0, quantity: 1, subtotal: 0, type: "PRODUCT", tax: 0, discount: 0 })}
                                >
                                    <Plus className="h-3 w-3 mr-1" /> ADD ROW
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-3 rounded-xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                                        <div className="col-span-5">
                                            <ItemSelectField
                                                control={control}
                                                name={`items.${index}.productId`} // ID সেভ হবে
                                                label={index === 0 ? "Search Item / Service" : ""}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <TextField
                                                control={control}
                                                name={`items.${index}.price`}
                                                label={index === 0 ? "Price" : ""}
                                                type="number"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <TextField
                                                control={control}
                                                name={`items.${index}.quantity`}
                                                label={index === 0 ? "Qty" : ""}
                                                type="number"
                                            />
                                        </div>
                                        <div className="col-span-2 text-right px-2 pb-3">
                                            <span className="text-[10px] block text-slate-400 font-bold uppercase mb-1">Subtotal</span>
                                            <span className="text-xs font-black text-slate-700">
                                                ৳{(watch(`items.${index}.price`) * watch(`items.${index}.quantity`)).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="col-span-1 pb-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-300 hover:text-red-500 h-9 w-9"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {fields.length === 0 && (
                                    <div className="py-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-400">
                                        <Receipt className="h-10 w-10 mb-2 opacity-10" />
                                        <p className="text-xs font-medium">No items added to this quotation</p>
                                        <Button
                                            type="button"
                                            variant="link"
                                            className="text-blue-500 font-bold text-xs mt-1"
                                            onClick={() => append({ productId: "", name: "", price: 0, quantity: 1, subtotal: 0, type: "PRODUCT", tax: 0, discount: 0 })}
                                        >
                                            Click here to add your first item
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Footer Notes */}
                        <div className="pt-4">
                            <TextareaField name="notes" control={control} label="Terms & Conditions / Special Notes" placeholder="e.g. Parts warranty for 6 months..." />
                        </div>
                    </div>

                    <FormFooter
                        isPending={isCreating || isUpdating}
                        isEditMode={!!initialData}
                        onCancel={onSuccess}
                        className="p-6 bg-slate-50 border-t"
                    />
                </form>
            </Form>
        </FormProvider>
    )
}