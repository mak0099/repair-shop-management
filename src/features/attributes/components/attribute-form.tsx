"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/forms/text-field"
import { FormFooter } from "@/components/forms/form-footer"
import { attributeSchema, type Attribute } from "../attribute.schema"
import { useUpdateAttribute } from "../attribute.api"

interface AttributeFormProps {
  initialData?: Attribute;
  onSuccess: (data: Attribute) => void;
}

export function AttributeForm({ initialData, onSuccess }: AttributeFormProps) {
  const { mutate: updateAttribute, isPending } = useUpdateAttribute()

  /**
   * We initialize the form using the strict Attribute type inferred from Zod.
   */
  const form = useForm<Attribute>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      id: initialData?.id || "",
      name: initialData?.name || "",
      key: initialData?.key || "",
      description: initialData?.description || "",
      /**
       * Crucial: We map the initial values to ensure isActive is never undefined.
       * This resolves the boolean | undefined mismatch.
       */
      values: initialData?.values?.map(v => ({
        id: v.id,
        value: v.value,
        isActive: typeof v.isActive === 'boolean' ? v.isActive : true
      })) || []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "values"
  })

  function onSubmit(data: Attribute) {
    if (!initialData?.id) {
      toast.error("Resource ID is required for updates.")
      return
    }

    updateAttribute(
      { id: initialData.id, data }, 
      {
        onSuccess: (updatedData) => {
          toast.success("Attribute updated successfully.")
          onSuccess(updatedData)
        },
        onError: (err) => toast.error(err.message)
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
                Values for {initialData?.name}
            </h3>
            <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="h-8"
                onClick={() => append({ value: "", isActive: true })}
            >
                <Plus className="mr-2 h-3.5 w-3.5" /> Add Value
            </Button>
        </div>

        <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-3 min-h-[300px] max-h-[60vh]">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex-1">
                <TextField 
                  control={form.control} 
                  name={`values.${index}.value`} 
                  placeholder="Value (e.g. Red, 8GB)"
                  className="mb-0"
                />
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => remove(index)}
                title="Remove option"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {fields.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-slate-50/50">
              <p className="text-sm text-muted-foreground mb-2">No options defined yet.</p>
              <Button 
                type="button" 
                variant="link" 
                size="sm"
                onClick={() => append({ value: "", isActive: true })}
              >
                Add your first option
              </Button>
            </div>
          )}
        </div>

        <FormFooter
          isPending={isPending}
          isEditMode={true}
          onCancel={() => onSuccess(initialData!)}
          onReset={() => form.reset()}
          saveLabel="Save Changes"
          className="mt-auto"
        />
      </form>
    </Form>
  )
}