import { Attribute } from "../attribute.schema";

const initialAttributes: Attribute[] = [
  {
    id: "attr-ram",
    name: "RAM",
    key: "RAM",
    description: "System memory capacity",
    values: [
      { id: "v-ram-1", value: "4GB", isActive: true },
      { id: "v-ram-2", value: "8GB", isActive: true },
      { id: "v-ram-3", value: "12GB", isActive: true },
    ],
  },
  {
    id: "attr-rom",
    name: "ROM",
    key: "ROM",
    description: "Internal storage capacity",
    values: [
      { id: "v-rom-1", value: "64GB", isActive: true },
      { id: "v-rom-2", value: "128GB", isActive: true },
      { id: "v-rom-3", value: "256GB", isActive: true },
    ],
  },
  {
    id: "attr-color",
    name: "Color",
    key: "COLOR",
    description: "Device colors",
    values: [
      { id: "v-col-1", value: "Black", isActive: true },
      { id: "v-col-2", value: "White", isActive: true },
      { id: "v-col-3", value: "Gold", isActive: true },
    ],
  },
  {
    id: "attr-grade",
    name: "Grade",
    key: "GRADE",
    description: "Device quality or condition grade",
    values: [
      { id: "v-grade-1", value: "Grade A", isActive: true },
      { id: "v-grade-2", value: "Grade B", isActive: true },
      { id: "v-grade-3", value: "Grade C", isActive: true },
      { id: "v-grade-4", value: "New", isActive: true },
      { id: "v-grade-5", value: "Refurbished", isActive: true },
    ],
  },
  {
    id: "attr-warranty",
    name: "Warranty",
    key: "WARRANTY",
    description: "Device warranty period",
    values: [
      { id: "v-warr-1", value: "1 Month", isActive: true },
      { id: "v-warr-2", value: "3 Months", isActive: true },
      { id: "v-warr-3", value: "6 Months", isActive: true },
      { id: "v-warr-4", value: "1 Year", isActive: true },
    ],
  },
  {
    id: "attr-accessories",
    name: "Accessories",
    key: "ACCESSORIES",
    description: "Included accessories with the device",
    values: [
      { id: "v-acc-1", value: "Charger", isActive: true },
      { id: "v-acc-2", value: "Cable", isActive: true },
      { id: "v-acc-3", value: "Box", isActive: true },
      { id: "v-acc-4", value: "Headphones", isActive: true },
    ],
  },
];

export const mockAttributes: Attribute[] = initialAttributes;