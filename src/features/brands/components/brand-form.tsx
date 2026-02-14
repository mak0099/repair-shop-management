"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ImageUploadField } from "@/components/forms/image-upload-field"

import { brandSchema, BrandFormValues } from "../brand.schema"
import { Brand } from "../brand.schema"
import { useCreateBrand, useUpdateBrand } from "../brand.api"
import { BRANDS_BASE_HREF } from "@/config/paths"

interface BrandFormProps {
  initialData?: Brand | null
  onSuccess?: (data: Brand) => void
}

export function BrandForm({ initialData, onSuccess }: BrandFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { mutate: createBrand, isPending: isCreating } = useCreateBrand()
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand()

  const isPending = isCreating || isUpdating
  const isEditMode = !!initialData

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: initialData || {
      name: "",
      logo: null,
      isActive: true,
    },
  })

  function onSubmit(data: BrandFormValues) {
    if (isEditMode && initialData) {
      updateBrand(
        { id: initialData.id, data },
        {
          onSuccess: (updatedBrand: Brand) => {
            toast.success("Brand updated successfully")
            queryClient.invalidateQueries({ queryKey: ["brands"] })
            if (onSuccess) {
              onSuccess(updatedBrand)
            } else {
              router.push(BRANDS_BASE_HREF)
            }
          },
          onError: (error) => {
            toast.error("Failed to update brand: " + error.message)
          },
        }
      )
    } else {
      createBrand(data, {
        onSuccess: (newBrand) => {
          toast.success("Brand created successfully")
          queryClient.invalidateQueries({ queryKey: ["brands"] })
          if (onSuccess) {
            onSuccess(newBrand)
          } else {
            router.push(BRANDS_BASE_HREF)
          }
        },
        onError: (error) => {
          toast.error("Failed to create brand: " + error.message)
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g., Apple" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <ImageUploadField
          control={form.control}
          name="logo"
          label="Logo"
          initialImage={initialData?.logo}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Is Active?</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Save Changes" : "Save Brand"}
          </Button>
        </div>
      </form>
    </Form>
  )
}