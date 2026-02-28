import { Control, FieldValues, Path } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { FieldLabel } from "./field-label"

interface RadioOption {
  value: string
  label: string
}

interface RadioGroupFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label: React.ReactNode
  options?: RadioOption[]
  required?: boolean
  className?: string
  layout?: "horizontal" | "vertical" | "partial-horizontal"
  readOnly?: boolean
}

export function RadioGroupField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required = false,
  options = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ],
  className,
  layout = "horizontal",
  readOnly = false,
}: RadioGroupFieldProps<TFieldValues>) {
  // Layout classes for the main FormItem container
  const formItemLayoutClass = {
    horizontal: "grid grid-cols-1 items-center gap-x-4 gap-y-2 md:grid-cols-2",
    vertical: "space-y-2",
    "partial-horizontal": "space-y-2",
  }[layout]

  // Layout classes for the FormLabel
  const formLabelLayoutClass = {
    horizontal: "text-left",
    vertical: "",
    "partial-horizontal": "",
  }[layout]

  // Layout classes for the RadioGroup itself (options container)
  const radioGroupLayoutClass = {
    horizontal: "flex flex-row flex-wrap items-center gap-x-6 gap-y-2",
    vertical: "flex flex-col space-y-2 pt-1",
    "partial-horizontal": "flex flex-row flex-wrap items-center gap-x-6 gap-y-2 pt-1",
  }[layout]

  // Layout classes for the FormControl wrapper
  const formControlLayoutClass = {
    horizontal: "",
    vertical: "",
    "partial-horizontal": "",
  }[layout]

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(formItemLayoutClass, className)}>
          <FieldLabel 
            label={label} 
            required={required} 
            readOnly={readOnly} 
            className={formLabelLayoutClass} 
          />
          <FormControl className={formControlLayoutClass}>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className={radioGroupLayoutClass}
              disabled={readOnly}
            >
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${name}_${option.value}`} />
                  <Label
                    htmlFor={`${name}_${option.value}`}
                    className="font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage
            className={cn(
              layout === "horizontal" && "md:col-start-2"
            )}
          />
        </FormItem>
      )}
    />
  )
}
