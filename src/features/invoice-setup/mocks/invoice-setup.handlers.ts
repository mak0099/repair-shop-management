import { delay, http, HttpResponse } from "msw";
import { invoiceSetupMock } from "./invoice-setup.mock";
import { InvoiceSetup } from "../invoice-setup.schema";

/**
 * Explicitly typing 'currentConfig' as InvoiceSetup ensures 
 * that all properties like 'id' are recognized by the compiler.
 */
let currentConfig: InvoiceSetup = { ...invoiceSetupMock };

export const invoiceSetupHandlers = [
  // GET invoice setup (singleton resource accessed by 'current')
  http.get("*/invoice-setup/:id", async ({ params }) => {
    await delay(500);
    if (params.id !== "current") {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(currentConfig);
  }),

  /**
   * FIX: Changed generic type from <never, ...> to <{ id: string }, ...>
   * This allows params.id to be correctly typed and accessible.
   */
  http.patch<{ id: string }, Partial<InvoiceSetup>>(
    "*/invoice-setup/:id",
    async ({ request, params }) => {
      await delay(800);

      // Verify if the requested ID matches our mock configuration ID
      if (params.id !== "current" && params.id !== currentConfig.id) {
        return new HttpResponse(null, { status: 404 });
      }

      const updatedData = (await request.json()) as Partial<InvoiceSetup>;
      
      // Update local mock state
      currentConfig = { 
        ...currentConfig, 
        ...updatedData,
        // Ensure id remains consistent
        id: currentConfig.id 
      };

      return HttpResponse.json(currentConfig);
    }
  ),
];