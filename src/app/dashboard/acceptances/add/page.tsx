"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"

import { formSchema, type FormData as AcceptanceFormData } from "@/features/acceptances/acceptance.schema"
import { useCreateAcceptance } from "@/features/acceptances/acceptances.api"
import { CustomerDeviceFields } from "@/features/acceptances/components/add/CustomerDeviceFields"
import { TechnicalFinancialFields } from "@/features/acceptances/components/add/TechnicalFinancialFields"
import { StatusFields } from "@/features/acceptances/components/add/StatusFields"

export default function AddAcceptancePage() {
  const router = useRouter()
  const [photoPreviews, setPhotoPreviews] = useState<{ [key: string]: string }>({})
  const { mutateAsync: createAcceptance, isPending } = useCreateAcceptance()

  const form = useForm<AcceptanceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: "",
      estimated_price: "",
      brand_id: "",
      model_id: "",
      color: "",
      accessories: "",
      device_type: "",
      current_status: "IN REPAIR",
      defect_description: "",
      notes: "",
      created_date: new Date(),
      imei: "",
      secondary_imei: "",
      technician_id: "",
      warranty: "",
      replacement_device_id: "",
      dealer: "",
      price_offered: "",
      reserved_notes: "",
      important_information: "No",
      pin_unlock: "No",
      pin_unlock_number: "",
      urgent: "No",
      urgent_date: undefined,
      quote: "No",
    },
  })



  const handlePhotoUpload = (fieldName: string, file: File | null) => {
    if (file) {
      const reader = new FileReader()
        reader.onload = (e: ProgressEvent<FileReader>) => {
        setPhotoPreviews(prev => ({
          ...prev,
          [fieldName]: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
      form.setValue(fieldName as keyof AcceptanceFormData, file)
    } else {
      setPhotoPreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[fieldName];
          return newPreviews;
        });
        form.setValue(fieldName as keyof AcceptanceFormData, undefined);
    }
  }

  const removePhoto = (fieldName: string) => {
    setPhotoPreviews((prev: { [key: string]: string }) => {
      const newPreviews = { ...prev }
      delete newPreviews[fieldName]
      return newPreviews
    })
  }

  const onSubmit = async (data: AcceptanceFormData) => {
    try {
      // The improved api-factory now handles Date objects and File objects correctly.
      // We can pass the form data directly to the mutation.
      await createAcceptance(acceptance)
      toast.success("Acceptance created successfully.")
      router.push("/dashboard/acceptances")
    } catch (error) {
      toast.error(`Failed to create acceptance: ${(error as Error).message}`)
      console.error("Error creating acceptance:", error)
    }
  }



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-600">Add Acceptance</h1>
      </div>

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CustomerDeviceFields />
              <TechnicalFinancialFields />
              <StatusFields
                photoPreviews={photoPreviews}
                handlePhotoUpload={handlePhotoUpload}
                removePhoto={removePhoto}
              />
            </div>

            {/* Submit Section */}
            <div className="flex justify-start">
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-8" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}