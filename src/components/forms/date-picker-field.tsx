"use client"

import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Control, FieldValues, Path } from "react-hook-form"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { DayPicker } from "react-day-picker"
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { FieldLabel } from "./field-label"

interface DatePickerFieldProps<TFieldValues extends FieldValues> {
    control: Control<TFieldValues>
    name: Path<TFieldValues>
    label: string
    placeholder?: string
    disabled?: (date: Date) => boolean
    required?: boolean
    readOnly?: boolean 
    className?: string
    showTime?: boolean
}

export function DatePickerField<TFieldValues extends FieldValues>({
    control,
    name,
    label,
    placeholder = "Pick a date",
    disabled,
    required,
    readOnly = false, // ডিফল্ট ভ্যালু false
    className,
    showTime = false,
}: DatePickerFieldProps<TFieldValues>) {
    const [open, setOpen] = useState(false)
    const displayFormat = showTime ? "PPP p" : "PPP" // 'p' for time (e.g., 12:00 AM)

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn("flex flex-col", className)}>
                    <FieldLabel label={label} required={required} readOnly={readOnly} />
                    
                    {readOnly ? (
                        <FormControl>
                            <div
                                className={cn(
                                    "flex h-9 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-1 text-sm shadow-sm cursor-default",
                                    !field.value && "text-muted-foreground"
                                )}
                            >
                            {field.value ? (
                                format(new Date(field.value), displayFormat)
                            ) : (
                                    <span>{placeholder}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </div>
                        </FormControl>
                    ) : (
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
                                        format(new Date(field.value), displayFormat)
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
                                    if (!date) return;
                                    if (field.value) {
                                        const existingDate = new Date(field.value);
                                        date.setHours(existingDate.getHours());
                                        date.setMinutes(existingDate.getMinutes());
                                    }
                                    field.onChange(date);
                                    if (!showTime) {
                                        setOpen(false);
                                    }
                                }}
                                    disabled={disabled}
                                    initialFocus
                                    className={cn("p-3", className)}
                                    classNames={{
                                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                        month: "space-y-4",
                                        month_caption: "flex justify-center pt-1 relative items-center h-9",
                                        caption_label: "text-sm font-medium",
                                        nav: "flex items-center",
                                        button_previous: cn(
                                            buttonVariants({ variant: "outline" }),
                                            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 z-10"
                                        ),
                                        button_next: cn(
                                            buttonVariants({ variant: "outline" }),
                                            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 z-10"
                                        ),
                                        month_grid: "w-full border-collapse space-y-1",
                                        weekdays: "flex justify-between",
                                        weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
                                        week: "flex w-full mt-2 justify-between",
                                        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                                        day_button: cn(
                                            buttonVariants({ variant: "ghost" }),
                                            "h-9 w-9 p-0 font-normal transition-all hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100"
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
                            {showTime && (
                                <div className="p-3 border-t border-border flex items-center justify-between gap-2">
                                    <div className="flex items-center flex-1">
                                        <Clock className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                                        <input
                                            type="time"
                                            value={field.value ? format(new Date(field.value), "HH:mm") : ""}
                                            onChange={(e) => {
                                                const timeValue = e.target.value;
                                                if (!timeValue) return;
                                                const [hours, minutes] = timeValue.split(':').map(Number);
                                                const newDate = field.value ? new Date(field.value) : new Date();
                                                newDate.setHours(hours);
                                                newDate.setMinutes(minutes);
                                                field.onChange(newDate);
                                            }}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>
                                    <Button 
                                        type="button" 
                                        size="sm" 
                                        className="h-9 px-4 shrink-0"
                                        onClick={() => setOpen(false)}
                                    >
                                        Done
                                    </Button>
                                </div>
                            )}
                            </PopoverContent>
                        </Popover>
                    )}
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}