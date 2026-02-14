"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field"
import { Modal } from "@/components/shared/modal"
import { Label } from "@/components/ui/label"

import { customerSchema, CustomerFormValues } from "../customer.schema"
import { Customer } from "../customer.schema"
import { useCreateCustomer } from "../customer.api"
import { BRANCH_OPTIONS, BOX_NUMBER_OPTIONS, PROVINCE_OPTIONS } from "../customer.constants"
import { CUSTOMERS_BASE_HREF } from "@/config/paths"

interface CustomerFormProps {
  onSuccess?: (data: Customer) => void
}

export function CustomerForm({ onSuccess }: CustomerFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { mutate: createCustomer, isPending } = useCreateCustomer()
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false)
  const [newBoxNumber, setNewBoxNumber] = useState("")
  const [boxOptions, setBoxOptions] = useState(BOX_NUMBER_OPTIONS)

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      login_name: "",
      phone: "",
      mobile: "",
      fax: "",
      fiscal_code: "",
      location: "",
      province: "",
      address: "",
      postal_code: "",
      vat: "",
      branch_tid: "",
      box_number_tid: "",
      isDealer: false,
      isDesktopCustomer: true,
      isCustomer: false,
      isActive: true,
    },
  })

  function onSubmit(data: CustomerFormValues) {
    createCustomer(data, {
      onSuccess: (newCustomer) => {
        toast.success("Customer created successfully")
        queryClient.invalidateQueries({ queryKey: ["customers"] })
        if (onSuccess) {
          onSuccess(newCustomer)
        } else {
          router.push(CUSTOMERS_BASE_HREF)
        }
      },
      onError: (error) => {
        toast.error("Failed to create customer: " + error.message)
      },
    })
  }

  const handleAdd = (type: string) => {
    if (type === "Box Number") {
      setIsBoxModalOpen(true)
    } else {
      toast.info(`Add ${type} functionality coming soon`)
    }
  }

  const handleSaveBoxNumber = () => {
    if (!newBoxNumber.trim()) {
      toast.error("Box number cannot be empty")
      return
    }
    const newOption = {
      value: newBoxNumber.toLowerCase().replace(/\s+/g, "-"),
      label: newBoxNumber,
    }
    setBoxOptions([...boxOptions, newOption])
    form.setValue("box_number_tid", newOption.value)
    setIsBoxModalOpen(false)
    setNewBoxNumber("")
    toast.success(`Box Number ${newBoxNumber} added`)
  }

  return (
    <>
      <Modal
        title="Add Box Number"
        description="Add a new storage box location."
        isOpen={isBoxModalOpen}
        onClose={setIsBoxModalOpen}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="box-number">Box Name/Number</Label>
            <Input
              id="box-number"
              value={newBoxNumber}
              onChange={(e) => setNewBoxNumber(e.target.value)}
              placeholder="e.g. Box 12"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveBoxNumber}>Save</Button>
          </div>
        </div>
      </Modal>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="example@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="login_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login Name</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Landline number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fax</FormLabel>
                    <FormControl>
                      <Input placeholder="Fax number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Full street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City or Area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <ComboboxWithAdd
                control={form.control}
                name="province"
                label="Province"
                options={PROVINCE_OPTIONS}
                placeholder="Select Province"
                searchPlaceholder="Search province..."
              />
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="00000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fiscal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fiscal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Fiscal Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="vat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT</FormLabel>
                    <FormControl>
                      <Input placeholder="VAT Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ComboboxWithAdd
                control={form.control}
                name="branch_tid"
                label="Branch"
                options={BRANCH_OPTIONS.filter((o) => o.value !== "all")}
                placeholder="Select Branch"
                searchPlaceholder="Search branch..."
                required
              />
              <ComboboxWithAdd
                control={form.control}
                name="box_number_tid"
                label="Box Number"
                options={boxOptions}
                placeholder="Select Box"
                searchPlaceholder="Search box..."
                onAdd={() => handleAdd("Box Number")}
              />
            </div>

            {/* Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {["isDealer", "isDesktopCustomer", "isCustomer", "isActive"].map(
                (name) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="capitalize">
                            {name
                              .replace(/([A-Z])/g, " $1")
                              .trim()
                              .replace("is ", "")}
                            ?
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                )
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 px-4 pb-4">
            <Button variant="outline" type="button" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Customer
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
    </>
  )
}