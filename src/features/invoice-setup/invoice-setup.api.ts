"use client"

import { createApiHooksFor } from "@/lib/api-factory";
import { InvoiceSetup } from "./invoice-setup.schema";

const invoiceSetupApiHooks = createApiHooksFor<InvoiceSetup, InvoiceSetup>("invoice-setup");

export const useInvoiceSetup = () => invoiceSetupApiHooks.useGetOne("current", {
  staleTime: 1000 * 60 * 10, // 10 minutes
  gcTime: 1000 * 60 * 30,    // 30 minutes (formerly cacheTime)
});
export const useUpdateInvoiceSetup = invoiceSetupApiHooks.useUpdate;