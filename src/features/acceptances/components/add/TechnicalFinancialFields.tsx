"use client"

import { useFormContext } from "react-hook-form";
import { type FormData } from "@/features/acceptances/acceptance.schema";
import { DatePickerField } from "@/components/forms/date-picker-field";
import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field";
import { TextField } from "@/components/forms/text-field";
import { TextareaField } from "@/components/forms/textarea-field";

const warrantyOptions = ["No Warranty", "3 Months", "6 Months", "12 Months", "Lifetime"].map(v => ({ value: v, label: v }));
const technicianOptions = [
  { value: "tech-1", label: "John Technician" },
  { value: "tech-2", label: "Jane Repair" },
];
const replacementDeviceOptions = [
  { value: "iphone-x-loaner", label: "iPhone X (Loaner)" },
  { value: "samsung-s10-loaner", label: "Samsung S10 (Loaner)" },
];

export function TechnicalFinancialFields() {
  const { control } = useFormContext<FormData>();
  const handleAdd = (field: string) => {
    alert(`Add new ${field}`);
  };

  return (
    <div className="bg-white p-4 rounded-md shadow border space-y-3">
      <DatePickerField
        control={control}
        name="created_date"
        label="Created Date"
        required
        disabled={(date: Date) => date > new Date() || date < new Date("1900-01-01")}
      />

      <TextField
        control={control}
        name="imei"
        label="IMEI/Serial No"
        placeholder="Enter IMEI"
        required
      />

      <TextField
        control={control}
        name="secondary_imei"
        label="Secondary IMEI"
        placeholder="Enter secondary IMEI"
      />

      <ComboboxWithAdd
        control={control}
        name="technician_id"
        label="Technician"
        placeholder="Select technician"
        searchPlaceholder="Search technicians..."
        noResultsMessage="No technician found."
        options={technicianOptions}
        onAdd={() => handleAdd("Technician")}
        required
      />

      <ComboboxWithAdd
        control={control}
        name="warranty"
        label="Warranty"
        placeholder="Choose an option"
        searchPlaceholder="Search warranties..."
        noResultsMessage="No warranty found."
        options={warrantyOptions}
        onAdd={() => handleAdd("Warranty")}
      />

      <ComboboxWithAdd
        control={control}
        name="replacement_device_id"
        label="Replacement Device"
        placeholder="Select replacement device"
        searchPlaceholder="Search devices..."
        noResultsMessage="No device found."
        options={replacementDeviceOptions}
        onAdd={() => handleAdd("Replacement Device")}
      />

      <TextField
        control={control}
        name="dealer"
        label="Dealer"
        placeholder="For B2B partner reference"
      />

      <TextField
        control={control}
        name="price_offered"
        label="Price Offered"
        type="number"
        placeholder="XXXXX"
      />

      <TextareaField
        control={control}
        name="reserved_notes"
        label="Reserved Notes"
        placeholder="Enter reserved notes"
      />
    </div>
  )
}
