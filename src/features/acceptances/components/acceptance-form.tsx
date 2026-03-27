"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm, useWatch, FieldValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Smartphone, Wrench, CreditCard, Camera, Receipt, Grid3x3, List } from "lucide-react"
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
  const [fullViewMode, setFullViewMode] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: FORM_DEFAULT_VALUES,
  })

  const { control, handleSubmit, setValue, formState } = form
  const brandId = useWatch({ control, name: "brandId" })
  const pinUnlock = useWatch({ control, name: "pinUnlock" })
  const urgent = useWatch({ control, name: "urgent" })

  // Map fields to their tabs for error detection
  const fieldTabMap: Record<string, TabId> = {
    customerId: "general",
    brandId: "general",
    modelId: "general",
    imei: "general",
    secondaryImei: "general",
    color: "general",
    deviceType: "general",
    defectDescription: "repair",
    accessories: "repair",
    warranty: "repair",
    technicianId: "repair",
    pinUnlock: "repair",
    pinUnlockNumber: "repair",
    urgent: "repair",
    urgentDateTime: "repair",
    estimatedPrice: "finance",
    advancePayment: "finance",
    totalCost: "finance",
    acceptanceDate: "finance",
    loanerDeviceId: "finance",
    replacementDeviceId: "finance",
    dealer: "finance",
    priceOffered: "finance",
    quote: "finance",
    importantInformation: "finance",
    notes: "finance",
    reservedNotes: "finance",
    photo1: "photos",
    photo2: "photos",
    photo3: "photos",
    photo4: "photos",
    photo5: "photos",
  }

  // Check which tabs have errors
  const getTabsWithErrors = useCallback(() => {
    const errorFields = Object.keys(formState.errors)
    const tabsWithErrors = new Set<TabId>()
    errorFields.forEach((field) => {
      const tab = fieldTabMap[field]
      if (tab) tabsWithErrors.add(tab)
    })
    return tabsWithErrors
  }, [formState.errors])

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
    // Check for validation errors
    const errors = formState.errors
    if (Object.keys(errors).length > 0) {
      // Find first error and its tab
      let firstErrorField = Object.keys(errors)[0]
      let firstErrorTab = fieldTabMap[firstErrorField] || "general"
      const firstErrorMessage = errors[firstErrorField as keyof typeof errors]?.message || "Validation error"

      // Navigate to tab with error
      setActiveTab(firstErrorTab as TabId)

      // Show toast with error info
      toast.error(`Error in ${firstErrorTab === "general" ? "Customer & Device" : firstErrorTab === "repair" ? "Repair Details" : firstErrorTab === "finance" ? "Finance & Admin" : "Photos"} tab: ${firstErrorMessage}`)
      return
    }

    // Calculate financial fields
    const totalCost = Number(data.estimatedPrice) || 0
    const advancePaid = Number(data.advancePayment) || 0

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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden bg-muted/10">
        {/* Single Tabs wrapper for the entire form */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabId)} className="flex flex-col flex-1 overflow-hidden min-h-0">
          {/* Tab Navigation - Fixed at top */}
          <div className="px-6 pt-4 pb-3 bg-background border-b border-border flex-shrink-0">
            <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted/50 border shadow-sm rounded-lg">
              {TABS_CONFIG.map(({ id, label, icon: Icon }) => {
                const tabsWithErrors = getTabsWithErrors()
                const hasError = tabsWithErrors.has(id)
                return (
                  <TabsTrigger key={id} value={id} className="py-2.5 px-2 text-xs font-bold rounded-md data-[state=active]:shadow-sm flex items-center justify-center gap-1.5 relative">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">{label}</span>
                    {hasError && (
                      <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" title="This tab has validation errors" />
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* Tab Content - Scrollable in the middle */}
          <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(75vh-160px)]">
            <div className="max-w-4xl mx-auto px-6 pb-6">
                {/* General Tab */}
                <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                  <div className="bg-card p-5 rounded-xl shadow-sm border border-border space-y-4">
                    {/* Customer - Full Width */}
                    <div>
                      <CustomerSelectField name="customerId" control={control as unknown as any} required />
                    </div>
                    {/* Device Info - Compact Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <BrandSelectField name="brandId" control={control as unknown as any} required />
                      </div>
                      <div className="md:col-span-1">
                        <ModelSelectField name="modelId" control={control as unknown as any} brandId={brandId} required disabled={!brandId} />
                      </div>
                      <div className="md:col-span-1">
                        <MasterSettingSelectField control={control as unknown as any} name="deviceType" type="DEVICE_TYPE" label="Device Type" required />
                      </div>
                    </div>
                    {/* Color & IMEI - Compact Row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <MasterSettingSelectField control={control as unknown as any} name="color" type="COLOR" label="Device Color" />
                      </div>
                      <div>
                        <TextField control={control as unknown as any} name="imei" label="IMEI" required />
                      </div>
                      <div>
                        <TextField control={control as unknown as any} name="secondaryImei" label="Secondary IMEI" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Repair Details Tab */}
                <TabsContent value="repair" className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                  <div className="bg-card p-5 rounded-xl shadow-sm border border-border space-y-4">
                    {/* Problem Description - Compact */}
                    <TextareaField control={control as unknown as any} name="defectDescription" label="Defect / Problem Description" rows={2} />
                    
                    {/* Accessories & Warranty - Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <MasterSettingSelectField control={control as unknown as any} name="accessories" type="ACCESSORY" label="Accessories" />
                      <MasterSettingSelectField control={control as unknown as any} name="warranty" type="WARRANTY" label="Warranty" />
                      <UserSelectField variant="technician" control={control as unknown as any} name="technicianId" label="Technician" />
                    </div>

                    {/* PIN & Urgent - Compact Flags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/40 rounded-lg border border-border/50">
                      <div className="space-y-3">
                        <RadioGroupField control={control as unknown as any} name="pinUnlock" label="Has PIN?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                        {pinUnlock === "true" && (
                          <TextField control={control as unknown as any} name="pinUnlockNumber" label="PIN" required />
                        )}
                      </div>
                      <div className="space-y-3">
                        <RadioGroupField control={control as unknown as any} name="urgent" label="Urgent?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                        {urgent === "true" && (
                          <DatePickerField control={control as unknown as any} name="urgentDateTime" label="Deadline" required showTime />
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Finance & Admin Tab */}
                <TabsContent value="finance" className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                  <div className="bg-card p-5 rounded-xl shadow-sm border border-border space-y-4">
                    {/* Financial Summary - 4 Column */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/40 rounded-lg">
                      <TextField control={control as unknown as any} icon={getCurrencyIcon()} name="estimatedPrice" label="Estimated" type="number" />
                      <TextField control={control as unknown as any} icon={getCurrencyIcon()} name="advancePayment" label="Advance" type="number" />
                      <TextField control={control as unknown as any} icon={getCurrencyIcon()} name="totalCost" label="Total" type="number" />
                      <DatePickerField control={control as unknown as any} name="acceptanceDate" label="Date" required />
                    </div>

                    {/* Loaner & Replacement - 2 Column */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ItemSelectField control={control as unknown as any} name="loanerDeviceId" label="Loaner Phone" type="LOANER" />
                      <ItemSelectField control={control as unknown as any} name="replacementDeviceId" label="Replacement Device" inStock={true} extras={['salePrice']} />
                    </div>

                    {/* B2B / Buyback - 2 Column */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField control={control as unknown as any} name="dealer" label="Dealer Name (B2B)" />
                      <TextField control={control as unknown as any} icon={getCurrencyIcon()} name="priceOffered" label="Buyback Price" type="number" />
                    </div>

                    {/* Flags - Inline Horizontal */}
                    <div className="flex flex-col md:flex-row gap-6 p-4 bg-muted/40 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <RadioGroupField control={control as unknown as any} name="quote" label="Needs Quote?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                      </div>
                      <div className="flex-1">
                        <RadioGroupField control={control as unknown as any} name="importantInformation" label="Flag Important?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                      </div>
                    </div>

                    {/* Notes - Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextareaField control={control as unknown as any} name="notes" label="Public Notes" rows={2} />
                      <TextareaField control={control as unknown as any} name="reservedNotes" label="Internal Notes" rows={2} />
                    </div>
                  </div>
                </TabsContent>

                {/* Photos Tab */}
                <TabsContent value="photos" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-card p-5 rounded-xl shadow-sm border border-border">
                    <h4 className="text-xs font-bold text-foreground mb-2">Condition Proof Photos</h4>
                    <p className="text-[11px] text-muted-foreground mb-4">Upload up to 5 photos to document device condition</p>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <ImageUploadField key={num} control={control as unknown as any} name={`photo${num}` as keyof FieldValues} label={`Photo ${num}`} layout="compact" />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </div>
          </div>
        </Tabs>

        {/* Form Actions Footer */}
        <div className="bg-background border-t border-border px-6 py-2.5 z-10 shadow-[0_-8px_20px_rgba(0,0,0,0.02)] flex-shrink-0">
          <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
            <Button type="button" variant="ghost" size="sm" className="h-9 text-xs" onClick={() => onSuccess?.(null as any)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              {activeTab !== "photos" && (
                <Button type="button" variant="secondary" size="sm" className="h-9 text-xs" onClick={handleNextTab}>
                  Next
                </Button>
              )}
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md font-bold text-xs h-9 px-4" size="sm">
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