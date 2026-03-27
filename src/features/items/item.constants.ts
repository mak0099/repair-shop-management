export const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "PRODUCT", label: "Product" },
  { value: "SPARE_PART", label: "Spare Part" },
  { value: "ACCESSORY", label: "Accessory" },
]

export const ITEM_TYPE = {
  DEVICE: "DEVICE",
  PART: "PART",
  SERVICE: "SERVICE",
  LOANER: "LOANER"
} as const;

export const ITEM_TYPE_OPTIONS = [
  { value: "DEVICE", label: "Device" },
  { value: "PART", label: "Part" },
  { value: "SERVICE", label: "Service" },
  { value: "LOANER", label: "Loaner Unit" },
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

// Color scheme for Item Types (used in tabs and badges)
export const ITEM_TYPE_COLORS = {
  DEVICE: {
    tab: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900",
  },
  PART: {
    tab: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    badge: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900",
  },
  SERVICE: {
    tab: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    badge: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900",
  },
  LOANER: {
    tab: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900",
  },
} as const;