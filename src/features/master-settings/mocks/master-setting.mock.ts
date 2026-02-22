import { MasterSetting } from "../master-setting.schema";

const initialMasterSettings: MasterSetting[] = [
  {
    id: "mst-device-type",
    name: "Device Type",
    key: "DEVICE_TYPE",
    description: "Regional or variant types of devices",
    values: [
      { id: "m-dt-1", value: "Global", isActive: true },
      { id: "m-dt-2", value: "Official", isActive: true },
      { id: "m-dt-3", value: "USA Variant", isActive: true },
      { id: "m-dt-4", value: "Indian Version", isActive: true },
    ],
  },
  {
    id: "mst-payment-method",
    name: "Payment Methods",
    key: "PAYMENT_METHOD",
    description: "Available methods for transactions",
    values: [
      { id: "m-pm-1", value: "Cash", isActive: true },
      { id: "m-pm-2", value: "Bkash", isActive: true },
      { id: "m-pm-3", value: "Nagad", isActive: true },
      { id: "m-pm-4", value: "Card", isActive: true },
    ],
  },
  {
    id: "mst-expense-category",
    name: "Expense Category",
    key: "EXPENSE_CATEGORY",
    description: "Categories for shop expenses",
    values: [
      { id: "m-ec-1", value: "Rent", isActive: true },
      { id: "m-ec-2", value: "Snacks/Food", isActive: true },
      { id: "m-ec-3", value: "Utility Bills", isActive: true },
      { id: "m-ec-4", value: "Salary", isActive: true },
    ],
  },
  {
    id: "mst-qc-item",
    name: "QC Items",
    key: "QC_ITEM",
    description: "Points to check during device testing",
    values: [
      { id: "m-qc-1", value: "Display", isActive: true },
      { id: "m-qc-2", value: "Battery", isActive: true },
      { id: "m-qc-3", value: "Camera", isActive: true },
      { id: "m-qc-4", value: "FaceID/Fingerprint", isActive: true },
      { id: "m-qc-5", value: "Speaker", isActive: true },
    ],
  },
  {
    id: "mst-repair-status",
    name: "Repair Status",
    key: "REPAIR_STATUS",
    description: "Stages of a repair job",
    values: [
      { id: "m-rs-1", value: "Pending", isActive: true },
      { id: "m-rs-2", value: "In Progress", isActive: true },
      { id: "m-rs-3", value: "Fixed", isActive: true },
      { id: "m-rs-4", value: "Returned", isActive: true },
    ],
  },
  {
    id: "mst-return-status",
    name: "Return Status",
    key: "RETURN_STATUS",
    description: "Status of sales returns",
    values: [
      { id: "m-rt-1", value: "Refunded", isActive: true },
      { id: "m-rt-2", value: "Replaced", isActive: true },
      { id: "m-rt-3", value: "Rejected", isActive: true },
    ],
  },
  {
    id: "mst-designation",
    name: "Designations",
    key: "DESIGNATION",
    description: "Employee roles in the shop",
    values: [
      { id: "m-des-1", value: "Manager", isActive: true },
      { id: "m-des-2", value: "Salesman", isActive: true },
      { id: "m-des-3", value: "Technician", isActive: true },
    ],
  },
];

export const mockMasterSettings: MasterSetting[] = initialMasterSettings;