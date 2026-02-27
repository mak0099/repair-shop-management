import { InvoiceSetup } from "../invoice-setup.schema";

export const invoiceSetupMock: InvoiceSetup = {
  id: "inv-config-001",
  invoicePrefix: "AM",
  nextInvoiceNumber: 1001,
  templateSize: "A4",
  showLogo: true,
  showSignature: true,
  termsAndConditions: "1. Warranty covers only manufacturing defects.\n2. No cash refund after purchase.",
  notes: "Please check the product before leaving the counter.",
};