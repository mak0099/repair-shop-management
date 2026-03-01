"use client";

import { useFormContext } from "react-hook-form"; // Changed from useForm, FormProvider
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/forms/text-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { SelectField } from "@/components/forms/select-field"; // Use SelectField if SelectField is missing

import { InvoiceSetup } from "../invoice-setup.schema";
import { useUpdateInvoiceSetup } from "../invoice-setup.api"; // Removed useInvoiceSetup

interface InvoiceSetupFormProps {
  initialData: InvoiceSetup | null | undefined; // Added prop for initialData
}

export function InvoiceSetupForm({ initialData }: InvoiceSetupFormProps) {
  // Removed useInvoiceSetup, as data fetching is now in the parent
  const { mutate: updateConfig, isPending } = useUpdateInvoiceSetup();

  // Get form context from parent FormProvider
  const form = useFormContext<InvoiceSetup>();

  function onSubmit(data: InvoiceSetup) {
    updateConfig(
      { id: initialData?.id || "current", data },
      {
        onSuccess: () => toast.success("Invoice settings updated"),
        onError: (err: Error) => toast.error(err.message),
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding & Layout</CardTitle>
      </CardHeader>
      <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField control={form.control} name="invoicePrefix" label="Invoice Prefix (e.g. INV-)" />
                <TextField control={form.control} name="nextInvoiceNumber" label="Next Invoice No." type="number" />
                <div className="md:col-span-2">
                    {/* If SelectField is missing, replace with TextField/Combobox */}
                  <TextField control={form.control} name="templateSize" label="Paper Size (A4/Thermal)" />
                </div>
                <div className="md:col-span-2">
                  <TextareaField control={form.control} name="termsAndConditions" label="Terms & Conditions" rows={4} />
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Configuration
              </Button>
            </form>
          </Form>
      </CardContent>
    </Card>
  );
}