import { delay, http, HttpResponse } from "msw";
import { invoiceSetupMock } from "./invoice-setup.mock";
import { InvoiceSetup } from "../invoice-setup.schema";

let currentConfig = { ...invoiceSetupMock };

export const invoiceSetupHandlers = [
  // Get invoice setup (assuming 'current' is the ID for the singleton resource)
  http.get("*/invoice-setup/:id", async ({ params }) => {
    await delay(500);
    if (params.id !== "current") {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(currentConfig);
  }),

  // Update invoice setup (using PATCH to match api-factory's useUpdate)
  http.patch<never, Partial<InvoiceSetup>>(
    "*/invoice-setup/:id",
    async ({ request, params }) => {
    await delay(800);
      // The API call for update uses the actual ID from the data.
      // We should check if the provided ID matches the ID of our mock config.
      if (params.id !== currentConfig.id) {
        return new HttpResponse(null, { status: 404 });
      }
      const updatedData = (await request.json()) as Partial<InvoiceSetup>;
    currentConfig = { ...currentConfig, ...updatedData };
    return HttpResponse.json(currentConfig);
  }),
];