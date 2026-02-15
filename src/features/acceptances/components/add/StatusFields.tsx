"use client"

import Image from "next/image"
import { useFormContext } from "react-hook-form"
import { type FormData } from "@/features/acceptances/acceptance.schema";
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Upload } from "lucide-react"
import { RadioGroupField } from "@/components/forms/radio-group-field"
import { DatePickerField } from "@/components/forms/date-picker-field";
import { TextField } from "@/components/forms/text-field";

interface StatusFieldsProps {
  photoPreviews: { [key: string]: string }
  handlePhotoUpload: (fieldName: string, file: File | null) => void
  removePhoto: (fieldName: string) => void
}

export function StatusFields({ 
  photoPreviews,
  handlePhotoUpload,
  removePhoto,
}: StatusFieldsProps) {
  const { control, watch } = useFormContext<FormData>();
//...
  const pinUnlock = watch("pin_unlock")
  const urgent = watch("urgent")

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-sm font-medium text-gray-500">Acceptance Number</div>
        <div className="bg-blue-500 text-white text-2xl font-bold py-2 px-6 rounded-full inline-block">
          41604-2025
        </div>
        <div className="text-sm text-gray-500">Total Mail Sent: 0</div>
      </div>

      <div className="bg-white p-4 rounded-md shadow border space-y-3">
        <RadioGroupField
          control={control}
          required
          name="important_information"
          label="Important Information"
        />

        <RadioGroupField
          control={control}
          required
          name="pin_unlock"
          label="Pin Unlock"
        />

        {pinUnlock === "Yes" && (
          <TextField
            control={control}
            name="pin_unlock_number"
            label="Pin Unlock Number"
            placeholder="Enter pin unlock number"
            required
          />
        )}

        <RadioGroupField
          control={control}
          required
          name="urgent"
          label="Urgent"
        />

        {urgent === "Yes" && (
          <DatePickerField
            control={control}
            name="urgent_date"
            label="Urgent Date"
            required
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          />
        )}

      <RadioGroupField
        control={control}
        required
        name="quote"
        label="Quote"
      />
      </div>

      <div className="bg-white p-4 rounded-md shadow border">
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5].map((num) => {
          const fieldName = `photo_${num}`
          const preview = photoPreviews[fieldName]

          return (
            <div key={num} className="space-y-2">
              <Label htmlFor={`photo-${num}`} className="text-xs">Photo {num}</Label>
              <div className="relative">
                {preview ? (
                  <div className="relative">
                    <Image
                      src={preview}
                      alt={`Photo ${num}`}
                      width={96}
                      height={96}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => removePhoto(fieldName)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                    <label htmlFor={`photo-${num}`} className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <input
                        id={`photo-${num}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(fieldName, e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}
