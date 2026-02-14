"use client"

import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field";
import { useFormContext } from "react-hook-form"
import { type FormData } from "../../types/forms";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CustomerComboboxField } from "@/features/acceptances/components/add/customer-combobox-field";
import { BrandComboboxField } from "@/features/brands/components/brand-combobox-field";

// Mock data for dropdowns
const deviceTypeOptions = ["SMARTPHONE", "TABLET", "LAPTOP", "DESKTOP", "OTHER"].map(v => ({ value: v, label: v }))
const currentStatusOptions = ["IN REPAIR", "WAITING PARTS", "READY", "DELIVERED", "CANCELLED"].map(v => ({ value: v, label: v }))
const modelOptions = [{ value: "iphone-13", label: "iPhone 13" }, { value: "galaxy-s21", label: "Galaxy S21" }];
const colorOptions = [{ value: "black", label: "Black" }, { value: "white", label: "White" }, { value: "red", label: "Red" }, { value: "blue", label: "Blue" }];

export function CustomerDeviceFields() {
  const { control } = useFormContext<FormData>();

  const handleAdd = (field: string) => {
    alert(`Add new ${field}`);
  };

  return (
    <>
      <div className="bg-white p-4 rounded-md shadow border space-y-3">
        <CustomerComboboxField
          name="customer_name"
          control={control}
          required
        />

      <FormField
        control={control}
        name="estimated_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Estimated Price</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter the estimated price" {...field} className="h-10" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <BrandComboboxField
        name="brand"
        control={control}
        required
      />

      <ComboboxWithAdd
        control={control}
        name="model"
        label="Model"
        placeholder="Select Model"
        searchPlaceholder="Search models..."
        noResultsMessage="No model found."
        options={modelOptions}
        onAdd={() => handleAdd("Model")}
        required
      />

      <ComboboxWithAdd
        control={control}
        name="color"
        label="Color"
        placeholder="Select Color"
        searchPlaceholder="Search colors..."
        noResultsMessage="No color found."
        options={colorOptions}
        onAdd={() => handleAdd("Color")}
      />

      <div className="flex items-end">
        <FormField
          control={control}
          name="accessories"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="text-xs">Accessories</FormLabel>
              <FormControl>
                <Input placeholder="e.g., charger, case" {...field} className="rounded-r-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="button" variant="outline" size="icon" className="rounded-l-none border-l-0" onClick={() => handleAdd("Accessory")}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ComboboxWithAdd
        control={control}
        name="device_type"
        label="Device Type"
        placeholder="Select device type"
        searchPlaceholder="Search device types..."
        noResultsMessage="No device type found."
        options={deviceTypeOptions}
        onAdd={() => handleAdd("Device Type")}
        required
      />

      <ComboboxWithAdd
        control={control}
        name="current_status"
        label="Current Status"
        placeholder="Select status"
        searchPlaceholder="Search statuses..."
        noResultsMessage="No status found."
        options={currentStatusOptions}
        onAdd={() => handleAdd("Status")}
        required
      />

      <FormField
        control={control}
        name="defect_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Defect Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe the defect presented by the device" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Notes</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter the condition of the device" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      </div>
    </>
  );
}