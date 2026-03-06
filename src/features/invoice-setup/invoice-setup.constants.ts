export const INVOICE_PAPER_SIZES = {
  A4: "A4",
  A5: "A5",
  THERMAL_80: "Thermal 80mm",
} as const;

export const INVOICE_PAPER_SIZE_OPTIONS = [
  { label: "A4 (Standard)", value: INVOICE_PAPER_SIZES.A4 },
  { label: "A5 (Half Page)", value: INVOICE_PAPER_SIZES.A5 },
  { label: "Thermal (80mm POS)", value: INVOICE_PAPER_SIZES.THERMAL_80 },
];