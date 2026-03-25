"use client"

import { useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Smartphone, Wrench, CreditCard, Camera } from "lucide-react"

import { Form } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CustomerSelectField } from "@/features/customers"
import { BrandSelectField } from "@/features/brands"
import { ModelSelectField } from "@/features/models"
import { UserSelectField } from "@/features/users"
import { MasterSettingSelectField } from "@/features/master-settings"
import { ImageUploadField } from "@/components/forms/image-upload-field"
import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { RadioGroupField } from "@/components/forms/radio-group-field"
import { DatePickerField } from "@/components/forms/date-picker-field"
import { ItemSelectField } from "@/features/items"

import { Acceptance } from "../acceptance.schema"
import { useCreateAcceptance } from "../acceptance.api"
import { formSchema, FormData } from "../acceptance.schema"
import { REPAIR_STATUSES } from "../acceptance.constants"
import { createOperationalLog, createTimelineLog, getIconForAction } from "../acceptance-logging"

interface AcceptanceFormProps {
  initialData?: Acceptance | null
  onSuccess?: (data: Acceptance) => void
  isViewMode?: boolean
}

export function AcceptanceForm({ initialData, onSuccess }: AcceptanceFormProps) {
  const queryClient = useQueryClient()
  const { mutate: createAcceptance, isPending } = useCreateAcceptance()
  const [activeTab, setActiveTab] = useState("general")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      brandId: "",
      modelId: "",
      imei: "",
      defectDescription: "",
      estimatedPrice: 0,
      advancePayment: 0,
      technicianId: "",
      pinUnlock: "false",
      pinUnlockNumber: "",
      urgent: "false",
      urgentDateTime: undefined,
      acceptanceDate: new Date(),
      deviceType: "Smartphone",
      currentStatus: REPAIR_STATUSES.PENDING,
      quote: "false",
      importantInformation: "false",
      color: "",
      accessories: "",
      notes: "",
      secondaryImei: "",
      loanerDeviceId: "",
      warranty: "",
      replacementDeviceId: "",
      dealer: "",
      priceOffered: 0,
      reservedNotes: "",
    }
  })

  const { control, handleSubmit, setValue, formState } = form
  const brandId = useWatch({ control, name: "brandId" })
  const pinUnlock = useWatch({ control, name: "pinUnlock" })
  const urgent = useWatch({ control, name: "urgent" })

  useEffect(() => {
    if (formState.dirtyFields.brandId) {
      setValue("modelId", "", { shouldDirty: true })
    }
  }, [brandId, setValue, formState.dirtyFields.brandId])

  const onSubmit = (data: FormData) => {
    data.totalCost = data.estimatedPrice || 0;
    data.balanceDue = (data.estimatedPrice || 0) - (data.advancePayment || 0);

    // Create initial logs for new ticket
    const operationalLog = createOperationalLog(
      "TICKET_CREATED",
      "Device acceptance ticket created by Front Desk",
      "current-user-id"
    );

    const timelineLog = createTimelineLog(
      "TICKET_CREATED",
      "Device intake initiated",
      getIconForAction("TICKET_CREATED"),
      "blue",
      "current-user-id"
    );

    data.operationalLogs = [operationalLog];
    data.timelineLogs = [timelineLog];

    createAcceptance(data, {
      onSuccess: (res) => {
        toast.success("Device received successfully! Ticket created.")
        queryClient.invalidateQueries({ queryKey: ["acceptances"] })
        onSuccess?.(res)
      },
      onError: (error) => toast.error(error.message)
    })
  }

  // Show the Tabbed Form Wizard for creation or editing
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full bg-muted/10">
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-5xl mx-auto space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1.5 bg-muted/50 border shadow-sm rounded-xl">
              <TabsTrigger value="general" className="py-2.5 text-xs font-bold rounded-lg data-[state=active]:shadow-sm"><Smartphone className="w-4 h-4 mr-2 hidden sm:block"/> Customer & Device</TabsTrigger>
              <TabsTrigger value="repair" className="py-2.5 text-xs font-bold rounded-lg data-[state=active]:shadow-sm"><Wrench className="w-4 h-4 mr-2 hidden sm:block"/> Repair Details</TabsTrigger>
              <TabsTrigger value="finance" className="py-2.5 text-xs font-bold rounded-lg data-[state=active]:shadow-sm"><CreditCard className="w-4 h-4 mr-2 hidden sm:block"/> Finance & Admin</TabsTrigger>
              <TabsTrigger value="photos" className="py-2.5 text-xs font-bold rounded-lg data-[state=active]:shadow-sm"><Camera className="w-4 h-4 mr-2 hidden sm:block"/> Photos</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-6 min-h-[420px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <CustomerSelectField name="customerId" control={control as any} required />
                  </div>
                  <BrandSelectField name="brandId" control={control as any} required />
                  <ModelSelectField name="modelId" control={control as any} brandId={brandId} required disabled={!brandId} />
                  <MasterSettingSelectField control={control as any} name="deviceType" type="DEVICE_TYPE" label="Device Type" required />
                  <MasterSettingSelectField control={control as any} name="color" type="COLOR" label="Device Color" />
                  <TextField control={control as any} name="imei" label="IMEI / Serial Number" required />
                  <TextField control={control as any} name="secondaryImei" label="Secondary IMEI (Optional)" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="repair" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-6 min-h-[420px]">
                <div className="grid grid-cols-1 gap-6">
                  <TextareaField control={control as any} name="defectDescription" label="Defect / Problem Description" required rows={3} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MasterSettingSelectField control={control as any} name="accessories" type="ACCESSORY" label="Included Accessories" />
                  <MasterSettingSelectField control={control as any} name="warranty" type="WARRANTY" label="Warranty Promised" />
                  <UserSelectField variant="technician" control={control as any} name="technicianId" label="Assign Technician (Optional)" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-muted/30 rounded-xl border border-border/60">
                  <div className="space-y-4">
                    <RadioGroupField control={control as any} name="pinUnlock" label="Device has PIN/Password?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                    {pinUnlock === "true" && <TextField control={control as any} name="pinUnlockNumber" label="PIN Code" required />}
                  </div>
                  <div className="space-y-4 md:border-l md:pl-6 border-border">
                    <RadioGroupField control={control as any} name="urgent" label="Is this Urgent?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                    {urgent === "true" && <DatePickerField control={control as any} name="urgentDateTime" label="Deadline Date & Time" required showTime />}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="finance" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-6 min-h-[420px]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-border/50 pb-6">
                  <TextField control={control as any} name="estimatedPrice" label="Estimated Cost" type="number" min={0} />
                  <TextField control={control as any} name="advancePayment" label="Advance Paid" type="number" min={0} />
                  <DatePickerField control={control as any} name="acceptanceDate" label="Acceptance Date" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border/50 pb-6">
                  <TextField control={control as any} name="loanerDeviceId" label="Loaner Phone (ID/IMEI)" placeholder="Temporary phone given..." />
                  <ItemSelectField control={control as any} name="replacementDeviceId" label="Replacement Device ID" />
                  <TextField control={control as any} name="dealer" label="Dealer Name" placeholder="B2B dealer if applicable" />
                  <TextField control={control as any} name="priceOffered" label="Buyback Price Offered" type="number" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5 p-4 bg-muted/30 rounded-xl border border-border">
                    <RadioGroupField control={control as any} name="quote" label="Needs Quote First?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                    <RadioGroupField control={control as any} name="importantInformation" label="Flag as Important?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                  </div>
                  <div className="space-y-4">
                    <TextareaField control={control as any} name="notes" label="Public Notes (Prints on Invoice)" rows={2} />
                    <TextareaField control={control as any} name="reservedNotes" label="Internal Notes (Hidden from customer)" rows={2} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="photos" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border min-h-[420px]">
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-foreground">Condition Proof Photos</h4>
                  <p className="text-xs text-muted-foreground mt-1">Upload up to 5 photos to document the device condition (scratches, dents, etc.) before taking it in.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <ImageUploadField key={num} control={control as any} name={`photo${num}` as any} label={`Photo ${num}`} layout="compact" />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="bg-background border-t border-border p-4 px-6 sticky bottom-0 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
            <Button type="button" variant="ghost" onClick={() => onSuccess?.(null as any)}>Cancel</Button>
            <div className="flex gap-3">
              {activeTab !== "photos" && (
                <Button type="button" variant="secondary" onClick={() => {
                  const tabs = ["general", "repair", "finance", "photos"];
                  setActiveTab(tabs[tabs.indexOf(activeTab) + 1]);
                }}>Next Step</Button>
              )}
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md font-bold px-6">
                {isPending ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}