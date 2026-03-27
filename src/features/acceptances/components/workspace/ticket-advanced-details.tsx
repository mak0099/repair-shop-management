"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useUpdateAcceptance } from "../../acceptance.api"
import { Acceptance, formSchema, FormData } from "../../acceptance.schema"

import { Form } from "@/components/ui/form"
import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { RadioGroupField } from "@/components/forms/radio-group-field"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { MasterSettingSelectField } from "@/features/master-settings"
import { ImageUploadField } from "@/components/forms/image-upload-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Camera, Shield, PhoneForwarded, Calendar, AlertCircle } from "lucide-react"

export function TicketAdvancedDetails({ acceptance }: { acceptance: Acceptance }) {
  const { mutate: updateTicket, isPending } = useUpdateAcceptance()
  const [isEditing, setIsEditing] = useState(false)

  // Convert booleans back to string for the radio groups to satisfy schema
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      ...acceptance,
      importantInformation: acceptance.importantInformation ? "true" : "false",
      pinUnlock: acceptance.pinUnlock ? "true" : "false",
      urgent: acceptance.urgent ? "true" : "false",
      quote: acceptance.quote ? "true" : "false",
      urgentDateTime: acceptance.urgentDateTime ? new Date(acceptance.urgentDateTime) : undefined,
      acceptanceDate: acceptance.acceptanceDate ? new Date(acceptance.acceptanceDate) : new Date(),
    } as any
  })

  const onSubmit = (data: FormData) => {
    updateTicket({ id: acceptance.id as string, data }, {
      onSuccess: () => {
        toast.success("Advanced details updated successfully")
        form.reset(data as any) // Reset dirty state
        setIsEditing(false)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-10">
        
        <div className="flex justify-between items-center bg-background p-4 rounded-xl border border-border shadow-sm">
          <div>
            <h3 className="font-bold text-foreground">Advanced Configuration</h3>
            <p className="text-xs text-muted-foreground">Manage warranty, loaner devices, internal notes, and photos.</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button type="button" variant="secondary" onClick={() => setIsEditing(true)} className="h-9 text-xs font-bold shadow-sm">
                Edit Details
              </Button>
            ) : (
              <>
                <Button type="button" variant="ghost" onClick={() => { setIsEditing(false); form.reset(); }} className="h-9 text-xs font-bold">Cancel</Button>
                <Button type="submit" disabled={isPending || !form.formState.isDirty} className="h-9 text-xs font-bold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" /> {form.formState.isDirty ? "Save Changes" : "No Changes"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-xs flex items-center gap-2 uppercase tracking-widest text-muted-foreground font-black"><Shield className="h-4 w-4 text-primary" /> Warranty & Device Specs</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <MasterSettingSelectField control={form.control as any} name="deviceType" type="DEVICE_TYPE" label="Device Type" readOnly={!isEditing} />
              <TextField control={form.control as any} name="secondaryImei" label="Secondary IMEI (Optional)" readOnly={!isEditing} />
              <MasterSettingSelectField control={form.control as any} name="warranty" type="WARRANTY" label="Warranty Status" readOnly={!isEditing} />
              <TextField control={form.control as any} name="dealer" label="Dealer Name (if applicable)" readOnly={!isEditing} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-xs flex items-center gap-2 uppercase tracking-widest text-muted-foreground font-black"><PhoneForwarded className="h-4 w-4 text-primary" /> Internal Logistics</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <DatePickerField control={form.control as any} name="acceptanceDate" label="Acceptance / Entry Date" readOnly={!isEditing} />
              <div className="flex gap-4 bg-muted/30 p-3 rounded-lg border border-border">
                <div className="flex-1"><RadioGroupField control={form.control as any} name="importantInformation" label="Flag as Important?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" readOnly={!isEditing} /></div>
                <div className="flex-1 border-l pl-4"><RadioGroupField control={form.control as any} name="quote" label="Needs Quote?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" readOnly={!isEditing} /></div>
              </div>
              <TextField control={form.control as any} name="loanerDeviceId" label="Loaner Device ID / IMEI" placeholder="Enter if a temporary phone was given" readOnly={!isEditing} />
              <TextareaField control={form.control as any} name="reservedNotes" label="Reserved Notes (Internal Use Only)" rows={3} placeholder="Tech notes that customers won't see..." readOnly={!isEditing} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border md:col-span-2">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-xs flex items-center gap-2 uppercase tracking-widest text-muted-foreground font-black"><Camera className="h-4 w-4 text-primary" /> Device Photos</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((num) => (<ImageUploadField key={num} control={form.control as any} name={`photo${num}` as any} label={`Photo ${num}`} initialImage={acceptance[`photo${num}` as keyof Acceptance] as string} layout="compact" isViewMode={!isEditing} />))}
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  )
}