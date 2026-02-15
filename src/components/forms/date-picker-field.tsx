"use client"

import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Control, FieldValues, Path } from "react-hook-form"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { DayPicker } from "react-day-picker"
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerFieldProps<TFieldValues extends FieldValues> {
    control: Control<TFieldValues>
    name: Path<TFieldValues>
    label: string
    placeholder?: string
    disabled?: (date: Date) => boolean
    required?: boolean
    className?: string
}

export function DatePickerField<TFieldValues extends FieldValues>({
    control,
    name,
    label,
    placeholder = "Pick a date",
    disabled,
    required,
    className,
}: DatePickerFieldProps<TFieldValues>) {
    const [open, setOpen] = useState(false)

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn("flex flex-col", className)}>
                    <FormLabel className={cn("text-xs", required && "required")}>{label}</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value ? (
                                        format(new Date(field.value), "PPP")
                                    ) : (
                                        <span>{placeholder}</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 px-5" align="start">
                            <DayPicker
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => {
                                    field.onChange(date)
                                    setOpen(false)
                                }}
                                disabled={disabled}
                                initialFocus
                                className={cn("p-3", className)}
                                classNames={{
                                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                    month: "space-y-4",
                                    // Header layout fix
                                    caption: "flex justify-center pt-1 relative items-center h-9",
                                    caption_label: "text-sm font-medium",
                                    nav: "flex items-center",
                                    // অ্যারো বাটনগুলো বাইরে সরিয়ে আনার জন্য পজিশনিং ঠিক করা হয়েছে
                                    button_previous: cn(
                                        buttonVariants({ variant: "outline" }),
                                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-2 z-10" // left-1 থেকে left-2 করা হয়েছে
                                    ),
                                    button_next: cn(
                                        buttonVariants({ variant: "outline" }),
                                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-2 z-10" // right-1 থেকে right-2 করা হয়েছে
                                    ),
                                    // Grid structure for v9
                                    month_grid: "w-full border-collapse space-y-1",
                                    weekdays: "flex justify-between", // দিনগুলোর নাম (Mo, Tu...) সমান দূরত্বে রাখার জন্য
                                    weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
                                    week: "flex w-full mt-2 justify-between", // তারিখগুলো সমান দূরত্বে রাখার জন্য
                                    day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                                    day_button: cn(
                                        buttonVariants({ variant: "ghost" }),
                                        "h-9 w-9 p-0 font-normal aria-selected:opacity-100 transition-all hover:bg-accent"
                                    ),
                                    selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
                                    today: "bg-accent text-accent-foreground",
                                    outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                                    disabled: "text-muted-foreground opacity-50",
                                    hidden: "invisible",
                                }}
                                components={{
                                    Chevron: (props) => {
                                        if (props.orientation === 'left') return <ChevronLeft className="h-4 w-4" />;
                                        return <ChevronRight className="h-4 w-4" />;
                                    }
                                }}
                            /> 
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
