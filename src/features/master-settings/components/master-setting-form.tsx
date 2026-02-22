"use client"

import { useForm, useFieldArray, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, Save, Loader2, Wrench } from "lucide-react"
import { toast } from "sonner"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/forms/text-field"
import { masterSettingSchema, MasterSetting } from "../master-setting.schema"
import { useUpdateMasterSetting } from "../master-setting.api";

interface MasterSettingFormProps {
  initialData?: MasterSetting;
  onSuccess: (data: MasterSetting) => void;
}

export function MasterSettingForm({ initialData, onSuccess }: MasterSettingFormProps) {
  // Using the Master Setting specific update hook
  const { mutate: updateMaster, isPending } = useUpdateMasterSetting()

  const form = useForm<MasterSetting>({
    resolver: zodResolver(masterSettingSchema),
    defaultValues: initialData || { name: "", key: "", values: [] }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "values"
  })

  function onSubmit(data: MasterSetting) {
    if (!initialData?.id) {
      toast.error("Cannot update setting without an ID.");
      return;
    }

    updateMaster({ id: initialData.id, data }, {
      onSuccess: (updatedData) => {
        toast.success(`"${updatedData.name}" updated successfully!`)
        onSuccess(updatedData)
      },
      onError: (err) => toast.error(err.message)
    })
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="bg-amber-50/50 p-3 rounded-md border border-dashed border-amber-200 text-center">
            <span className="text-xs font-bold uppercase text-amber-700 tracking-widest flex items-center justify-center gap-2">
              <Wrench className="h-3 w-3" /> System Configuration: {initialData?.name}
            </span>
          </div>

          <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-end group animate-in fade-in slide-in-from-top-1">
                <div className="flex-1">
                  <TextField 
                    control={form.control} 
                    name={`values.${index}.value`} 
                    label={index === 0 ? "Entry Name" : ""} 
                    placeholder="e.g. Bkash, Global, Pending..." 
                    inputClassName="h-9 focus-visible:ring-amber-500"
                  />
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm border rounded-md border-dashed">
                No values added to this master yet.
              </div>
            )}
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full border-dashed h-9 text-xs hover:bg-amber-50" 
            onClick={() => append({ value: "" })}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New {initialData?.name} Entry
          </Button>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" className="flex-1 bg-slate-900" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Configuration
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  )
}