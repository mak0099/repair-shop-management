export const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "PRODUCT", label: "Product" },
  { value: "SPARE_PART", label: "Spare Part" },
  { value: "ACCESSORY", label: "Accessory" },
]

export const ITEM_TYPE = {
  DEVICE: "DEVICE",
  PART: "PART",
  LOANED: "LOANED"
} as const;

export const ITEM_TYPE_OPTIONS = [
  { value: "DEVICE", label: "Device" },
  { value: "PART", label: "Part" },
  { value: "LOANED", label: "Loaned Item" },
];

export const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
]

export const CONDITION_OPTIONS = [
  { value: "New", label: "New" },
  { value: "Used", label: "Used" },
]