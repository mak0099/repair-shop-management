"use client"

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InvoiceSetupProvider } from "../invoice-setup-modal-context"
import { InvoiceSetupForm } from "./invoice-setup-form"
import { InvoicePreview } from "./invoice-preview"
import { invoiceSetupSchema, InvoiceSetup } from "../invoice-setup.schema";
import { useInvoiceSetup } from "../invoice-setup.api";

export function InvoiceSetupManager() {
  const { data: initialData, isLoading } = useInvoiceSetup();

  const form = useForm<InvoiceSetup>({
    resolver: zodResolver(invoiceSetupSchema),
    // Provide a valid, type-correct default object for the initial render.
    // This resolves the ZodError, as `useForm` is now initialized with a valid shape.
    // These values are temporary and will be replaced by `form.reset(initialData)`
    // in the useEffect hook below once the actual data is loaded.
    defaultValues: {
      invoicePrefix: "",
      nextInvoiceNumber: 1,
      templateSize: "A4",
      termsAndConditions: "",
      showSignature: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  if (isLoading) return <div className="p-10 text-center">Loading configuration...</div>;

  return (
    <InvoiceSetupProvider>
      <FormProvider {...form}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InvoiceSetupForm initialData={initialData} />
          <InvoicePreview />
        </div>
      </FormProvider>
    </InvoiceSetupProvider>
  )
}