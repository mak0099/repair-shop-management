import { createApiHooksFor } from "@/lib/api-factory";
import { InvoiceSetup } from "./invoice-setup.schema";

const invoiceSetupApiHooks = createApiHooksFor<InvoiceSetup, InvoiceSetup>("invoice-setup");

export const useInvoiceSetup = () => invoiceSetupApiHooks.useGetOne("current");
export const useUpdateInvoiceSetup = invoiceSetupApiHooks.useUpdate;