import { InvoiceSetup } from "../invoice-setup.schema";

/**
 * Updated mock data with Italian Terms and Conditions 
 * transcribed from the provided receipt image.
 */
export const invoiceSetupMock: InvoiceSetup = {
  id: "inv-config-001",
  invoicePrefix: "AM",
  nextInvoiceNumber: 1001,
  dateFormat: "dd/MM/yyyy",
  templateSize: "A4",
  showLogo: true,
  showSignature: true,

  // Shop Identity
  shopName: "OFFICINA RIPARAZIONI ROSSI",
  shopAddress: "Via Montenapoleone, 20121 Milano MI, Italia",
  shopContact: "Tel: +39 02 1234 5678",

  // Labels
  invoiceTitle: "RICEVUTA",
  invoiceNumberLabel: "Fattura N",
  dateLabel: "Data",
  customerInfoLabel: "Dati Cliente",
  paymentMethodLabel: "Metodo di Pagamento",
  
  itemColumnLabel: "Descrizione",
  quantityColumnLabel: "Qtà",
  priceColumnLabel: "Prezzo",
  totalColumnLabel: "Totale",
  
  subtotalLabel: "Subtotale",
  taxLabel: "IVA",
  discountLabel: "Sconto",
  grandTotalLabel: "Totale Generale",
  amountPaidLabel: "Importo Pagato",

  // Footer
  thankYouMessage: "Grazie per averci scelto!",
  termsAndConditions: 
    "1) In caso il sigillo di garanzia presente all'interno fosse manomesso la garanzia è persa;\n" +
    "2) Nel caso fosse presente un codice di sblocco non fornito dal cliente il negozio declina ogni responsabilità grave del collaudo;\n" +
    "3) Se passati 3 mesi dalla data di uscita e il dispositivo non è stato ancora ritirato l'azienda potrà rottamarlo per mancata possibilità di trattenerlo ulteriormente in magazzino; Si rende inoltre noto al cliente che, il negozio in qualità del suo legale rappresentante, esegue il trattamento di dati personali forniti, il cliente può richiederne la modifica, la cancellazione, l'integrazione o la trasformazione in forma anonima.\n" +
    "4) Autorizzato il trattamento dei dati personali in base all'art. 13 del D. Lgs. 196/2003 e all'art. 13 GDPR 679/16\n\n" +
    "Accetto con la presente firma tutte le clausole sopra citate e il preventivo emesso",
  signatureLabel: "Firma Autorizzata",
  notes: "Please check the product before leaving the counter.",
};