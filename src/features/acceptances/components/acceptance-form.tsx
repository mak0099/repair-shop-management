"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm, useWatch, FieldValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Smartphone, Wrench, CreditCard, Camera, Receipt } from "lucide-react"
import { useCurrency } from "@/providers/currency-provider"

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
import { PrintableDialog } from "@/components/shared/printable-dialog"

import { Acceptance } from "../acceptance.schema"
import { useCreateAcceptance } from "../acceptance.api"
import { formSchema, FormData } from "../acceptance.schema"
import { REPAIR_STATUSES } from "../acceptance.constants"
import { createOperationalLog, createTimelineLog, getIconForAction } from "../acceptance-logging"
import { AcceptanceInvoiceView } from "./workspace/acceptance-invoice-view"

// Constants
const TAB_IDS = ["general", "repair", "finance", "photos"] as const
type TabId = (typeof TAB_IDS)[number]

const TABS_CONFIG = [
  { id: "general" as const, label: "Customer & Device", icon: Smartphone },
  { id: "repair" as const, label: "Repair Details", icon: Wrench },
  { id: "finance" as const, label: "Finance & Admin", icon: CreditCard },
  { id: "photos" as const, label: "Photos", icon: Camera },
]

const FORM_DEFAULT_VALUES: FormData = {
  customerId: "",
  brandId: "",
  modelId: "",
  imei: "",
  defectDescription: "",
  estimatedPrice: undefined,
  advancePayment: undefined,
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
  priceOffered: undefined,
  reservedNotes: "",
}

interface AcceptanceFormProps {
  onSuccess?: (data: Acceptance) => void
}

