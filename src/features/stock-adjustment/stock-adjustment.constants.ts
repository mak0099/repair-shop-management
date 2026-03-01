export const STOCK_ADJUSTMENT_TYPE_OPTIONS = [
  { value: "IN", label: "Stock In" },
  { value: "OUT", label: "Stock Out" },
];

export const STOCK_ADJUSTMENT_REASON_OPTIONS = [
  { value: "Inventory Audit", label: "Inventory Audit" },
  { value: "Damage", label: "Damage / Broken" },
  { value: "Theft", label: "Theft / Loss" },
  { value: "Return", label: "Return to Supplier" },
  { value: "Restock", label: "Restock" },
  { value: "Correction", label: "Data Entry Correction" }, // নতুন
  { value: "Testing Issue", label: "Testing Failure" },    // নতুন
  { value: "Other", label: "Other" },
];