"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextField } from "@/components/forms/text-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field";

import { shopProfileSchema, ShopProfile } from "../shop-profile.schema";
import { useCreateShopProfile, useUpdateShopProfile } from "../shop-profile.api";
import { CURRENCY_OPTIONS } from "../shop-profile.constants";

interface ShopProfileFormProps {
  initialData?: ShopProfile | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ShopProfileForm({ initialData, onCancel, onSuccess }: ShopProfileFormProps) {
  const { mutate: createProfile, isPending: isCreating } = useCreateShopProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateShopProfile();
  const isPending = isCreating || isUpdating;
  const isEditMode = !!initialData;

  const form = useForm<ShopProfile>({
    resolver: zodResolver(shopProfileSchema),
    defaultValues: initialData || {
      name: "",
      ownerName: "",
      phone: "",
      email: "",
      address: "",
      binNumber: "",
      currency: "BDT",
      invoiceFooterMessage: "",
      logoUrl: "",
      website: "",
    },
  });

  function onSubmit(data: ShopProfile) {
    const mutation = isEditMode ? updateProfile : createProfile;
    const mutationOptions = {
      onSuccess: () => {
        toast.success(`Shop profile ${isEditMode ? 'updated' : 'created'} successfully`);
        onSuccess();
      },
      onError: (err: any) => toast.error(err.message),
    };

    if (isEditMode && initialData) {
      updateProfile({ id: initialData.id, data }, mutationOptions);
    } else {
      createProfile(data, mutationOptions);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField control={form.control} name="name" label="Shop Name" required />
            <TextField control={form.control} name="ownerName" label="Owner Name" required />
            <TextField control={form.control} name="phone" label="Phone Number" required />
            <TextField control={form.control} name="email" label="Email Address" required />
            <div className="md:col-span-2">
              <TextField control={form.control} name="address" label="Full Address" required />
            </div>
            <TextField control={form.control} name="website" label="Website" placeholder="https://example.com" />
            <TextField control={form.control} name="binNumber" label="BIN / Trade License" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial & Invoice Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComboboxWithAdd
              control={form.control}
              name="currency"
              label="Currency"
              options={CURRENCY_OPTIONS}
              required
              placeholder="Select a currency"
              searchPlaceholder="Search currency..."
              noResultsMessage="No currency found."
            />
            <div className="md:col-span-2">
              <TextareaField
                control={form.control}
                name="invoiceFooterMessage"
                label="Invoice Footer Message"
                placeholder="Ex: No return without invoice."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Save Changes" : "Save Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}