export function AcceptanceForm({ onSuccess }: AcceptanceFormProps) {
  const queryClient = useQueryClient()
  const { mutate: createAcceptance, isPending } = useCreateAcceptance()
  const { getCurrencyIcon } = useCurrency()
  const [activeTab, setActiveTab] = useState<TabId>("general")
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [createdAcceptance, setCreatedAcceptance] = useState<Acceptance | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: FORM_DEFAULT_VALUES,
  })

  const { control, handleSubmit, setValue, formState } = form
  const brandId = useWatch({ control, name: "brandId" })
  const pinUnlock = useWatch({ control, name: "pinUnlock" })
  const urgent = useWatch({ control, name: "urgent" })

  // Reset model when brand changes
  useEffect(() => {
    if (formState.dirtyFields.brandId) {
      setValue("modelId", "", { shouldDirty: true })
    }
  }, [brandId, setValue, formState.dirtyFields.brandId])

  // Navigate to next tab
  const handleNextTab = useCallback(() => {
    const currentIndex = TAB_IDS.indexOf(activeTab)
    if (currentIndex < TAB_IDS.length - 1) {
      setActiveTab(TAB_IDS[currentIndex + 1])
    }
  }, [activeTab])

  // Handle invoice dialog close
  const handleInvoiceDialogClose = useCallback(
    (open: boolean) => {
      setInvoiceDialogOpen(open)
      // When dialog closes, call onSuccess to close form modal
      if (!open && createdAcceptance) {
        onSuccess?.(createdAcceptance)
      }
    },
    [createdAcceptance, onSuccess]
  )

  // Form submission
  const onSubmit = (data: FormData) => {
    // Calculate financial fields
    const totalCost = data.estimatedPrice || 0
    const advancePaid = data.advancePayment || 0

    // Create initial logs for new ticket
    const operationalLog = createOperationalLog(
      "TICKET_CREATED",
      "Device acceptance ticket created by Front Desk",
      "current-user-id"
    )

    const timelineLog = createTimelineLog(
      "TICKET_CREATED",
      "Device intake initiated",
      getIconForAction("TICKET_CREATED"),
      "blue",
      "current-user-id"
    )

    // Prepare data
    const submitData: FormData = {
      ...data,
      totalCost,
      balanceDue: totalCost - advancePaid,
      operationalLogs: [operationalLog],
      timelineLogs: [timelineLog],
    }

    createAcceptance(submitData, {
      onSuccess: (res) => {
        toast.success("Device received successfully! Ticket created.")
        queryClient.invalidateQueries({ queryKey: ["acceptances"] })
        
        // Store created acceptance and open invoice dialog
        setCreatedAcceptance(res)
        setInvoiceDialogOpen(true)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  // Main render
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full bg-muted/10">
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabId)} className="w-full max-w-5xl mx-auto space-y-6">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-4 h-auto p-1.5 bg-muted/50 border shadow-sm rounded-xl">
              {TABS_CONFIG.map(({ id, label, icon: Icon }) => (
                <TabsTrigger key={id} value={id} className="py-2.5 text-xs font-bold rounded-lg data-[state=active]:shadow-sm">
                  <Icon className="w-4 h-4 mr-2 hidden sm:block" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-6 min-h-[420px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <CustomerSelectField name="customerId" control={control as unknown as any} required />
                  </div>
                  <BrandSelectField name="brandId" control={control as unknown as any} required />
                  <ModelSelectField name="modelId" control={control as unknown as any} brandId={brandId} required disabled={!brandId} />
                  <MasterSettingSelectField control={control as unknown as any} name="deviceType" type="DEVICE_TYPE" label="Device Type" required />
                  <MasterSettingSelectField control={control as unknown as any} name="color" type="COLOR" label="Device Color" />
                  <TextField control={control as unknown as any} name="imei" label="IMEI / Serial Number" required />
                  <TextField control={control as unknown as any} name="secondaryImei" label="Secondary IMEI (Optional)" />
                </div>
              </div>
            </TabsContent>

            {/* Repair Details Tab */}
            <TabsContent value="repair" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-6 min-h-[420px]">
                <div className="grid grid-cols-1 gap-6">
                  <TextareaField control={control as unknown as any} name="defectDescription" label="Defect / Problem Description" required rows={3} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MasterSettingSelectField control={control as unknown as any} name="accessories" type="ACCESSORY" label="Included Accessories" />
                  <MasterSettingSelectField control={control as unknown as any} name="warranty" type="WARRANTY" label="Warranty Promised" />
                  <UserSelectField variant="technician" control={control as unknown as any} name="technicianId" label="Assign Technician (Optional)" />
                </div>
                {/* PIN & Urgent Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-muted/30 rounded-xl border border-border/60">
                  <div className="space-y-4">
                    <RadioGroupField control={control as unknown as any} name="pinUnlock" label="Device has PIN/Password?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                    {pinUnlock === "true" && <TextField control={control as unknown as any} name="pinUnlockNumber" label="PIN Code" required />}
                  </div>
                  <div className="space-y-4 md:border-l md:pl-6 border-border">
                    <RadioGroupField control={control as unknown as any} name="urgent" label="Is this Urgent?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                    {urgent === "true" && <DatePickerField control={control as unknown as any} name="urgentDateTime" label="Deadline Date & Time" required showTime />}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Finance & Admin Tab */}
            <TabsContent value="finance" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-6 min-h-[420px]">
                {/* Primary Finance Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-border/50 pb-6">
                  <TextField control={control as unknown as any} icon={getCurrencyIcon()} name="totalCost" label="Total Cost" type="number" min={0} />
                  <TextField control={control as unknown as any} icon={getCurrencyIcon()} name="estimatedPrice" label="Estimated Cost" type="number" min={0} />
                  <TextField control={control as unknown as any} icon={getCurrencyIcon()} name="advancePayment" label="Advance Paid" type="number" min={0} />
                  <DatePickerField control={control as unknown as any} name="acceptanceDate" label="Acceptance Date" required />
                </div>
                {/* Loaner & Buyback Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border/50 pb-6">
                  <ItemSelectField control={control as unknown as any} name="loanerDeviceId" label="Loaner Phone" type="LOANER" />
                  <ItemSelectField control={control as unknown as any} name="replacementDeviceId" label="Replacement Device ID" inStock={true} extras={['salePrice']} />
                  <TextField control={control as unknown as any} name="dealer" label="Dealer Name" placeholder="B2B dealer if applicable" />
                  <TextField control={control as unknown as any} icon={getCurrencyIcon()} name="priceOffered" label="Buyback Price Offered" type="number" />
                </div>
                {/* Flags & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5 p-4 bg-muted/30 rounded-xl border border-border">
                    <RadioGroupField control={control as unknown as any} name="quote" label="Needs Quote First?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                    <RadioGroupField control={control as unknown as any} name="importantInformation" label="Flag as Important?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                  </div>
                  <div className="space-y-4">
                    <TextareaField control={control as unknown as any} name="notes" label="Public Notes (Prints on Invoice)" rows={2} />
                    <TextareaField control={control as unknown as any} name="reservedNotes" label="Internal Notes (Hidden from customer)" rows={2} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card p-6 rounded-2xl shadow-sm border border-border min-h-[420px]">
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-foreground">Condition Proof Photos</h4>
                  <p className="text-xs text-muted-foreground mt-1">Upload up to 5 photos to document the device condition (scratches, dents, etc.) before taking it in.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <ImageUploadField key={num} control={control as unknown as any} name={`photo${num}` as keyof FieldValues} label={`Photo ${num}`} layout="compact" />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Form Actions Footer */}
        <div className="bg-background border-t border-border p-4 px-6 sticky bottom-0 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
            <Button type="button" variant="ghost" onClick={() => onSuccess?.(null as any)}>
              Cancel
            </Button>
            <div className="flex gap-3">
              {activeTab !== "photos" && (
                <Button type="button" variant="secondary" onClick={handleNextTab}>
                  Next Step
                </Button>
              )}
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md font-bold px-6">
                {isPending ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Auto-open Invoice Print Dialog after Ticket Creation */}
      {createdAcceptance && (
        <PrintableDialog
          isOpen={invoiceDialogOpen}
          onOpenChange={handleInvoiceDialogClose}
          title="Repair Estimate"
          icon={<Receipt className="h-4 w-4" />}
          printableElementId="printable-invoice"
          className="max-w-4xl p-0 overflow-hidden h-[95vh]"
        >
          <AcceptanceInvoiceView
            acceptance={createdAcceptance}
            invoiceType="PENDING"
          />
        </PrintableDialog>
      )}
    </Form>
  )
}