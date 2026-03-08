"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextField } from "@/components/forms/text-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { SelectField } from "@/components/forms/select-field";
import { FormFooter } from "@/components/forms/form-footer";

import { shopProfileSchema, ShopProfile } from "../shop-profile.schema";
import { useCreateShopProfile, useUpdateShopProfile } from "../shop-profile.api";
import { CURRENCY_OPTIONS, DATE_FORMAT_OPTIONS } from "../shop-profile.constants";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(shopProfileSchema) as any,
    /**
     * FIX: Ensuring currency is never undefined in defaultValues.
     * This aligns with the strict string requirement in the schema.
     */
    defaultValues: initialData || {
      name: "",
      ownerName: "",
      slogan: "",
      phone: "",
      email: "",
      address: "",
      binNumber: "",
      currency: "BDT", 
      dateFormat: "dd MMM yyyy",
      invoiceFooterMessage: "",
      logoUrl: "",
      taxRate: 0,
      bankAccountInfo: "",
      returnPolicy: "",
      termsAndConditions: "",
      website: "",
    },
  });

  function onSubmit(data: ShopProfile) {
    const mutationOptions = {
      onSuccess: () => {
        toast.success(`Shop profile ${isEditMode ? 'updated' : 'created'} successfully`);
        onSuccess();
      },
      onError: (err: Error) => toast.error(err.message),
    };

    if (isEditMode && initialData?.id) {
      updateProfile({ id: initialData.id, data }, mutationOptions);
    } else {
      createProfile(data, mutationOptions);
    }
  }

  return (
    <Form {...form}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg font-semibold text-slate-800">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <TextField control={form.control as any} name="name" label="Shop Name" required />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <TextField control={form.control as any} name="slogan" label="Slogan / Tagline" placeholder="e.g. Professional Repair Services" />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <TextField control={form.control as any} name="ownerName" label="Owner Name" required />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <TextField control={form.control as any} name="phone" label="Phone Number" required />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <TextField control={form.control as any} name="email" label="Email Address" required />
            <div className="md:col-span-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <TextField control={form.control as any} name="address" label="Full Address" required />
            </div>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <TextField control={form.control as any} name="website" label="Website" placeholder="https://example.com" />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <TextField control={form.control as any} name="binNumber" label="BIN / Trade License" />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg font-semibold text-slate-800">Financial & Invoice Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
            <SelectField
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={form.control as any}
              name="currency"
              label="Primary Currency"
              options={CURRENCY_OPTIONS}
              required
              placeholder="Select currency"
              searchPlaceholder="Search currency..."
              noResultsMessage="No currency found."
            />
            <SelectField
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              control={form.control as any}
              name="dateFormat"
              label="Date Format"
              options={DATE_FORMAT_OPTIONS}
              required
              placeholder="Select date format"
            />
            <TextField 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={form.control as any} 
                name="taxRate" 
                label="Default Tax Rate (%)" 
                type="number" 
                placeholder="0" 
            />
            <div className="md:col-span-2">
              <TextareaField
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={form.control as any}
                name="bankAccountInfo"
                label="Bank Account Details"
                placeholder="Bank Name: ...&#10;Account No: ...&#10;IBAN: ..."
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <TextareaField
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={form.control as any}
                name="invoiceFooterMessage"
                label="Invoice Footer Message"
                placeholder="Ex: Goods once sold are not returnable."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg font-semibold text-slate-800">Policies & Terms</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 pt-6">
             <TextareaField 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={form.control as any}
                name="termsAndConditions" 
                label="General Terms & Conditions (Quotations)" 
                placeholder="Terms for estimates and quotations..." 
                rows={4}
             />
             <TextareaField 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                control={form.control as any}
                name="returnPolicy" 
                label="Return Policy (Receipts)" 
                placeholder="Policy for returns and refunds..." 
                rows={4}
             />
          </CardContent>
        </Card>

        <FormFooter
          isPending={isPending}
          isEditMode={isEditMode}
          onCancel={onCancel}
          onReset={() => form.reset()}
          saveLabel={isEditMode ? "Save Changes" : "Create Profile"}
          className="border-t pt-6"
        />
      </form>
    </Form>
  );
}