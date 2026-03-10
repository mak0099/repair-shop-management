"use client"

import { useEffect } from "react";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InvoiceSetupProvider } from "../invoice-setup-modal-context"
import { InvoiceSetupForm } from "./invoice-setup-form"
import { InvoicePreview } from "./invoice-preview"
import { invoiceSetupSchema, InvoiceSetup } from "../invoice-setup.schema";
import { useInvoiceSetup } from "../invoice-setup.api";

export function InvoiceSetupManager() {
  const { data: initialData, isLoading } = useInvoiceSetup();

  const form = useForm<InvoiceSetup>({
    /**
     * FIX: Standardized casting to 'Resolver' to bridge the gap between 
     * Zod inferred types and manual interfaces.
     */
    resolver: zodResolver(invoiceSetupSchema) as unknown as Resolver<InvoiceSetup>,
    
    // Ensure all keys are present to satisfy the Type definition
    defaultValues: {
      invoicePrefix: "",
      nextInvoiceNumber: 1,
      templateSize: "A4",
      termsAndConditions: "",
      showLogo: true, // Added missing field
      showSignature: false,
      notes: "",
    },
  });

  // Sync server data into form state
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  if (isLoading) return <div className="p-10 text-center text-slate-500 italic">Loading configuration...</div>;

  return (
    <InvoiceSetupProvider>
      <FormProvider {...form}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
          {/* Configuration Side */}
          <div className="space-y-6">
            <InvoiceSetupForm initialData={initialData} />
          </div>
          
          {/* Live Preview Side */}
          <div className="sticky top-6">
            <InvoicePreview />
          </div>
        </div>
      </FormProvider>
    </InvoiceSetupProvider>
  )
}