"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm, useWatch, FieldValues, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Smartphone, Wrench, CreditCard, Camera, Receipt, AlertCircle, CheckCircle2 } from "lucide-react"
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

// ========== FOOTER COMPONENT ==========
interface AcceptanceFormFooterProps {
  onClose: () => void
  currentTabIndex: number
  handlePrevTab: () => void
  handleNextTab: () => void
}

function AcceptanceFormFooter({
  onClose,
  currentTabIndex,
  handlePrevTab,
  handleNextTab
}: AcceptanceFormFooterProps) {
  return (
    <div className="flex-shrink-0 border-t border-border px-6 py-3 bg-background">
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-xs h-9"
        >
          Cancel
        </Button>
        <div className="flex gap-2">
          {currentTabIndex > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevTab}
              className="text-xs h-9"
            >
              ← Back
            </Button>
          )}
          {currentTabIndex < TABS_CONFIG.length - 1 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleNextTab}
              className="text-xs h-9"
            >
              Next →
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ========== TAB CONFIGURATION ==========
export const TAB_IDS = ["essentials", "details", "admin", "photos"] as const
export type TabId = (typeof TAB_IDS)[number]

export const TABS_CONFIG: Array<{
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
  fieldCount: number
  hasRequired: boolean
  description: string
}> = [
    {
      id: "essentials",
      label: "Essentials",
      icon: Smartphone,
      fieldCount: 6,
      hasRequired: true,
      description: "Customer & Device info"
    },
    {
      id: "details",
      label: "Repair Details",
      icon: Wrench,
      fieldCount: 7,
      hasRequired: true,
      description: "Problem & technician"
    },
    {
      id: "admin",
      label: "Finance & Admin",
      icon: CreditCard,
      fieldCount: 11,
      hasRequired: false,
      description: "Pricing & notes"
    },
    {
      id: "photos",
      label: "Photos",
      icon: Camera,
      fieldCount: 5,
      hasRequired: false,
      description: "Device condition"
    },
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

// ========== VALIDATION & ERROR TRACKING ==========
const fieldTabMap: Record<string, TabId> = {
  customerId: "essentials",
  brandId: "essentials",
  modelId: "essentials",
  imei: "essentials",
  deviceType: "essentials",
  acceptanceDate: "admin",
  secondaryImei: "essentials",
  color: "essentials",
  defectDescription: "details",
  accessories: "details",
  warranty: "details",
  technicianId: "details",
  pinUnlock: "details",
  pinUnlockNumber: "details",
  urgent: "details",
  urgentDateTime: "details",
  estimatedPrice: "admin",
  advancePayment: "admin",
  totalCost: "admin",
  loanerDeviceId: "admin",
  replacementDeviceId: "admin",
  dealer: "admin",
  priceOffered: "admin",
  quote: "admin",
  importantInformation: "admin",
  notes: "admin",
  reservedNotes: "admin",
  photo1: "photos",
  photo2: "photos",
  photo3: "photos",
  photo4: "photos",
  photo5: "photos",
}

// ========== ESSENTIAL vs OPTIONAL FIELDS ==========

interface AcceptanceFormProps {
  onSuccess?: (data: Acceptance) => void
}

export function AcceptanceForm({ onSuccess }: AcceptanceFormProps) {
  const queryClient = useQueryClient()
  const { mutate: createAcceptance, isPending } = useCreateAcceptance()
  const { getCurrencyIcon } = useCurrency()
  const [activeTab, setActiveTab] = useState<TabId>("essentials")
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [createdAcceptance, setCreatedAcceptance] = useState<Acceptance | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: FORM_DEFAULT_VALUES,
  })

  const { control, handleSubmit, setValue, formState, watch } = form
  const brandId = useWatch({ control, name: "brandId" })
  const pinUnlock = useWatch({ control, name: "pinUnlock" })
  const urgent = useWatch({ control, name: "urgent" })

  // Subscribing to errors is required for React Hook Form to trigger re-renders
  const { errors } = formState

  // ========== EFFECTS ==========
  useEffect(() => {
    if (formState.dirtyFields.brandId) {
      setValue("modelId", "", { shouldDirty: true })
    }
  }, [brandId, setValue, formState.dirtyFields.brandId])

  // ========== HANDLERS ==========
  const handleNextTab = useCallback(() => {
    const currentIndex = TAB_IDS.indexOf(activeTab)
    if (currentIndex < TAB_IDS.length - 1) {
      setActiveTab(TAB_IDS[currentIndex + 1])
    }
  }, [activeTab])

  const handlePrevTab = useCallback(() => {
    const currentIndex = TAB_IDS.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(TAB_IDS[currentIndex - 1])
    }
  }, [activeTab])

  const handleInvoiceDialogClose = useCallback(
    (open: boolean) => {
      setInvoiceDialogOpen(open)
      if (!open && createdAcceptance) {
        onSuccess?.(createdAcceptance)
      }
    },
    [createdAcceptance, onSuccess]
  )

  // ========== FORM SUBMISSION ==========
  const onInvalid = (errors: FieldErrors<FormData>) => {
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0]
      const firstErrorTab = fieldTabMap[firstErrorField] || "essentials"
      const firstErrorMessage = errors[firstErrorField as keyof typeof errors]?.message as string || "Validation error"

      setActiveTab(firstErrorTab as TabId)
      toast.error(`${firstErrorTab.toUpperCase()}: ${firstErrorMessage}`)
    }
  }

  const onSubmit = (data: FormData) => {
    // Calculate financial fields
    const totalCost = Number(data.estimatedPrice) || 0
    const advancePaid = Number(data.advancePayment) || 0

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

    const submitData: FormData = {
      ...data,
      totalCost,
      balanceDue: totalCost - advancePaid,
      operationalLogs: [operationalLog],
      timelineLogs: [timelineLog],
    }

    createAcceptance(submitData, {
      onSuccess: (res) => {
        toast.success("✓ Device received successfully! Ticket created.")
        queryClient.invalidateQueries({ queryKey: ["acceptances"] })
        setCreatedAcceptance(res)
        setInvoiceDialogOpen(true)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  const currentTabIndex = TAB_IDS.indexOf(activeTab)

  // Calculate tabs with errors for the red dot indicator
  const tabsWithErrors = new Set<TabId>()
  Object.keys(errors).forEach((field) => {
    const tab = fieldTabMap[field]
    if (tab) tabsWithErrors.add(tab)
  })

  const handleCloseModal = useCallback(() => {
    onSuccess?.(null as any)
  }, [onSuccess])

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col flex-1 min-h-0 w-full h-full overflow-hidden">
        {/* SINGLE TABS COMPONENT - Wraps header and content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} className="flex flex-col flex-1 min-h-0 w-full h-full overflow-hidden">
          {/* HEADER SECTION - Fixed height, not scrolling */}
          <div className="flex-shrink-0 border-b border-border px-6 py-4 bg-background space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-bold text-foreground">New Device Acceptance</h3>
                <p className="text-xs text-muted-foreground">Step {currentTabIndex + 1} of {TABS_CONFIG.length}</p>
              </div>
              
              {/* Primary Action Button - Moved to Header */}
              <Button
                type="submit"
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md font-bold text-xs h-9 px-4"
                size="sm"
              >
                {isPending ? "Creating..." : "✓ Create Ticket"}
              </Button>
            </div>

            {/* Tab Navigation - Fixed at top */}
            <TabsList className="grid w-full grid-cols-4 h-9">
              {TABS_CONFIG.map((tab) => {
                const hasError = tabsWithErrors.has(tab.id)
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                    <tab.icon className="mr-1.5 h-3.5 w-3.5" />
                    {tab.label}
                    {hasError && (
                      <AlertCircle className="ml-1.5 h-3.5 w-3.5 text-red-500 animate-pulse" />
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* CONTENT SECTION - Scrollable  */}
          <div className="flex-1 overflow-y-auto min-h-0 w-full">
            <div className="px-6 py-6 space-y-5 pb-20">
              {/* TABS CONTENT - Only this scrolls */}
              <TabsContent value="essentials" className="mt-2 space-y-5 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-card p-5 rounded-xl shadow-sm border border-green-500/20">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Customer & Device Registration
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Customer */}
                    <div>
                      <CustomerSelectField name="customerId" control={control as any} required />
                    </div>

                    {/* Device Selection */}
                    <div className="border-t pt-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Device Information</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <BrandSelectField name="brandId" control={control as any} required />
                        </div>
                        <div>
                          <ModelSelectField name="modelId" control={control as any} brandId={brandId} required disabled={!brandId} />
                        </div>
                        <div>
                          <MasterSettingSelectField control={control as any} name="deviceType" type="DEVICE_TYPE" label="Device Type" />
                        </div>
                      </div>
                    </div>

                    {/* Identification */}
                    <div className="border-t pt-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Device Identification</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <TextField control={control as any} name="imei" label="IMEI / Serial Number" required />
                        </div>
                        <div>
                          <TextField control={control as any} name="secondaryImei" label="Secondary IMEI" />
                        </div>
                        <div>
                          <MasterSettingSelectField control={control as any} name="color" type="COLOR" label="Color" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* DETAILS TAB */}
              <TabsContent value="details" className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                <div className="bg-card p-5 rounded-xl shadow-sm border border-border space-y-4">
                  <div>
                    <TextareaField control={control as any} name="defectDescription" label="What's the issue?" placeholder="Describe the defect or issue..." rows={2} required />
                  </div>

                  {/* Additional Details */}
                  <div className="border-t pt-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Accessories & Service</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <MasterSettingSelectField control={control as any} name="accessories" type="ACCESSORY" label="Accessories" />
                      <MasterSettingSelectField control={control as any} name="warranty" type="WARRANTY" label="Warranty" />
                      <UserSelectField variant="technician" control={control as any} name="technicianId" label="Assign Technician" />
                    </div>
                  </div>

                  {/* Special Flags */}
                  <div className="border-t pt-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Special Handling</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/40 rounded-lg border border-border/50">
                      <div className="space-y-3">
                        <RadioGroupField control={control as any} name="pinUnlock" label="Device PIN Locked?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                        {pinUnlock === "true" && (
                          <TextField control={control as any} name="pinUnlockNumber" label="PIN Code" required />
                        )}
                      </div>
                      <div className="space-y-3">
                        <RadioGroupField control={control as any} name="urgent" label="Urgent Request?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                        {urgent === "true" && (
                          <DatePickerField control={control as any} name="urgentDateTime" label="Deadline" required showTime />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ADMIN TAB */}
              <TabsContent value="admin" className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                <div className="bg-card p-5 rounded-xl shadow-sm border border-border space-y-4">
                  {/* General Admin Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DatePickerField control={control as any} name="acceptanceDate" label="Acceptance Date" required />
                    <TextField control={control as any} name="dealer" label="B2B / Dealer Name" />
                  </div>

                  {/* Financial Info */}
                  <div className="border-t pt-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Pricing Information</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/40 rounded-lg border border-border/50">
                      <TextField control={control as any} icon={getCurrencyIcon()} name="estimatedPrice" label="Estimated" type="number" />
                      <TextField control={control as any} icon={getCurrencyIcon()} name="advancePayment" label="Advance" type="number" />
                      <TextField control={control as any} icon={getCurrencyIcon()} name="totalCost" label="Total" type="number" readOnly />
                      <TextField control={control as any} icon={getCurrencyIcon()} name="priceOffered" label="Buyback" type="number" />
                    </div>
                  </div>

                  {/* Devices */}
                  <div className="border-t pt-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Device Management</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ItemSelectField control={control as any} name="loanerDeviceId" label="Provide Loaner" type="LOANER" />
                      <ItemSelectField control={control as any} name="replacementDeviceId" label="Replacement Device" inStock={true} />
                    </div>
                  </div>

                  {/* Flags */}
                  <div className="border-t pt-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Request Handling</div>
                    <div className="flex flex-col md:flex-row gap-6 p-4 bg-muted/40 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <RadioGroupField control={control as any} name="quote" label="Send Quote?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                      </div>
                      <div className="flex-1">
                        <RadioGroupField control={control as any} name="importantInformation" label="Flag Important?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} layout="partial-horizontal" />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="border-t pt-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Notes</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextareaField control={control as any} name="notes" label="Public Notes" placeholder="Visible to customer" rows={2} />
                      <TextareaField control={control as any} name="reservedNotes" label="Internal Notes" placeholder="Only visible to staff" rows={2} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* PHOTOS TAB */}
              <TabsContent value="photos" className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
                <div className="bg-card p-5 rounded-xl shadow-sm border border-border">
                  <h4 className="text-sm font-bold text-foreground mb-2">Device Condition Photos</h4>
                  <p className="text-xs text-muted-foreground mb-5">Upload up to 5 photos to document the current condition (optional but recommended)</p>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <ImageUploadField key={num} control={control as any} name={`photo${num}` as keyof FieldValues} label={`Photo ${num}`} layout="compact" />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>  {/* Close padding div */}
          </div>  {/* Close scrollable container */}
        </Tabs>

        {/* FOOTER SECTION - Fixed height, not scrolling */}
        <AcceptanceFormFooter
          onClose={handleCloseModal}
          currentTabIndex={currentTabIndex}
          handlePrevTab={handlePrevTab}
          handleNextTab={handleNextTab}
        />

      </form>

      {/* Invoice Dialog */}
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